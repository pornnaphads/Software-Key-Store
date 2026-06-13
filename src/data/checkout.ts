import "server-only";

import { Prisma } from "@prisma/client";

import { calculateDiscount } from "@/features/admin/discount";
import { decryptKey, encryptKey } from "@/lib/encryption";
import { sendOrderConfirmationEmail } from "@/lib/mailer";
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

  // Fetch user info for email
  const user = await prisma.user.findUnique({
    where: { id: command.userId },
    select: { email: true, firstName: true, lastName: true },
  });

  return dependencies.transaction(async (transaction) => {
    const products = await transaction.product.findMany({
      where: {
        id: { in: lines.map((line) => line.productId) },
      },
      select: {
        id: true,
        name: true,
        price: true,
        stock: true,
        key: true,
      },
    });
    const productsById = new Map(
      products.map((product) => [product.id, product]),
    );

    const orderLines = lines.map((line) => {
      const product = productsById.get(line.productId);
      if (!product) {
        throw new Error("Product is unavailable");
      }
      const quantityInStock = product.stock;
      if (quantityInStock < line.quantity) {
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

    const discountAmount = new Prisma.Decimal(0);
    const total = subtotal.sub(discountAmount);

    for (const line of orderLines) {
      const updated = await transaction.product.updateMany({
        where: {
          id: line.productId,
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
        total,
        status: "COMPLETED",
        orderItems: {
          create: orderLines.map((line) => ({
            productId: line.productId,
            quantity: line.quantity,
            price: line.price,
            orderStatus: "COMPLETED",
            userId: command.userId,
          })),
        },
      },
      select: {
        id: true,
        orderItems: {
          select: {
            id: true,
            productId: true,
            quantity: true,
          },
        },
      },
    });

    // Assign keys from ProductKey table to OrderItems
    for (const item of order.orderItems) {
      const availableKeys = await transaction.productKey.findMany({
        where: {
          productId: item.productId,
          salesStatus: "AVAILABLE",
        },
        take: item.quantity,
      });

      if (availableKeys.length > 0) {
        await transaction.productKey.updateMany({
          where: {
            id: { in: availableKeys.map((k) => k.id) },
          },
          data: {
            salesStatus: "SOLD",
            orderDetailId: item.id,
          },
        });
      }

      // If we don't have enough keys in database, dynamically generate the remainder
      if (availableKeys.length < item.quantity) {
        const missingCount = item.quantity - availableKeys.length;
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        const segment = () => Array.from({ length: 5 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
        
        for (let i = 0; i < missingCount; i++) {
          const generatedKey = segment() + "-" + segment() + "-" + segment() + "-" + segment() + "-" + segment();
          await transaction.productKey.create({
            data: {
              productKey: encryptKey(generatedKey),
              salesStatus: "SOLD",
              productId: item.productId,
              orderDetailId: item.id,
            },
          });
        }
      }
    }

    const result = {
      orderId: order.id,
      total: total.toFixed(2),
    };

    // Collect assigned keys for email (decrypt for display)
    const emailItems = await Promise.all(
      order.orderItems.map(async (item) => {
        const product = productsById.get(item.productId)!;
        const assignedKeys = await transaction.productKey.findMany({
          where: { orderDetailId: item.id },
          select: { productKey: true },
        });
        return {
          productName: product.name,
          quantity: item.quantity,
          price: new Prisma.Decimal(product.price).toFixed(2),
          keys: assignedKeys.map((k) => decryptKey(k.productKey)),
        };
      }),
    );

    // Send confirmation email (non-blocking)
    if (user?.email) {
      const orderDate = new Date();
      sendOrderConfirmationEmail({
        customerName: `${user.firstName} ${user.lastName}`,
        customerEmail: user.email,
        orderId: order.id,
        orderDate,
        items: emailItems,
        total: total.toFixed(2),
      }).catch((err) => console.error("Failed to send order email:", err));
    }

    return result;
  });
}
