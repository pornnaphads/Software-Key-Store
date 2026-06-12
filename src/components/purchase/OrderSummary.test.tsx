import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { OrderSummary } from "@/components/purchase/OrderSummary";

describe("OrderSummary", () => {
  it("applies a valid promotion and shows the discounted total", async () => {
    const user = userEvent.setup();
    const onApplyPromotion = vi.fn(() => ({
      valid: true,
      code: "SOFTKEY10",
      discountRate: 0.1,
      message: "ใช้ส่วนลด 10% แล้ว",
    }));

    render(
      <OrderSummary
        onApplyPromotion={onApplyPromotion}
        onClearPromotion={vi.fn()}
        promotion={{
          valid: true,
          code: null,
          discountRate: 0,
          message: "",
        }}
        totals={{ subtotal: 1190, discount: 119, total: 1071 }}
      />,
    );

    await user.type(screen.getByLabelText("โค้ดส่วนลด"), "SOFTKEY10");
    await user.click(screen.getByRole("button", { name: "ใช้โค้ด" }));

    expect(onApplyPromotion).toHaveBeenCalledWith("SOFTKEY10");
    expect(screen.getByText("-฿119")).toBeInTheDocument();
    expect(screen.getByText("฿1,071")).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("ใช้ส่วนลด 10% แล้ว");
  });

  it("shows an invalid promotion without changing checkout availability", async () => {
    const user = userEvent.setup();
    const onApplyPromotion = vi.fn(() => ({
      valid: false,
      code: null,
      discountRate: 0,
      message: "ไม่พบโค้ดส่วนลดนี้",
    }));

    render(
      <OrderSummary
        onApplyPromotion={onApplyPromotion}
        onClearPromotion={vi.fn()}
        promotion={{
          valid: true,
          code: null,
          discountRate: 0,
          message: "",
        }}
        totals={{ subtotal: 1190, discount: 0, total: 1190 }}
      />,
    );

    await user.type(screen.getByLabelText("โค้ดส่วนลด"), "missing");
    await user.click(screen.getByRole("button", { name: "ใช้โค้ด" }));

    expect(screen.getByRole("alert")).toHaveTextContent("ไม่พบโค้ดส่วนลดนี้");
    expect(screen.getByRole("link", { name: "ดำเนินการชำระเงิน" })).toHaveAttribute(
      "href",
      "/checkout",
    );
  });

  it("renders checkout as disabled when no valid lines remain", () => {
    render(
      <OrderSummary
        checkoutDisabled
        onApplyPromotion={vi.fn()}
        onClearPromotion={vi.fn()}
        promotion={{
          valid: true,
          code: null,
          discountRate: 0,
          message: "",
        }}
        totals={{ subtotal: 0, discount: 0, total: 0 }}
      />,
    );

    expect(
      screen.getByRole("button", { name: "ดำเนินการชำระเงิน" }),
    ).toBeDisabled();
  });
});
