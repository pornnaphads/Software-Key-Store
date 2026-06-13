import { describe, expect, it } from "vitest";

import {
  calculateDiscount,
  discountInputSchema,
} from "@/features/admin/discount";

describe("discount domain", () => {
  it("caps percentage discounts", () => {
    expect(
      calculateDiscount({
        subtotal: "2000.00",
        type: "PERCENT",
        value: "20.00",
        maximumDiscountAmount: "300.00",
      }),
    ).toBe("300.00");
  });

  it("rejects an invalid date range", () => {
    const result = discountInputSchema.safeParse({
      code: "SAVE20",
      type: "PERCENT",
      value: "20",
      startsAt: "2026-06-20T00:00",
      endsAt: "2026-06-19T00:00",
      isActive: true,
    });

    expect(result.success).toBe(false);
  });
});
