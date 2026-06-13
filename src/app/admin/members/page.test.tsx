import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

const { getMembers, getMemberStats } = vi.hoisted(() => ({
  getMembers: vi.fn(),
  getMemberStats: vi.fn(),
}));

vi.mock("@/data/admin/members", () => ({
  getMembers,
  getMemberStats,
}));

import AdminMembersPage from "./page";

describe("AdminMembersPage", () => {
  it("shows only total members and customers in the KPI summary", async () => {
    getMembers.mockResolvedValue([]);
    getMemberStats.mockResolvedValue({
      totalMembers: 9,
      adminCount: 1,
      customerCount: 8,
    });

    render(
      await AdminMembersPage({
        searchParams: Promise.resolve({}),
      }),
    );

    const summary = screen.getByRole("region", {
      name: "ตัวชี้วัดสมาชิก",
    });

    expect(within(summary).getAllByRole("article")).toHaveLength(2);
    expect(within(summary).getByText("สมาชิกทั้งหมด")).toBeInTheDocument();
    expect(within(summary).getByText("ลูกค้า")).toBeInTheDocument();
    expect(
      within(summary).queryByText("ผู้ดูแลระบบ"),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("option", { name: "ผู้ดูแลระบบ" }),
    ).toBeInTheDocument();
  });
});
