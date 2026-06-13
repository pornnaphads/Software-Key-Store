import { Prisma } from "@prisma/client";
import { describe, expect, it, vi } from "vitest";

import {
  archiveDiscount,
  setDiscountActive,
  toDiscountUsageDto,
  updateDiscount,
  type DiscountInput,
} from "@/data/admin/discounts";

const input: DiscountInput = {
  code: "NEWCODE",
  type: "PERCENT",
  value: "10.00",
  minimumOrderAmount: null,
  maximumDiscountAmount: "300.00",
  startsAt: new Date("2026-01-01T00:00:00Z"),
  endsAt: new Date("2026-12-31T23:59:59Z"),
  usageLimit: 100,
  perUserLimit: 1,
  isActive: true,
};

describe("admin discounts", () => {
  it("does not change a code after first usage", async () => {
    await expect(
      updateDiscount(5, input, {
        requireAdmin: async () => ({ id: 1 }),
        find: async () => ({
          code: "OLDCODE",
          usageCount: 1,
          archivedAt: null,
        }),
        create: vi.fn(),
        update: vi.fn(),
        now: () => new Date(),
      }),
    ).rejects.toThrow("DISCOUNT_CODE_IMMUTABLE");
  });

  it("archives and disables a discount without deleting it", async () => {
    const update = vi.fn().mockResolvedValue({ id: 5 });
    const archivedAt = new Date("2026-06-13T12:00:00Z");

    await archiveDiscount(5, {
      requireAdmin: async () => ({ id: 1 }),
      find: vi.fn(),
      create: vi.fn(),
      update,
      now: () => archivedAt,
    });

    expect(update).toHaveBeenCalledWith({
      where: { id: 5 },
      data: { archivedAt, isActive: false },
      select: { id: true },
    });
  });

  it("does not reactivate an archived discount", async () => {
    const update = vi.fn();

    await expect(
      setDiscountActive(5, true, {
        requireAdmin: async () => ({ id: 1 }),
        find: async () => ({
          code: "ARCHIVED10",
          usageCount: 0,
          archivedAt: new Date("2026-06-13T12:00:00Z"),
        }),
        create: vi.fn(),
        update,
        now: () => new Date(),
      }),
    ).rejects.toThrow("DISCOUNT_ARCHIVED");

    expect(update).not.toHaveBeenCalled();
  });

  it("maps immutable discount usage snapshots", () => {
    expect(
      toDiscountUsageDto({
        id: 1,
        codeSnapshot: "WELCOME10",
        discountAmount: new Prisma.Decimal("100.00"),
        totalSnapshot: new Prisma.Decimal("900.00"),
        createdAt: new Date("2026-06-13T05:00:00Z"),
        user: { name: "Mint", email: "mint@example.com" },
        orderId: 44,
      }),
    ).toEqual({
      id: 1,
      code: "WELCOME10",
      memberName: "Mint",
      memberEmail: "mint@example.com",
      orderId: 44,
      discountAmount: "100.00",
      total: "900.00",
      createdAt: "2026-06-13T05:00:00.000Z",
    });
  });
});
