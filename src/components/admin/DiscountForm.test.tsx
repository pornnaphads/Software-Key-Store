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

    expect(screen.getByLabelText("ประเภทส่วนลด")).toHaveValue("REGULAR");
    expect(screen.getByLabelText("มูลค่าส่วนลด")).toBeRequired();
    expect(screen.getByLabelText("รหัสผู้ใช้งาน")).toHaveValue(1);
    expect(screen.getByLabelText("วันเริ่มต้น")).toBeRequired();
    expect(screen.getByLabelText("วันสิ้นสุด")).toBeRequired();
    expect(
      screen.getByRole("button", { name: "เพิ่มโค้ดส่วนลด" }),
    ).toBeEnabled();
  });

  it("renders the edit form with initial values", () => {
    render(
      <DiscountForm
        discount={{
          id: 5,
          discountAmount: "10.00",
          customerType: "VIP",
          startDate: new Date("2026-01-01T00:00:00.000Z"),
          expirationDate: new Date("2026-12-31T23:59:59.000Z"),
          status: "ACTIVE",
          userId: 42,
          usageCount: 0,
        }}
        mode="edit"
      />,
    );

    expect(screen.getByLabelText("ประเภทส่วนลด")).toHaveValue("VIP");
    expect(screen.getByLabelText("มูลค่าส่วนลด")).toHaveValue(10.00);
    expect(screen.getByLabelText("รหัสผู้ใช้งาน")).toHaveValue(42);
    expect(
      screen.getByRole("button", { name: "บันทึกการแก้ไข" }),
    ).toBeEnabled();
  });
});

