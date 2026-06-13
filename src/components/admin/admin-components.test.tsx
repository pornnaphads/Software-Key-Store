import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";

describe("admin shared UI", () => {
  it("renders a semantic page heading and breadcrumb", () => {
    render(
      <AdminPageHeader
        breadcrumb={["หน้าแรก", "รายการสั่งซื้อ"]}
        title="รายการสั่งซื้อ"
      />,
    );

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "รายการสั่งซื้อ",
      }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("เส้นทางนำทาง")).toBeInTheDocument();
  });

  it("does not communicate status by color alone", () => {
    render(<AdminStatusBadge status="PAID" />);

    expect(screen.getByText("ชำระแล้ว")).toHaveAccessibleName(
      "สถานะ ชำระแล้ว",
    );
  });
});
