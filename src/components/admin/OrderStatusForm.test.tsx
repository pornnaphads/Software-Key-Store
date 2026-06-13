import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { OrderStatusForm } from "@/components/admin/OrderStatusForm";

vi.mock("@/app/admin/orders/actions", () => ({
  updateOrderStatusAction: vi.fn(),
}));

describe("OrderStatusForm", () => {
  it("offers paid and cancelled only for pending orders", () => {
    render(<OrderStatusForm orderId={10} status="PENDING" />);

    expect(
      screen.getByRole("button", { name: "ยืนยันว่าชำระแล้ว" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "ยกเลิกคำสั่งซื้อ" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "ทำรายการให้เสร็จ" }),
    ).not.toBeInTheDocument();
    expect(screen.queryByText("refund")).not.toBeInTheDocument();
  });

  it("offers completed only for paid orders", () => {
    render(<OrderStatusForm orderId={10} status="PAID" />);

    expect(
      screen.getByRole("button", { name: "ทำรายการให้เสร็จ" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "ยกเลิกคำสั่งซื้อ" }),
    ).not.toBeInTheDocument();
  });

  it("renders no mutation controls for terminal statuses", () => {
    const { rerender } = render(
      <OrderStatusForm orderId={10} status="COMPLETED" />,
    );

    expect(screen.queryByRole("button")).not.toBeInTheDocument();

    rerender(<OrderStatusForm orderId={10} status="CANCELLED" />);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});
