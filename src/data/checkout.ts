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
  giftEmail?: string | null;
  giftMessage?: string | null;
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

export type PromoValidationResult = {
  valid: boolean;
  code: string | null;
  discountAmount: number;
  message: string;
};

export async function validatePromotionCodeInternal(
  code: string,
  userId: number,
  lines: Array<{ productId: number; quantity: number }>,
  now = new Date()
): Promise<PromoValidationResult> {
  const normalized = code.trim().toUpperCase();

  // Fetch user info to get createdAt
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { createdAt: true },
  });

  if (!user) {
    return {
      valid: false,
      code: null,
      discountAmount: 0,
      message: "ไม่พบผู้ใช้ในระบบ",
    };
  }

  // Fetch products in cart to calculate subtotal and check categories
  const products = await prisma.product.findMany({
    where: { id: { in: lines.map((l) => l.productId) } },
    select: {
      id: true,
      price: true,
      category: {
        select: { name: true },
      },
    },
  });

  const productsById = new Map(products.map((p) => [p.id, p]));

  let subtotal = 0;
  let hasOffice = false;
  let hasDesign = false;
  let hasOS = false;

  for (const line of lines) {
    const product = productsById.get(line.productId);
    if (product) {
      const price = Number(product.price);
      subtotal += price * line.quantity;
      const catName = product.category.name.toLowerCase();
      if (catName === "office") {
        hasOffice = true;
      }
      if (catName === "design") {
        hasDesign = true;
      }
      if (catName === "os") {
        hasOS = true;
      }
    }
  }

  if (normalized === "NEWUSER50") {
    // Check account age: new user within 7 days
    const diffTime = Math.abs(now.getTime() - user.createdAt.getTime());
    const diffDays = diffTime / (1000 * 60 * 60 * 24);
    if (diffDays > 7) {
      return {
        valid: false,
        code: null,
        discountAmount: 0,
        message: "โค้ดส่วนลดผู้ใช้ใหม่หมดอายุแล้ว (เกิน 7 วัน)",
      };
    }

    return {
      valid: true,
      code: normalized,
      discountAmount: 50,
      message: "ใช้ส่วนลดต้อนรับสมาชิกใหม่ 50 บาทแล้ว",
    };
  }

  if (normalized === "MEMBER3JUN") {
    if (subtotal < 1500) {
      return {
        valid: false,
        code: null,
        discountAmount: 0,
        message: "โค้ด MEMBER3JUN ต้องมียอดสั่งซื้อขั้นต่ำ 1,500 บาท",
      };
    }
    return {
      valid: true,
      code: normalized,
      discountAmount: 30,
      message: "ใช้ส่วนลดสมาชิกเดือนมิถุนายน 30 บาทแล้ว",
    };
  }

  if (normalized === "OFFICE20") {
    if (!hasOffice) {
      return {
        valid: false,
        code: null,
        discountAmount: 0,
        message: "โค้ด OFFICE20 ใช้ได้เฉพาะสินค้าหมวดหมู่ Microsoft Office เท่านั้น",
      };
    }
    return {
      valid: true,
      code: normalized,
      discountAmount: 20,
      message: "ใช้ส่วนลดสินค้าหมวดหมู่ Office 20 บาทแล้ว",
    };
  }

  if (normalized === "SUMMER100") {
    if (subtotal < 3000) {
      return {
        valid: false,
        code: null,
        discountAmount: 0,
        message: "โค้ด SUMMER100 ต้องมียอดสั่งซื้อขั้นต่ำ 3,000 บาท",
      };
    }
    return {
      valid: true,
      code: normalized,
      discountAmount: 100,
      message: "ใช้ส่วนลด SUMMER SALE 100 บาทแล้ว",
    };
  }

  if (normalized === "ADOBE40OFF") {
    if (!hasDesign) {
      return {
        valid: false,
        code: null,
        discountAmount: 0,
        message: "โค้ด ADOBE40OFF ใช้ได้เฉพาะสินค้าหมวดหมู่ Adobe CC เท่านั้น",
      };
    }
    return {
      valid: true,
      code: normalized,
      discountAmount: 40,
      message: "ใช้ส่วนลดสินค้าหมวดหมู่ Adobe 40 บาทแล้ว",
    };
  }

  if (normalized === "WINPRO25") {
    if (!hasOS) {
      return {
        valid: false,
        code: null,
        discountAmount: 0,
        message: "โค้ด WINPRO25 ใช้ได้เฉพาะสินค้าหมวดหมู่ Windows เท่านั้น",
      };
    }
    return {
      valid: true,
      code: normalized,
      discountAmount: 25,
      message: "ใช้ส่วนลดสินค้าหมวดหมู่ Windows 25 บาทแล้ว",
    };
  }

  return {
    valid: false,
    code: null,
    discountAmount: 0,
    message: "ไม่พบโค้ดส่วนลดนี้หรือรหัสไม่ถูกต้อง",
  };
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

    let discountAmount = new Prisma.Decimal(0);
    if (command.promotionCode) {
      const promoResult = await validatePromotionCodeInternal(
        command.promotionCode,
        command.userId,
        lines,
        dependencies.now()
      );
      if (!promoResult.valid) {
        throw new Error(promoResult.message);
      }
      discountAmount = new Prisma.Decimal(promoResult.discountAmount);
    }
    const total = Prisma.Decimal.max(new Prisma.Decimal(0), subtotal.sub(discountAmount));

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
        giftEmail: command.giftEmail || null,
        giftMessage: command.giftMessage || null,
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
    const emailRecipient = command.giftEmail || user?.email;
    if (emailRecipient) {
      const orderDate = new Date();
      sendOrderConfirmationEmail({
        customerName: `${user?.firstName} ${user?.lastName}`,
        customerEmail: emailRecipient,
        orderId: order.id,
        orderDate,
        items: emailItems,
        total: total.toFixed(2),
        giftMessage: command.giftEmail ? (command.giftMessage || "ขอให้มีความสุขกับของขวัญชิ้นนี้นะครับ!") : undefined,
        giftSenderName: command.giftEmail ? `${user?.firstName} ${user?.lastName}` : undefined,
      }).catch((err) => console.error("Failed to send order email:", err));
    }

    return result;
  });
}

export async function releaseExpiredReservations() {
  const expiryTime = new Date(Date.now() - 10 * 60 * 1000); // 10 minutes ago
  
  try {
    // Find all PENDING orders older than 10 minutes
    const expiredOrders = await prisma.order.findMany({
      where: {
        status: "PENDING",
        createdAt: { lt: expiryTime },
      },
      include: {
        orderItems: {
          select: {
            id: true,
            productId: true,
            quantity: true,
          },
        },
      },
    });

    if (expiredOrders.length === 0) return;

    for (const order of expiredOrders) {
      await prisma.$transaction(async (tx) => {
        // Double check status before updating
        const currentOrder = await tx.order.findUnique({
          where: { id: order.id },
          select: { status: true },
        });
        if (currentOrder?.status !== "PENDING") return;

        // 1. Update status to CANCELLED
        await tx.order.update({
          where: { id: order.id },
          data: { status: "CANCELLED" },
        });

        // 2. Restore stock and release reserved keys
        for (const item of order.orderItems) {
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { increment: item.quantity } },
          });

          await tx.productKey.updateMany({
            where: { orderDetailId: item.id },
            data: {
              salesStatus: "AVAILABLE",
              orderDetailId: null,
            },
          });
        }
      });
      console.log(`[Checkout] Released expired pending order #${order.id}`);
    }
  } catch (error) {
    console.error("Failed to release expired reservations:", error);
  }
}

export async function createPendingOrder(
  command: CheckoutCommand,
  dependencies = defaultDependencies,
): Promise<{ orderId: number; total: string }> {
  if (!Number.isInteger(command.userId) || command.userId <= 0) {
    throw new Error("Invalid checkout user");
  }

  // Release expired reservations before checking stock
  await releaseExpiredReservations();

  const lines = normalizeLines(command.lines);

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

    let discountAmount = new Prisma.Decimal(0);
    if (command.promotionCode) {
      const promoResult = await validatePromotionCodeInternal(
        command.promotionCode,
        command.userId,
        lines,
        dependencies.now()
      );
      if (!promoResult.valid) {
        throw new Error(promoResult.message);
      }
      discountAmount = new Prisma.Decimal(promoResult.discountAmount);
    }
    const total = Prisma.Decimal.max(new Prisma.Decimal(0), subtotal.sub(discountAmount));

    // Decrement stock for products
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
        status: "PENDING",
        giftEmail: command.giftEmail || null,
        giftMessage: command.giftMessage || null,
        orderItems: {
          create: orderLines.map((line) => ({
            productId: line.productId,
            quantity: line.quantity,
            price: line.price,
            orderStatus: "PENDING",
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

    // Assign keys and mark them as RESERVED
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
            salesStatus: "RESERVED",
            orderDetailId: item.id,
          },
        });
      }

      // Generate remainder if missing
      if (availableKeys.length < item.quantity) {
        const missingCount = item.quantity - availableKeys.length;
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        const segment = () => Array.from({ length: 5 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
        
        for (let i = 0; i < missingCount; i++) {
          const generatedKey = segment() + "-" + segment() + "-" + segment() + "-" + segment() + "-" + segment();
          await transaction.productKey.create({
            data: {
              productKey: encryptKey(generatedKey),
              salesStatus: "RESERVED",
              productId: item.productId,
              orderDetailId: item.id,
            },
          });
        }
      }
    }

    return {
      orderId: order.id,
      total: total.toFixed(2),
    };
  });
}

export async function confirmOrderPayment(
  orderId: number,
  dependencies = defaultDependencies,
): Promise<{ orderId: number; total: string }> {
  // Release expired reservations first
  await releaseExpiredReservations();

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      user: {
        select: { email: true, firstName: true, lastName: true },
      },
      orderItems: {
        include: {
          product: {
            select: { id: true, name: true, price: true },
          },
        },
      },
    },
  });

  if (!order) {
    throw new Error("ไม่พบรายการคำสั่งซื้อ");
  }

  if (order.status === "COMPLETED") {
    return { orderId: order.id, total: order.total.toFixed(2) };
  }

  if (order.status !== "PENDING") {
    throw new Error("คำสั่งซื้อนี้ไม่อยู่ในสถานะที่ชำระเงินได้ หรืออาจหมดเวลาชำระเงินแล้ว");
  }

  return dependencies.transaction(async (transaction) => {
    // 1. Update order status to COMPLETED
    await transaction.order.update({
      where: { id: orderId },
      data: { status: "COMPLETED" },
    });

    // 2. Update orderItems status to COMPLETED
    await transaction.orderItem.updateMany({
      where: { orderId },
      data: { orderStatus: "COMPLETED" },
    });

    // 3. Change reserved product keys to SOLD
    for (const item of order.orderItems) {
      await transaction.productKey.updateMany({
        where: {
          orderDetailId: item.id,
          salesStatus: "RESERVED",
        },
        data: {
          salesStatus: "SOLD",
        },
      });
    }

    // 4. Collect product keys to send email
    const emailItems = await Promise.all(
      order.orderItems.map(async (item) => {
        const assignedKeys = await transaction.productKey.findMany({
          where: { orderDetailId: item.id },
          select: { productKey: true },
        });
        return {
          productName: item.product.name,
          quantity: item.quantity,
          price: new Prisma.Decimal(item.product.price).toFixed(2),
          keys: assignedKeys.map((k) => decryptKey(k.productKey)),
        };
      }),
    );

    // 5. Send confirmation email
    const emailRecipient = order.giftEmail || order.user.email;
    if (emailRecipient) {
      const orderDate = new Date();
      sendOrderConfirmationEmail({
        customerName: `${order.user.firstName} ${order.user.lastName}`,
        customerEmail: emailRecipient,
        orderId: order.id,
        orderDate,
        items: emailItems,
        total: order.total.toFixed(2),
        giftMessage: order.giftEmail ? (order.giftMessage || "ขอให้มีความสุขกับของขวัญชิ้นนี้นะครับ!") : undefined,
        giftSenderName: order.giftEmail ? `${order.user.firstName} ${order.user.lastName}` : undefined,
      }).catch((err) => console.error("Failed to send order email:", err));
    }

    return {
      orderId: order.id,
      total: order.total.toFixed(2),
    };
  });
}

export async function cancelOrder(orderId: number): Promise<void> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      orderItems: {
        select: {
          id: true,
          productId: true,
          quantity: true,
        },
      },
    },
  });

  if (!order || order.status !== "PENDING") {
    return;
  }

  await prisma.$transaction(async (tx) => {
    // 1. Update status to CANCELLED
    await tx.order.update({
      where: { id: orderId },
      data: { status: "CANCELLED" },
    });

    // 2. Restore stock and release reserved keys
    for (const item of order.orderItems) {
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { increment: item.quantity } },
      });

      await tx.productKey.updateMany({
        where: { orderDetailId: item.id },
        data: {
          salesStatus: "AVAILABLE",
          orderDetailId: null,
        },
      });
    }
  });
  console.log(`[Checkout] User manually cancelled pending order #${orderId}`);
}
