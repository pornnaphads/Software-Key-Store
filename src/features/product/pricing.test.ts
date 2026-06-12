import { describe, expect, it } from "vitest";

import {
  clampQuantity,
  getConfiguredTotal,
  getConfiguredUnitPrice,
} from "@/features/product/pricing";
import { OFFICE_OPTIONS } from "@/features/product/product-options";

describe("product configuration pricing", () => {
  it("returns the base price without options", () => {
    expect(getConfiguredUnitPrice(1190, [])).toBe(1190);
  });

  it("adds multiple selected options", () => {
    expect(getConfiguredUnitPrice(1190, OFFICE_OPTIONS.slice(0, 2))).toBe(2090);
  });

  it("multiplies the configured price by quantity", () => {
    expect(getConfiguredTotal(1190, [OFFICE_OPTIONS[2]], 3)).toBe(4740);
  });
});

describe("quantity constraints", () => {
  it("clamps quantity between one and available stock", () => {
    expect(clampQuantity(0, 5)).toBe(1);
    expect(clampQuantity(8, 5)).toBe(5);
    expect(clampQuantity(3, 5)).toBe(3);
  });

  it("returns zero when no stock is available", () => {
    expect(clampQuantity(1, 0)).toBe(0);
  });
});
