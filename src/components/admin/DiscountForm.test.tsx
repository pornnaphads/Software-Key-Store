import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { DiscountForm } from "@/components/admin/DiscountForm";

vi.mock("@/app/admin/discounts/actions", () => ({
  createDiscountAction: vi.fn(),
  updateDiscountAction: vi.fn(),
}));

describe("DiscountForm", () => {
  it("renders the complete create form", () => {
    render(<DiscountForm mode="create" />);

    expect(screen.getByLabelText("โค้ดส่วนลด")).toBeRequired();
    expect(screen.getByLabelText("ประเภทส่วนลด")).toHaveValue("PERCENT");
    expect(screen.getByLabelText("มูลค่าส่วนลด")).toBeRequired();
    expect(screen.getByLabelText("วันเริ่มต้น")).toBeRequired();
    expect(screen.getByLabelText("วันสิ้นสุด")).toBeRequired();
    expect(
      screen.getByRole("button", { name: "เพิ่มโค้ดส่วนลด" }),
    ).toBeEnabled();
  });

  it("locks a used code while allowing the remaining fields to be edited", () => {
    render(
      <DiscountForm
        discount={{
          id: 5,
          code: "WELCOME10",
          type: "PERCENT",
          value: "10.00",
          minimumOrderAmount: "500.00",
          maximumDiscountAmount: "300.00",
          startsAt: "2026-01-01T00:00:00.000Z",
          endsAt: "2026-12-31T23:59:59.000Z",
          usageLimit: 1000,
          perUserLimit: 1,
          isActive: true,
          archivedAt: null,
          usageCount: 1,
        }}
        mode="edit"
      />,
    );

    expect(screen.getByLabelText("โค้ดส่วนลด")).toHaveValue("WELCOME10");
    expect(screen.getByLabelText("โค้ดส่วนลด")).toHaveAttribute("readonly");
    expect(screen.getByText("โค้ดนี้ถูกใช้แล้ว จึงไม่สามารถเปลี่ยนชื่อได้"))
      .toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "บันทึกการแก้ไข" }),
    ).toBeEnabled();
  });
});
