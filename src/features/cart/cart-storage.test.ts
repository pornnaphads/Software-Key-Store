import { beforeEach, describe, expect, it } from "vitest";

import {
  CART_STORAGE_KEY,
  clearCartStorage,
  loadCart,
  saveCart,
} from "@/features/cart/cart-storage";
import type { CartLine } from "@/features/cart/cart-types";

const line: CartLine = {
  lineId: "3:none",
  productId: 3,
  name: "Office",
  category: "Office",
  imageKey: "office2021_pro",
  unitPrice: 1190,
  quantity: 1,
  stock: 5,
  options: [],
};

beforeEach(() => {
  localStorage.clear();
});

describe("cart storage", () => {
  it("loads and saves the versioned cart", () => {
    saveCart({ version: 2, lines: [line], promotionCode: "SOFTKEY10" });
    expect(loadCart()).toEqual({
      version: 2,
      lines: [line],
      promotionCode: "SOFTKEY10",
    });
  });

  it("returns an empty cart for corrupt or unknown data", () => {
    localStorage.setItem(CART_STORAGE_KEY, "{broken");
    expect(loadCart().lines).toEqual([]);

    localStorage.setItem(
      CART_STORAGE_KEY,
      JSON.stringify({ version: 99, lines: [line] }),
    );
    expect(loadCart().lines).toEqual([]);
  });

  it("migrates the current legacy array shape", () => {
    localStorage.setItem(
      CART_STORAGE_KEY,
      JSON.stringify([
        {
          id: 3,
          name: "Office",
          category: "Office",
          price: 1190,
          quantity: 2,
          image: "office2021_pro",
        },
      ]),
    );

    expect(loadCart().lines[0]).toMatchObject({
      lineId: "3:none",
      productId: 3,
      unitPrice: 1190,
      quantity: 2,
      imageKey: "office2021_pro",
    });
  });

  it("handles unavailable storage and clears persisted state", () => {
    expect(loadCart(undefined).lines).toEqual([]);
    saveCart({ version: 2, lines: [line], promotionCode: null });
    clearCartStorage();
    expect(localStorage.getItem(CART_STORAGE_KEY)).toBeNull();
  });
});
