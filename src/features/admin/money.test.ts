import { describe, expect, it } from "vitest";

import { formatBaht, toMoneyString } from "@/features/admin/money";

describe("admin money", () => {
  it("normalizes values to two decimal places", () => {
    expect(toMoneyString("12450")).toBe("12450.00");
    expect(toMoneyString(8900.5)).toBe("8900.50");
  });

  it("formats Thai baht with two decimal places", () => {
    expect(formatBaht("12450")).toBe("฿12,450.00");
  });
});
