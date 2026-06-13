import { describe, expect, it, vi } from "vitest";

import { createOrderFromCart } from "@/data/checkout";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    $transaction: vi.fn(),
  },
}));

describe("createOrderFromCart", () => {
  it("uses database prices and writes the order and discount usage once", async () => {
    const updateMany = vi.fn().mockResolvedValue({ count: 1 });
    const createOrder = vi.fn().mockResolvedValue({
      id: 44,
      orderItems: [{ id: 101, productId: 3 }],
    });
    const createDiscountUsage = vi.fn().mockResolvedValue({ id: 2 });
    const findFirstLicense = vi.fn().mockResolvedValue({ id: 99, key: "MOCK-KEY-123" });
    const updateLicense = vi.fn().mockResolvedValue({ id: 99 });
    const createLicense = vi.fn().mockResolvedValue({ id: 99 });
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
              archivedAt: null,
            },
          ]),
          updateMany,
        },
        discount: {
          findUnique: vi.fn().mockResolvedValue({
            id: 9,
            code: "SAVE10",
            type: "PERCENT",
            value: "10.00",
            minimumOrderAmount: null,
            maximumDiscountAmount: null,
            startsAt: new Date("2026-01-01"),
            endsAt: new Date("2026-12-31"),
            usageLimit: 10,
            perUserLimit: 1,
            isActive: true,
            archivedAt: null,
            _count: { usages: 0 },
            usages: [],
          }),
        },
        order: { create: createOrder },
        discountUsage: { create: createDiscountUsage },
        licenseKey: {
          findFirst: findFirstLicense,
          update: updateLicense,
          create: createLicense,
        },
      };

    const result = await createOrderFromCart(
      {
        userId: 7,
        paymentMethod: "PROMPTPAY",
        promotionCode: "save10",
        lines: [{ productId: 3, quantity: 1 }],
      },
      {
        transaction: transaction as never,
        now: () => new Date("2026-06-13T00:00:00.000Z"),
      },
    );

    expect(result).toEqual({ orderId: 44, total: "900.00" });
    expect(transaction).toHaveBeenCalledOnce();
    expect(updateMany).toHaveBeenCalledWith({
      where: { id: 3, archivedAt: null, stock: { gte: 1 } },
      data: { stock: { decrement: 1 } },
    });
    expect(createOrder).toHaveBeenCalledWith({
      data: expect.objectContaining({
        userId: 7,
        subtotal: expect.objectContaining({ toFixed: expect.any(Function) }),
        discountAmount: expect.objectContaining({
          toFixed: expect.any(Function),
        }),
        total: expect.objectContaining({ toFixed: expect.any(Function) }),
        discountCode: "SAVE10",
        status: "COMPLETED",
        paymentMethod: "PROMPTPAY",
        orderItems: {
          create: [
            {
              productId: 3,
              quantity: 1,
              price: expect.objectContaining({ toFixed: expect.any(Function) }),
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
    expect(findFirstLicense).toHaveBeenCalledWith({
      where: {
        productId: 3,
        isUsed: false,
        orderItemId: null,
      },
    });
    expect(updateLicense).toHaveBeenCalledWith({
      where: { id: 99 },
      data: {
        isUsed: true,
        orderItemId: 101,
      },
    });
    expect(createDiscountUsage).toHaveBeenCalledOnce();
  });
});
