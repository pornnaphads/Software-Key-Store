import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { CheckoutForm } from "@/components/checkout/CheckoutForm";
import type { CartLine } from "@/features/cart/cart-types";

const { submitCheckout } = vi.hoisted(() => ({
  submitCheckout: vi.fn(),
}));
const clearCart = vi.fn();
const push = vi.fn();

vi.mock("@/app/(storefront)/checkout/actions", () => ({
  submitCheckout,
}));

vi.mock("@/features/cart/CartProvider", () => ({
  useCart: () => cartState,
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));

const line: CartLine = {
  lineId: "3:none",
  productId: 3,
  name: "Microsoft Office 2021 Professional Plus",
  category: "Office",
  imageKey: "office2021_pro",
  unitPrice: 1190,
  quantity: 1,
  stock: 3,
  options: [],
};

let cartState = {
  lines: [line],
  totals: { subtotal: 1190, discount: 119, total: 1071 },
  promotion: {
    valid: true,
    code: "SAVE10",
    discountRate: 0.1,
    message: "",
  },
  clearCart,
};

describe("CheckoutForm", () => {
  beforeEach(() => {
    clearCart.mockReset();
    push.mockReset();
    submitCheckout.mockReset();
    cartState = {
      lines: [line],
      totals: { subtotal: 1190, discount: 119, total: 1071 },
      promotion: {
        valid: true,
        code: "SAVE10",
        discountRate: 0.1,
        message: "",
      },
      clearCart,
    };
  });

  it("allows optional contact details and uses the product asset resolver", async () => {
    const user = userEvent.setup();
    render(<CheckoutForm />);

    const email = document.querySelector<HTMLInputElement>("#checkout-email");
    expect(email).not.toBeNull();
    await user.type(email!, "mint@example.com");

    expect(email).toHaveValue("mint@example.com");
    expect(
      screen.getByRole("img", {
        name: "Microsoft Office 2021 Professional Plus",
      }),
    ).toHaveAttribute("src", expect.stringContaining("office2021-pro.png"));
  });

  it("sends only product IDs, quantities, payment method, and promotion code", async () => {
    const user = userEvent.setup();
    submitCheckout.mockResolvedValue({
      status: "success",
      message: "สร้างคำสั่งซื้อแล้ว",
      orderId: 44,
    });
    render(<CheckoutForm />);

    await user.click(screen.getByRole("button"));

    await waitFor(() =>
      expect(submitCheckout).toHaveBeenCalledWith({
        paymentMethod: "PROMPTPAY",
        promotionCode: "SAVE10",
        lines: [{ productId: 3, quantity: 1 }],
      }),
    );
    expect(clearCart).toHaveBeenCalledOnce();
    expect(push).toHaveBeenCalledWith("/profile");
  });

  it("locks duplicate submission while the order is pending", async () => {
    const user = userEvent.setup();
    let finish!: (value: {
      status: "success";
      message: string;
      orderId: number;
    }) => void;
    submitCheckout.mockImplementation(
      () =>
        new Promise((resolve) => {
          finish = resolve;
        }),
    );
    render(<CheckoutForm />);

    const submit = screen.getByRole("button");
    await user.click(submit);
    await user.click(submit);

    expect(submitCheckout).toHaveBeenCalledOnce();
    expect(submit).toBeDisabled();

    finish({
      status: "success",
      message: "สร้างคำสั่งซื้อแล้ว",
      orderId: 44,
    });
    await waitFor(() => expect(clearCart).toHaveBeenCalledOnce());
  });

  it("shows recoverable failure feedback without clearing the cart", async () => {
    const user = userEvent.setup();
    submitCheckout.mockResolvedValue({
      status: "error",
      message: "ไม่สามารถสร้างคำสั่งซื้อได้",
    });
    render(<CheckoutForm />);

    await user.click(screen.getByRole("button"));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "ไม่สามารถสร้างคำสั่งซื้อได้",
    );
    expect(clearCart).not.toHaveBeenCalled();
    expect(screen.getByRole("button")).toBeEnabled();
  });

  it("disables checkout for an empty cart", () => {
    cartState = {
      ...cartState,
      lines: [],
      totals: { subtotal: 0, discount: 0, total: 0 },
    };
    render(<CheckoutForm />);

    expect(screen.getByRole("button")).toBeDisabled();
    expect(submitCheckout).not.toHaveBeenCalled();
  });
});
