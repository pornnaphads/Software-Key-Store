import { describe, expect, it, vi } from "vitest";

import { createOrderFromCart } from "@/data/checkout";

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
