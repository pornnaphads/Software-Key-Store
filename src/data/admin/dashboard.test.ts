import { describe, expect, it } from "vitest";

import { summarizeDashboardRows } from "@/data/admin/dashboard";

describe("dashboard summaries", () => {
  it("counts only paid and completed revenue", () => {
    const result = summarizeDashboardRows([
      {
        status: "PAID",
        total: "1000.00",
        createdAt: new Date("2026-01-10"),
      },
      {
        status: "COMPLETED",
        total: "500.00",
        createdAt: new Date("2026-01-12"),
      },
      {
        status: "PENDING",
        total: "900.00",
        createdAt: new Date("2026-01-15"),
      },
      {
        status: "CANCELLED",
        total: "200.00",
        createdAt: new Date("2026-01-16"),
      },
    ]);

    expect(result.revenue).toBe("1500.00");
    expect(result.orderCount).toBe(2);
    expect(result.averageOrderValue).toBe("750.00");
  });

  it("returns zero average when there are no settled orders", () => {
    const result = summarizeDashboardRows([
      {
        status: "PENDING",
        total: "900.00",
        createdAt: new Date("2026-01-15"),
      },
    ]);

    expect(result).toMatchObject({
      revenue: "0.00",
      orderCount: 0,
      averageOrderValue: "0.00",
    });
  });
});
