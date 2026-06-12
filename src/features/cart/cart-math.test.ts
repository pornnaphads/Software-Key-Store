import { describe, expect, it } from "vitest";

import {
  addCartLine,
  calculateCartTotals,
  createLineId,
  reconcileCart,
  removeCartLine,
  setLineQuantity,
  validatePromotion,
} from "@/features/cart/cart-math";
import type { CartLine } from "@/features/cart/cart-types";

function line(overrides: Partial<CartLine> = {}): CartLine {
  return {
    lineId: "3:none",
    productId: 3,
    name: "Microsoft Office 2021",
    category: "Office",
    imageKey: "office2021_pro",
    unitPrice: 1190,
    quantity: 1,
    stock: 5,
    options: [],
    ...overrides,
  };
}

describe("cart identity and mutations", () => {
  it("creates a stable id from sorted option ids", () => {
    expect(
      createLineId(3, [
        { id: "word", label: "Word", price: 450 },
        { id: "excel", label: "Excel", price: 450 },
      ]),
    ).toBe("3:excel+word");
  });

  it("adds a new line and merges only identical configurations", () => {
    const base = line();
    const configured = line({
      lineId: "3:word",
      options: [{ id: "word", label: "Word", price: 450 }],
      unitPrice: 1640,
    });

    expect(addCartLine([], base)).toEqual([base]);
    expect(addCartLine([base], { ...base, quantity: 2 })[0].quantity).toBe(3);
    expect(addCartLine([base], configured)).toHaveLength(2);
  });

  it("clamps merged and edited quantities to stock", () => {
    const base = line({ quantity: 4, stock: 5 });
    expect(addCartLine([base], { ...base, quantity: 3 })[0].quantity).toBe(5);
    expect(setLineQuantity([base], base.lineId, 0)[0].quantity).toBe(1);
    expect(setLineQuantity([base], base.lineId, 99)[0].quantity).toBe(5);
  });

  it("removes a line", () => {
    expect(removeCartLine([line()], "3:none")).toEqual([]);
  });
});

describe("cart totals and promotion", () => {
  it("calculates subtotal, discount, and total", () => {
    const totals = calculateCartTotals(
      [line({ unitPrice: 1000, quantity: 2 })],
      "SOFTKEY10",
    );

    expect(totals).toEqual({ subtotal: 2000, discount: 200, total: 1800 });
  });

  it("validates active, invalid, and expired promotion codes", () => {
    expect(validatePromotion(" softkey10 ")).toMatchObject({
      valid: true,
      code: "SOFTKEY10",
      discountRate: 0.1,
    });
    expect(validatePromotion("missing")).toMatchObject({
      valid: false,
      discountRate: 0,
    });
    expect(validatePromotion("SOFTKEYEXPIRED").message).toContain("หมดอายุ");
  });
});

describe("cart reconciliation", () => {
  it("updates stale prices and stock with recovery issues", () => {
    const result = reconcileCart([line({ quantity: 5 })], [
      {
        id: 3,
        name: "Microsoft Office 2021",
        description: "Office",
        price: 1290,
        originalPrice: 2990,
        image: "office2021_pro",
        category: "Office",
        stock: 2,
        featuredRank: 1,
      },
    ]);

    expect(result.lines[0]).toMatchObject({
      unitPrice: 1290,
      quantity: 2,
      stock: 2,
    });
    expect(result.issues.map((issue) => issue.type)).toEqual([
      "price-changed",
      "stock-changed",
    ]);
  });

  it("marks missing products unavailable", () => {
    const result = reconcileCart([line()], []);
    expect(result.lines[0]).toMatchObject({ stock: 0, quantity: 0 });
    expect(result.issues[0].type).toBe("missing-product");
  });
});
