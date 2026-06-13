import { describe, expect, it, vi } from "vitest";

import { transitionOrderStatus } from "@/data/admin/orders";

describe("transitionOrderStatus", () => {
  it("updates only when the current status still matches", async () => {
    const updateMany = vi.fn().mockResolvedValue({ count: 1 });

    await expect(
      transitionOrderStatus(
        {
          orderId: 10,
          expectedStatus: "PENDING",
          nextStatus: "PAID",
        },
        {
          requireAdmin: async () => ({ id: 1 }),
          updateMany,
        },
      ),
    ).resolves.toEqual({ status: "PAID" });
    expect(updateMany).toHaveBeenCalledWith({
      where: { id: 10, status: "PENDING" },
      data: { status: "PAID" },
    });
  });

  it("rejects paid to cancelled", async () => {
    await expect(
      transitionOrderStatus(
        {
          orderId: 10,
          expectedStatus: "PAID",
          nextStatus: "CANCELLED",
        },
        {
          requireAdmin: async () => ({ id: 1 }),
          updateMany: vi.fn(),
        },
      ),
    ).rejects.toThrow("INVALID_ORDER_TRANSITION");
  });

  it("rejects a stale status update", async () => {
    await expect(
      transitionOrderStatus(
        {
          orderId: 10,
          expectedStatus: "PENDING",
          nextStatus: "PAID",
        },
        {
          requireAdmin: async () => ({ id: 1 }),
          updateMany: vi.fn().mockResolvedValue({ count: 0 }),
        },
      ),
    ).rejects.toThrow("STALE_ORDER_STATUS");
  });
});
