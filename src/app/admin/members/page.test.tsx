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
  it("renders the compact customer member list", async () => {
    getMembers.mockResolvedValue([
      {
        id: 6,
        name: "Mint Jirawat",
        email: "mint.j@example.com",
        role: "CUSTOMER",
        orderCount: 12,
        totalSpent: 12450,
        createdAt: new Date("2026-01-15T00:00:00.000Z"),
      },
    ]);
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

    const summary = screen.getByRole("region", { name: "สรุปสมาชิก" });
    expect(within(summary).getAllByRole("article")).toHaveLength(1);
    expect(within(summary).getByText("สมาชิกทั้งหมด")).toBeInTheDocument();
    expect(screen.getByRole("searchbox", { name: "ค้นหาสมาชิก" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "ชื่อ-นามสกุล" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "วันที่สมัคร" })).toBeInTheDocument();
    expect(screen.queryByRole("columnheader", { name: "บทบาท" })).not.toBeInTheDocument();
    expect(screen.getByText("Mint Jirawat")).toBeInTheDocument();
  });
});
