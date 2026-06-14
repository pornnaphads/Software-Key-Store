import { describe, expect, it } from "vitest";

import { calculateMonthlyRevenue } from "./dashboard-revenue";

describe("calculateMonthlyRevenue", () => {
  it("returns the full paid revenue for the selected month without deductions", () => {
    const result = calculateMonthlyRevenue(
      [
        { total: 790, createdAt: new Date("2026-06-14T08:00:00.000Z") },
        { total: 210, createdAt: new Date("2026-06-20T08:00:00.000Z") },
        { total: 500, createdAt: new Date("2026-05-31T08:00:00.000Z") },
      ],
      new Date("2026-06-15T00:00:00.000Z"),
    );

    expect(result).toBe(1000);
  });
});
