import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { DiscountForm } from "@/components/admin/DiscountForm";

vi.mock("@/app/admin/discounts/actions", () => ({
  createDiscountAction: vi.fn(),
  updateDiscountAction: vi.fn(),
}));

describe("DiscountForm", () => {
  it("renders the reference create form", () => {
    render(<DiscountForm mode="create" />);

    expect(screen.getByLabelText("โค้ดส่วนลด")).toBeRequired();
    expect(screen.getByLabelText("ส่วนลด")).toBeRequired();
    expect(screen.getByLabelText("ลูกค้าใหม่")).toBeChecked();
    expect(screen.getByLabelText("วันที่เริ่ม")).toBeRequired();
    expect(screen.getByLabelText("วันที่สิ้นสุด")).toBeRequired();
    expect(screen.getByLabelText("สถานะ")).toHaveValue("ACTIVE");
    expect(
      screen.getByRole("button", { name: "บันทึกโค้ดส่วนลด" }),
    ).toBeEnabled();
  });

  it("renders existing values in edit mode", () => {
    render(
      <DiscountForm
        discount={{
          id: 5,
          discountAmount: "10.00",
          customerType: "VIP10",
          startDate: new Date("2026-01-01T00:00:00.000Z"),
          expirationDate: new Date("2026-12-31T23:59:59.000Z"),
          status: "ACTIVE",
          userId: 42,
          usageCount: 0,
        }}
        mode="edit"
      />,
    );

    expect(screen.getByLabelText("โค้ดส่วนลด")).toHaveValue("VIP10");
    expect(screen.getByLabelText("ส่วนลด")).toHaveValue(10);
    expect(
      screen.getByRole("button", { name: "บันทึกการแก้ไข" }),
    ).toBeEnabled();
  });
});
