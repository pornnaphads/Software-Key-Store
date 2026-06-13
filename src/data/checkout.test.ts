import { describe, expect, it, vi } from "vitest";

import {
  createOrderFromCart,
  createPendingOrder,
  confirmOrderPayment,
  cancelOrder,
} from "@/data/checkout";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    $transaction: vi.fn(),
    user: {
      findUnique: vi.fn().mockResolvedValue({
        email: "customer@example.com",
        firstName: "John",
        lastName: "Doe",
      }),
    },
    product: {
      findMany: vi.fn(),
      update: vi.fn(),
    },
    order: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
      create: vi.fn(),
    },
    productKey: {
      findMany: vi.fn(),
      updateMany: vi.fn(),
      create: vi.fn(),
    },
  },
}));

describe("createOrderFromCart", () => {
  it("uses database prices and writes the order and updates stock", async () => {
    const updateMany = vi.fn().mockResolvedValue({ count: 1 });
    const updateProduct = vi.fn().mockResolvedValue({ id: 3 });
    const createOrder = vi.fn().mockResolvedValue({
      id: 44,
      orderItems: [{ id: 101, productId: 3, quantity: 1 }],
    });
    const transaction = vi.fn(
      async (
        operation: (transaction: typeof transactionClient) => Promise<unknown>,
      ) => operation(transactionClient),
    );
    const transactionClient = {
        product: {
          findMany: vi.fn().mockResolvedValue([
            {
              id: 3,
              name: "Office",
              price: "1000.00",
              stock: 2,
              key: null,
            },
          ]),
          updateMany,
          update: updateProduct,
        },
        productKey: {
          findMany: vi.fn().mockResolvedValue([{ id: 10, productKey: "W11P-ABCD-EFGH-IJKL-1111" }]),
          updateMany: vi.fn().mockResolvedValue({ count: 1 }),
          create: vi.fn().mockResolvedValue({ id: 10 }),
        },
        order: { create: createOrder },
      };

    const result = await createOrderFromCart(
      {
        userId: 7,
        paymentMethod: "PROMPTPAY",
        promotionCode: null,
        lines: [{ productId: 3, quantity: 1 }],
      },
      {
        transaction: transaction as never,
        now: () => new Date("2026-06-13T00:00:00.000Z"),
      },
    );

    expect(result).toEqual({ orderId: 44, total: "1000.00" });
    expect(transaction).toHaveBeenCalledOnce();
    expect(updateMany).toHaveBeenCalledWith({
      where: { id: 3, stock: { gte: 1 } },
      data: { stock: { decrement: 1 } },
    });
    expect(createOrder).toHaveBeenCalledWith({
      data: {
        userId: 7,
        total: expect.any(Object),
        status: "COMPLETED",
        giftEmail: null,
        giftMessage: null,
        orderItems: {
          create: [
            {
              productId: 3,
              quantity: 1,
              price: expect.any(Object),
              orderStatus: "COMPLETED",
              userId: 7,
            },
          ],
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
  });

  it("applies discount from promotion code and calculates total correctly", async () => {
    const updateMany = vi.fn().mockResolvedValue({ count: 1 });
    const updateProduct = vi.fn().mockResolvedValue({ id: 3 });
    const createOrder = vi.fn().mockResolvedValue({
      id: 45,
      orderItems: [{ id: 102, productId: 3, quantity: 1 }],
    });
    const transaction = vi.fn(
      async (
        operation: (transaction: typeof transactionClient) => Promise<unknown>,
      ) => operation(transactionClient),
    );
    const transactionClient = {
        product: {
          findMany: vi.fn().mockResolvedValue([
            {
              id: 3,
              name: "Office 2021",
              price: "1000.00",
              stock: 2,
              key: null,
            },
          ]),
          updateMany,
          update: updateProduct,
        },
        productKey: {
          findMany: vi.fn().mockResolvedValue([{ id: 10, productKey: "W11P-ABCD-EFGH-IJKL-1111" }]),
          updateMany: vi.fn().mockResolvedValue({ count: 1 }),
          create: vi.fn().mockResolvedValue({ id: 10 }),
        },
        order: { create: createOrder },
      };

    const { prisma } = await import("@/lib/prisma");
    const createdAt = new Date();
    createdAt.setDate(createdAt.getDate() - 3);
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      email: "customer@example.com",
      firstName: "John",
      lastName: "Doe",
      createdAt,
    } as any);

    vi.mocked(prisma.product.findMany).mockResolvedValue([
      { id: 3, price: 1000, category: { name: "Office" } },
    ] as any);

    const result = await createOrderFromCart(
      {
        userId: 7,
        paymentMethod: "PROMPTPAY",
        promotionCode: "NEWUSER50",
        lines: [{ productId: 3, quantity: 1 }],
      },
      {
        transaction: transaction as never,
        now: () => new Date(),
      },
    );

    expect(result).toEqual({ orderId: 45, total: "950.00" });
  });
});

describe("createPendingOrder", () => {
  it("creates order in PENDING status and sets keys to RESERVED", async () => {
    const updateMany = vi.fn().mockResolvedValue({ count: 1 });
    const createOrder = vi.fn().mockResolvedValue({
      id: 46,
      orderItems: [{ id: 103, productId: 3, quantity: 1 }],
    });
    const transaction = vi.fn(
      async (
        operation: (transaction: typeof transactionClient) => Promise<unknown>,
      ) => operation(transactionClient),
    );
    const transactionClient = {
      product: {
        findMany: vi.fn().mockResolvedValue([
          {
            id: 3,
            name: "Office",
            price: "1000.00",
            stock: 2,
          },
        ]),
        updateMany,
      },
      productKey: {
        findMany: vi.fn().mockResolvedValue([{ id: 10, productKey: "W11P-ABCD-EFGH-IJKL-1111" }]),
        updateMany: vi.fn().mockResolvedValue({ count: 1 }),
        create: vi.fn().mockResolvedValue({ id: 10 }),
      },
      order: { create: createOrder },
    };

    const { prisma } = await import("@/lib/prisma");
    vi.mocked(prisma.order.findMany).mockResolvedValue([] as any); // for releaseExpiredReservations check

    const result = await createPendingOrder(
      {
        userId: 7,
        paymentMethod: "PROMPTPAY",
        promotionCode: null,
        lines: [{ productId: 3, quantity: 1 }],
      },
      {
        transaction: transaction as never,
        now: () => new Date(),
      },
    );

    expect(result).toEqual({ orderId: 46, total: "1000.00" });
    expect(createOrder).toHaveBeenCalledWith({
      data: {
        userId: 7,
        total: expect.any(Object),
        status: "PENDING",
        giftEmail: null,
        giftMessage: null,
        orderItems: {
          create: [
            {
              productId: 3,
              quantity: 1,
              price: expect.any(Object),
              orderStatus: "PENDING",
              userId: 7,
            },
          ],
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
  });
});

describe("confirmOrderPayment", () => {
  it("transitions PENDING order status to COMPLETED and keys to SOLD", async () => {
    const updateOrder = vi.fn();
    const updateOrderItems = vi.fn();
    const updateKeys = vi.fn();
    const transaction = vi.fn(
      async (
        operation: (transaction: typeof transactionClient) => Promise<unknown>,
      ) => operation(transactionClient),
    );
    const transactionClient = {
      order: { update: updateOrder },
      orderItem: { updateMany: updateOrderItems },
      productKey: {
        updateMany: updateKeys,
        findMany: vi.fn().mockResolvedValue([{ productKey: "W11P-ABCD-EFGH-IJKL-1111" }]),
      },
    };

    const { prisma } = await import("@/lib/prisma");
    vi.mocked(prisma.order.findMany).mockResolvedValue([] as any); // releaseExpiredReservations
    vi.mocked(prisma.order.findUnique).mockResolvedValue({
      id: 46,
      status: "PENDING",
      total: { toFixed: () => "1000.00" },
      giftEmail: null,
      giftMessage: null,
      user: { email: "customer@example.com", firstName: "John", lastName: "Doe" },
      orderItems: [
        {
          id: 103,
          productId: 3,
          quantity: 1,
          product: { id: 3, name: "Office", price: 1000 },
        },
      ],
    } as any);

    const result = await confirmOrderPayment(
      46,
      {
        transaction: transaction as never,
        now: () => new Date(),
      },
    );

    expect(result).toEqual({ orderId: 46, total: "1000.00" });
    expect(updateOrder).toHaveBeenCalledWith({
      where: { id: 46 },
      data: { status: "COMPLETED" },
    });
    expect(updateKeys).toHaveBeenCalledWith({
      where: { orderDetailId: 103, salesStatus: "RESERVED" },
      data: { salesStatus: "SOLD" },
    });
  });
});

describe("cancelOrder", () => {
  it("cancels pending order, restores stock, and sets keys back to AVAILABLE", async () => {
    const { prisma } = await import("@/lib/prisma");

    vi.mocked(prisma.order.findUnique).mockResolvedValue({
      id: 46,
      status: "PENDING",
      orderItems: [{ id: 103, productId: 3, quantity: 1 }],
    } as any);

    const mockTransaction = vi.fn(async (callback) => {
      return callback(prisma);
    });
    vi.mocked(prisma.$transaction).mockImplementation(mockTransaction);

    await cancelOrder(46);

    expect(prisma.order.update).toHaveBeenCalledWith({
      where: { id: 46 },
      data: { status: "CANCELLED" },
    });
    expect(prisma.product.update).toHaveBeenCalledWith({
      where: { id: 3 },
      data: { stock: { increment: 1 } },
    });
    expect(prisma.productKey.updateMany).toHaveBeenCalledWith({
      where: { orderDetailId: 103 },
      data: { salesStatus: "AVAILABLE", orderDetailId: null },
    });
  });
});
