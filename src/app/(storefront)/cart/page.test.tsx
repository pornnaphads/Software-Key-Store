import { StrictMode } from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import CartPage from "@/app/(storefront)/cart/page";
import type { useCart } from "@/features/cart/CartProvider";
import type { CartLine } from "@/features/cart/cart-types";

const setQuantity = vi.fn();
const removeItem = vi.fn();
const applyPromotion = vi.fn();
const clearPromotion = vi.fn();
const reconcile = vi.fn();

const line: CartLine = {
  lineId: "3:word",
  productId: 3,
  name: "Microsoft Office 2021 Professional Plus",
  category: "Office",
  imageKey: "office2021_pro",
  unitPrice: 1640,
  quantity: 1,
  stock: 3,
  options: [{ id: "word", label: "Microsoft Word", price: 450 }],
};

let cartState: Partial<ReturnType<typeof useCart>>;

vi.mock("@/features/cart/CartProvider", () => ({
  useCart: () => cartState,
}));

beforeEach(() => {
  setQuantity.mockReset();
  removeItem.mockReset();
  applyPromotion.mockReset();
  clearPromotion.mockReset();
  reconcile.mockReset();
  cartState = {
    lines: [],
    hydrated: true,
    totals: { subtotal: 0, discount: 0, total: 0 },
    promotion: {
      valid: true,
      code: null,
      discountRate: 0,
      message: "",
    },
    issues: [],
    setQuantity,
    removeItem,
    applyPromotion,
    clearPromotion,
    reconcile,
  };
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ products: [] }),
    }),
  );
});

describe("CartPage", () => {
  it("shows an honest empty state without creating a mock item", () => {
    render(<CartPage />);

    expect(screen.getByText("ตะกร้าสินค้าของคุณว่างอยู่")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "เลือกซื้อซอฟต์แวร์" })).toHaveAttribute(
      "href",
      "/",
    );
    expect(setQuantity).not.toHaveBeenCalled();
  });

  it("updates quantity and removes the requested cart line", async () => {
    const user = userEvent.setup();
    cartState = {
      ...cartState,
      lines: [line],
      totals: { subtotal: 1640, discount: 0, total: 1640 },
    };

    render(<CartPage />);

    expect(screen.getByRole("link", { name: "ซื้อสินค้าต่อ" })).toHaveAttribute(
      "href",
      "/",
    );

    await user.click(
      screen.getByRole("button", {
        name: "เพิ่มจำนวน Microsoft Office 2021 Professional Plus",
      }),
    );
    expect(setQuantity).toHaveBeenCalledWith("3:word", 2);

    await user.click(
      screen.getByRole("button", {
        name: "นำ Microsoft Office 2021 Professional Plus ออกจากตะกร้า",
      }),
    );
    expect(removeItem).toHaveBeenCalledWith("3:word");
  });

  it("reconciles current products and surfaces recovery messages", async () => {
    cartState = {
      ...cartState,
      lines: [{ ...line, quantity: 0, stock: 0 }],
      issues: [
        {
          lineId: line.lineId,
          type: "stock-changed",
          message: "สินค้านี้หมดชั่วคราว",
        },
      ],
    };

    render(
      <StrictMode>
        <CartPage />
      </StrictMode>,
    );

    await waitFor(() => expect(reconcile).toHaveBeenCalledWith([]));
    expect(screen.getByRole("alert")).toHaveTextContent(
      "สินค้านี้หมดชั่วคราว",
    );
    expect(
      screen.getByRole("button", { name: "ดำเนินการชำระเงิน" }),
    ).toBeDisabled();
  });
});
