import "server-only";

import { Prisma } from "@prisma/client";

import { calculateDiscount } from "@/features/admin/discount";
import { prisma } from "@/lib/prisma";

export type CheckoutCommand = {
  userId: number;
  paymentMethod: "PROMPTPAY" | "CREDIT_CARD";
  promotionCode: string | null;
  lines: Array<{ productId: number; quantity: number }>;
};

export type CheckoutSuccess = {
  orderId: number;
  total: string;
};

type CheckoutDependencies = {
  transaction<T>(
    operation: (transaction: Prisma.TransactionClient) => Promise<T>,
  ): Promise<T>;
  now(): Date;
};

const defaultDependencies: CheckoutDependencies = {
  transaction: (operation) =>
    prisma.$transaction((transaction) => operation(transaction)),
  now: () => new Date(),
};

type NormalizedLine = {
  productId: number;
  quantity: number;
};

type CheckoutDiscount = {
  id: number;
  type: string;
  value: Prisma.Decimal;
  minimumOrderAmount: Prisma.Decimal | null;
  maximumDiscountAmount: Prisma.Decimal | null;
  startsAt: Date;
  endsAt: Date;
  usageLimit: number | null;
  perUserLimit: number | null;
  isActive: boolean;
  archivedAt: Date | null;
  _count: { usages: number };
  usages: Array<{ id: number }>;
};

function normalizeLines(
  lines: CheckoutCommand["lines"],
): NormalizedLine[] {
  const quantities = new Map<number, number>();

  for (const line of lines) {
    if (
      !Number.isInteger(line.productId) ||
      line.productId <= 0 ||
      !Number.isInteger(line.quantity) ||
      line.quantity <= 0
    ) {
      throw new Error("Invalid checkout line");
    }

    quantities.set(
      line.productId,
      (quantities.get(line.productId) ?? 0) + line.quantity,
    );
  }

  if (quantities.size === 0) {
    throw new Error("Cart is empty");
  }

  return Array.from(quantities, ([productId, quantity]) => ({
    productId,
    quantity,
  }));
}

function isDiscountAvailable(
  discount: {
    archivedAt: Date | null;
    isActive: boolean;
    startsAt: Date;
    endsAt: Date;
    usageLimit: number | null;
    perUserLimit: number | null;
    _count: { usages: number };
    usages: Array<{ id: number }>;
  },
  now: Date,
): boolean {
  return (
    discount.archivedAt === null &&
    discount.isActive &&
    discount.startsAt <= now &&
    discount.endsAt >= now &&
    (discount.usageLimit === null ||
      discount._count.usages < discount.usageLimit) &&
    (discount.perUserLimit === null ||
      discount.usages.length < discount.perUserLimit)
  );
}

export async function createOrderFromCart(
  command: CheckoutCommand,
  dependencies = defaultDependencies,
): Promise<CheckoutSuccess> {
  if (!Number.isInteger(command.userId) || command.userId <= 0) {
    throw new Error("Invalid checkout user");
  }

  if (
    command.paymentMethod !== "PROMPTPAY" &&
    command.paymentMethod !== "CREDIT_CARD"
  ) {
    throw new Error("Invalid payment method");
  }

  const lines = normalizeLines(command.lines);
  const now = dependencies.now();

  return dependencies.transaction(async (transaction) => {
    const products = await transaction.product.findMany({
      where: {
        id: { in: lines.map((line) => line.productId) },
        archivedAt: null,
      },
      select: {
        id: true,
        name: true,
        price: true,
        stock: true,
        archivedAt: true,
      },
    });
    const productsById = new Map(
      products.map((product) => [product.id, product]),
    );

    const orderLines = lines.map((line) => {
      const product = productsById.get(line.productId);
      if (!product || product.archivedAt !== null) {
        throw new Error("Product is unavailable");
      }
      if (product.stock < line.quantity) {
        throw new Error("Insufficient product stock");
      }

      return {
        ...line,
        price: new Prisma.Decimal(product.price),
      };
    });

    const subtotal = orderLines.reduce(
      (sum, line) => sum.add(line.price.mul(line.quantity)),
      new Prisma.Decimal(0),
    );

    const normalizedCode = command.promotionCode?.trim().toUpperCase() || null;
    let discount: CheckoutDiscount | null = null;
    let discountAmount = new Prisma.Decimal(0);

    if (normalizedCode) {
      discount = await transaction.discount.findUnique({
        where: { code: normalizedCode },
        include: {
          _count: { select: { usages: true } },
          usages: {
            where: { userId: command.userId },
            select: { id: true },
          },
        },
      });

      if (
        !discount ||
        !isDiscountAvailable(discount, now) ||
        (discount.minimumOrderAmount !== null &&
          subtotal.lt(new Prisma.Decimal(discount.minimumOrderAmount))) ||
        (discount.type !== "PERCENT" && discount.type !== "FIXED")
      ) {
        throw new Error("Promotion code is unavailable");
      }

      discountAmount = new Prisma.Decimal(
        calculateDiscount({
          subtotal: subtotal.toFixed(2),
          type: discount.type,
          value: new Prisma.Decimal(discount.value).toFixed(2),
          maximumDiscountAmount:
            discount.maximumDiscountAmount === null
              ? null
              : new Prisma.Decimal(
                  discount.maximumDiscountAmount,
                ).toFixed(2),
        }),
      );
    }

    const total = subtotal.sub(discountAmount);

    for (const line of orderLines) {
      const updated = await transaction.product.updateMany({
        where: {
          id: line.productId,
          archivedAt: null,
          stock: { gte: line.quantity },
        },
        data: { stock: { decrement: line.quantity } },
      });

      if (updated.count !== 1) {
        throw new Error("Product stock changed during checkout");
      }
    }

    const order = await transaction.order.create({
      data: {
        userId: command.userId,
        subtotal,
        discountAmount,
        total,
        discountCode: discount ? normalizedCode : null,
        status: "COMPLETED",
        paymentMethod: command.paymentMethod,
        orderItems: {
          create: orderLines.map((line) => ({
            productId: line.productId,
            quantity: line.quantity,
            price: line.price,
          })),
        },
      },
      select: {
        id: true,
        orderItems: {
          select: {
            id: true,
            productId: true,
          },
        },
      },
    });

    for (const item of order.orderItems) {
      let unusedKey = await transaction.licenseKey.findFirst({
        where: {
          productId: item.productId,
          isUsed: false,
          orderItemId: null,
        },
      });

      if (!unusedKey) {
        const randomKeyStr = `SKS-${item.productId}-${Math.random()
          .toString(36)
          .substring(2, 10)
          .toUpperCase()}-AUTO`;
        unusedKey = await transaction.licenseKey.create({
          data: {
            key: randomKeyStr,
            productId: item.productId,
            isUsed: false,
          },
        });
      }

      await transaction.licenseKey.update({
        where: { id: unusedKey.id },
        data: {
          isUsed: true,
          orderItemId: item.id,
        },
      });
    }

    if (discount && normalizedCode) {
      await transaction.discountUsage.create({
        data: {
          discountId: discount.id,
          userId: command.userId,
          orderId: order.id,
          codeSnapshot: normalizedCode,
          subtotalSnapshot: subtotal,
          discountAmount,
          totalSnapshot: total,
        },
      });
    }

    return {
      orderId: order.id,
      total: total.toFixed(2),
    };
  });
}
