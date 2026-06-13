import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { AdminSalesChart } from "@/components/admin/AdminSalesChart";

vi.mock("recharts", () => ({
  Bar: () => null,
  BarChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="bar-chart">{children}</div>
  ),
  CartesianGrid: () => null,
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  Tooltip: () => null,
  XAxis: () => null,
  YAxis: () => null,
}));

describe("AdminSalesChart", () => {
  it("renders the monthly series and an accessible fallback table", () => {
    render(
      <AdminSalesChart
        data={[
          { month: "ม.ค.", revenue: 1500, orders: 2 },
          { month: "ก.พ.", revenue: 0, orders: 0 },
        ]}
      />,
    );

    expect(screen.getByTestId("bar-chart")).toBeInTheDocument();
    expect(
      screen.getByRole("table", { name: "ยอดขายรายเดือน" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("cell", { name: "฿1,500.00" })).toBeInTheDocument();
    expect(screen.getByRole("cell", { name: "2" })).toBeInTheDocument();
  });
});
