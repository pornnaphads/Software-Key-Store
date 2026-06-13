import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { AdminDashboardKpis } from "@/components/admin/AdminDashboardKpis";

describe("AdminDashboardKpis", () => {
  it("uses the approved revenue copy without the fee description", () => {
    const { container } = render(
      <AdminDashboardKpis
        grossSales="฿385,881.00"
        netRevenue="฿355,010.52"
      />,
    );

    expect(screen.getByText("รายได้รายเดือน")).toBeInTheDocument();
    expect(
      screen.queryByText("หักต้นทุนและค่าธรรมเนียม"),
    ).not.toBeInTheDocument();
    expect(
      container.querySelectorAll(".admin-kpi-card__icon"),
    ).toHaveLength(2);
  });
});
