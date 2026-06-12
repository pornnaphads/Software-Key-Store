import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { CheckoutForm } from "@/components/checkout/CheckoutForm";
import type { CartLine } from "@/features/cart/cart-types";
import type {
  CheckoutResult,
  simulateCheckout,
} from "@/features/checkout/checkout";

const clearCart = vi.fn();
const push = vi.fn();

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
  totals: { subtotal: 1190, discount: 0, total: 1190 },
  promotion: {
    valid: true,
    code: null,
    discountRate: 0,
    message: "",
  },
  clearCart,
};

async function fillContact(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText("อีเมลสำหรับรับ Product Key"), "mint@example.com");
  await user.type(screen.getByLabelText("ชื่อ"), "Mint");
  await user.type(screen.getByLabelText("นามสกุล"), "S");
}

describe("CheckoutForm", () => {
  beforeEach(() => {
    clearCart.mockReset();
    push.mockReset();
    cartState = {
      lines: [line],
      totals: { subtotal: 1190, discount: 0, total: 1190 },
      promotion: {
        valid: true,
        code: null,
        discountRate: 0,
        message: "",
      },
      clearCart,
    };
  });

  it("shows inline contact errors and preserves fields across payment changes", async () => {
    const user = userEvent.setup();
    render(<CheckoutForm />);

    await user.click(screen.getByRole("button", { name: "ยืนยันการชำระเงิน" }));
    expect(screen.getByText("กรุณากรอกอีเมล")).toBeInTheDocument();
    expect(screen.getByText("กรุณากรอกชื่อ")).toBeInTheDocument();
    expect(screen.getByText("กรุณากรอกนามสกุล")).toBeInTheDocument();

    await user.type(
      screen.getByLabelText("อีเมลสำหรับรับ Product Key"),
      "mint@example.com",
    );
    await user.click(
      screen.getByRole("radio", { name: "Credit / Debit Card" }),
    );
    await user.click(screen.getByRole("radio", { name: "Thai QR Payment" }));

    expect(screen.getByLabelText("อีเมลสำหรับรับ Product Key")).toHaveValue(
      "mint@example.com",
    );
  });

  it("adds priority support to the synchronized total", async () => {
    const user = userEvent.setup();
    render(<CheckoutForm />);

    await user.click(screen.getByRole("checkbox", { name: "Priority Support" }));
    expect(screen.getByText("฿1,340")).toBeInTheDocument();
    expect(screen.getByText("฿150")).toBeInTheDocument();
  });

  it("uses the shared product asset resolver for checkout items", () => {
    cartState = {
      ...cartState,
      lines: [{ ...line, imageKey: "adobe_cc" }],
    };
    render(<CheckoutForm />);

    expect(
      screen.getByRole("img", {
        name: "Microsoft Office 2021 Professional Plus",
      }),
    ).toHaveAttribute("src", expect.stringContaining("adobe-creative-cloud.png"));
  });

  it("locks duplicate submission while payment is pending", async () => {
    const user = userEvent.setup();
    let finish!: (result: CheckoutResult) => void;
    const pending = new Promise<CheckoutResult>((resolve) => {
      finish = resolve;
    });
    const checkoutSimulator = vi.fn(() => pending) as typeof simulateCheckout;
    render(<CheckoutForm checkoutSimulator={checkoutSimulator} />);
    await fillContact(user);

    const submit = screen.getByRole("button", {
      name: "ยืนยันการชำระเงิน",
    });
    await user.click(submit);

    expect(
      screen.getByRole("button", { name: "กำลังยืนยันการชำระเงิน" }),
    ).toBeDisabled();
    await user.click(
      screen.getByRole("button", { name: "กำลังยืนยันการชำระเงิน" }),
    );
    expect(checkoutSimulator).toHaveBeenCalledTimes(1);

    finish({
      status: "success",
      message: "ชำระเงินจำลองสำเร็จ",
      orderId: "SK-TEST",
    });
    await waitFor(() => expect(clearCart).toHaveBeenCalledTimes(1));
  });

  it("explains unavailable card payment and keeps the cart", async () => {
    const user = userEvent.setup();
    render(<CheckoutForm />);
    await fillContact(user);
    await user.click(
      screen.getByRole("radio", { name: "Credit / Debit Card" }),
    );
    await user.click(screen.getByRole("button", { name: "ยืนยันการชำระเงิน" }));

    expect(screen.getByRole("alert")).toHaveTextContent(
      "ยังไม่เปิดให้ชำระด้วยบัตร",
    );
    expect(clearCart).not.toHaveBeenCalled();
  });

  it("clears the cart and navigates to profile after PromptPay success", async () => {
    const user = userEvent.setup();
    const checkoutSimulator = vi.fn(async () => ({
      status: "success" as const,
      message: "ชำระเงินจำลองสำเร็จ",
      orderId: "SK-TEST",
    })) as typeof simulateCheckout;
    render(<CheckoutForm checkoutSimulator={checkoutSimulator} />);
    await fillContact(user);

    await user.click(screen.getByRole("button", { name: "ยืนยันการชำระเงิน" }));

    await waitFor(() => expect(clearCart).toHaveBeenCalledTimes(1));
    expect(screen.getByRole("status")).toHaveTextContent(
      "ชำระเงินจำลองสำเร็จ",
    );
    expect(push).toHaveBeenCalledWith("/profile");
  });

  it("shows recoverable failure feedback without clearing the cart", async () => {
    const user = userEvent.setup();
    const checkoutSimulator = vi.fn(async () => ({
      status: "failed" as const,
      message: "ไม่สามารถยืนยันการชำระเงินได้ กรุณาลองใหม่",
      recoverable: true,
    })) as typeof simulateCheckout;
    render(<CheckoutForm checkoutSimulator={checkoutSimulator} />);
    await fillContact(user);

    await user.click(screen.getByRole("button", { name: "ยืนยันการชำระเงิน" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("กรุณาลองใหม่");
    expect(clearCart).not.toHaveBeenCalled();
    expect(
      screen.getByRole("button", { name: "ยืนยันการชำระเงิน" }),
    ).toBeEnabled();
  });

  it("disables checkout for an empty cart", () => {
    cartState = {
      ...cartState,
      lines: [],
      totals: { subtotal: 0, discount: 0, total: 0 },
    };
    render(<CheckoutForm />);

    expect(screen.getByText("ไม่มีสินค้าในตะกร้า")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "ยืนยันการชำระเงิน" }),
    ).toBeDisabled();
  });
});
