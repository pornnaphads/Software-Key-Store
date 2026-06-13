import { describe, expect, it, vi } from "vitest";

import {
  archiveDiscount,
  createDiscount,
  setDiscountActive,
  updateDiscount,
} from "@/data/admin/discounts";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    discount: {
      create: vi.fn().mockResolvedValue({ id: 1 }),
      update: vi.fn().mockResolvedValue({ id: 1 }),
    },
  },
}));

describe("admin discounts", () => {
  it("creates a discount successfully", async () => {
    const res = await createDiscount({
      discountAmount: "100.00",
      customerType: "VIP",
      startDate: new Date(),
      expirationDate: new Date(),
      status: "ACTIVE",
      userId: 1,
    });
    expect(res).toEqual({ id: 1 });
  });

  it("updates a discount successfully", async () => {
    await updateDiscount(1, {
      discountAmount: "200.00",
      customerType: "VIP",
      startDate: new Date(),
      expirationDate: new Date(),
      status: "ACTIVE",
      userId: 1,
    });
  });

  it("archives a discount successfully", async () => {
    await archiveDiscount(1);
  });

  it("sets a discount active status successfully", async () => {
    await setDiscountActive(1, true);
  });
});
