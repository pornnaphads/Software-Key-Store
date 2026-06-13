import { describe, expect, it, vi } from "vitest";

import { createOrderFromCart } from "@/data/checkout";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    $transaction: vi.fn(),
  },
}));

describe("createOrderFromCart", () => {
  it("uses database prices and writes the order and updates stock", async () => {
    const updateMany = vi.fn().mockResolvedValue({ count: 1 });
    const updateProduct = vi.fn().mockResolvedValue({ id: 3 });
    const createOrder = vi.fn().mockResolvedValue({
      id: 44,
      orderItems: [{ id: 101, productId: 3 }],
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
              stock: { quantity: 2 },
              key: null,
            },
          ]),
          update: updateProduct,
        },
        stock: {
          updateMany,
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
      where: { productId: 3, quantity: { gte: 1 } },
      data: { quantity: { decrement: 1 } },
    });
    expect(createOrder).toHaveBeenCalledWith({
      data: expect.objectContaining({
        userId: 7,
        total: expect.objectContaining({ toFixed: expect.any(Function) }),
        status: "COMPLETED",
        orderItems: {
          create: [
            {
              productId: 3,
              quantity: 1,
              price: expect.objectContaining({ toFixed: expect.any(Function) }),
              orderStatus: "COMPLETED",
              userId: 7,
            },
          ],
        },
      }),
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
    expect(updateProduct).toHaveBeenCalledOnce();
  });
});
