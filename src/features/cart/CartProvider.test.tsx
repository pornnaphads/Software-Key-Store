import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";

import {
  CartProvider,
  useCart,
} from "@/features/cart/CartProvider";
import { CART_STORAGE_KEY } from "@/features/cart/cart-storage";

const CART_LINE = {
  lineId: "3:none",
  productId: 3,
  name: "Microsoft Office 2021",
  category: "Office",
  imageKey: "office2021_pro",
  unitPrice: 1190,
  quantity: 1,
  stock: 5,
  options: [],
};

function Consumer() {
  const cart = useCart();

  return (
    <>
      <output data-testid="hydrated">{String(cart.hydrated)}</output>
      <output data-testid="count">{cart.itemCount}</output>
      <output data-testid="total">{cart.totals.total}</output>
      <output data-testid="announcement">{cart.announcement}</output>
      <button type="button" onClick={() => cart.addItem(CART_LINE)}>
        Add
      </button>
      <button
        type="button"
        onClick={() => cart.setQuantity(CART_LINE.lineId, 2)}
      >
        Quantity
      </button>
      <button type="button" onClick={() => cart.removeItem(CART_LINE.lineId)}>
        Remove
      </button>
      <button type="button" onClick={() => cart.applyPromotion("SOFTKEY10")}>
        Promotion
      </button>
      <button type="button" onClick={() => cart.applyPromotion("missing")}>
        Invalid promotion
      </button>
      <button type="button" onClick={() => cart.clearCart()}>
        Clear
      </button>
    </>
  );
}

async function renderProvider() {
  render(
    <CartProvider>
      <Consumer />
    </CartProvider>,
  );
  await act(async () => {
    await Promise.resolve();
  });
}

beforeEach(() => {
  localStorage.clear();
});

describe("CartProvider", () => {
  it("hydrates cart state from versioned storage", async () => {
    localStorage.setItem(
      CART_STORAGE_KEY,
      JSON.stringify({ version: 2, lines: [CART_LINE], promotionCode: null }),
    );

    await renderProvider();

    expect(screen.getByTestId("hydrated")).toHaveTextContent("true");
    expect(screen.getByTestId("count")).toHaveTextContent("1");
    expect(screen.getByTestId("total")).toHaveTextContent("1190");
  });

  it("updates count, totals, persistence, and live announcements", async () => {
    const user = userEvent.setup();
    await renderProvider();

    await user.click(screen.getByRole("button", { name: "Add" }));
    expect(screen.getByTestId("count")).toHaveTextContent("1");
    expect(screen.getByTestId("announcement")).toHaveTextContent("เพิ่ม");

    await user.click(screen.getByRole("button", { name: "Quantity" }));
    expect(screen.getByTestId("total")).toHaveTextContent("2380");
    expect(localStorage.getItem(CART_STORAGE_KEY)).toContain('"quantity":2');

    await user.click(screen.getByRole("button", { name: "Promotion" }));
    expect(screen.getByTestId("total")).toHaveTextContent("2142");

    await user.click(
      screen.getByRole("button", { name: "Invalid promotion" }),
    );
    expect(screen.getByTestId("announcement")).toHaveTextContent("ไม่พบ");

    await user.click(screen.getByRole("button", { name: "Remove" }));
    expect(screen.getByTestId("count")).toHaveTextContent("0");
    expect(screen.getByTestId("announcement")).toHaveTextContent("นำ");
  });

  it("synchronizes cart state from another browser tab", async () => {
    await renderProvider();
    const nextValue = JSON.stringify({
      version: 2,
      lines: [{ ...CART_LINE, quantity: 3 }],
      promotionCode: null,
    });

    act(() => {
      window.dispatchEvent(
        new StorageEvent("storage", {
          key: CART_STORAGE_KEY,
          newValue: nextValue,
        }),
      );
    });

    expect(screen.getByTestId("count")).toHaveTextContent("3");
  });

  it("clears persisted state", async () => {
    const user = userEvent.setup();
    await renderProvider();
    await user.click(screen.getByRole("button", { name: "Add" }));
    await user.click(screen.getByRole("button", { name: "Clear" }));

    expect(localStorage.getItem(CART_STORAGE_KEY)).toBeNull();
    expect(screen.getByTestId("count")).toHaveTextContent("0");
  });
});
