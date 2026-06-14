import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

const { listOrders, parseOrderListQuery } = vi.hoisted(() => ({
  listOrders: vi.fn(),
  parseOrderListQuery: vi.fn(),
}));

vi.mock("@/data/admin/orders", () => ({
  listOrders,
  parseOrderListQuery,
}));

import AdminOrdersPage from "./page";

describe("AdminOrdersPage", () => {
  it("matches the compact order overview layout", async () => {
    parseOrderListQuery.mockReturnValue({
      page: 1,
      pageSize: 10,
      search: "",
      status: null,
      from: null,
      to: null,
    });

    listOrders.mockResolvedValue({
      rows: [
        {
          id: 12,
          customerName: "Test User",
          customerEmail: "test@example.com",
          subtotal: "990.00",
          discountAmount: "0.00",
          total: "990.00",
          discountCode: null,
          status: "PAID",
          paymentMethod: "QR",
          createdAt: "2026-06-13T08:00:00.000Z",
          items: [
            {
              id: 1,
              productName: "Windows 11 Pro",
              productImage: "windows11_pro",
              expirationDate: "2027-06-13T08:00:00.000Z",
              quantity: 2,
              price: "495.00",
              hasLicenseKey: true,
            },
          ],
        },
      ],
      totalRows: 24,
      page: 1,
      pageSize: 10,
      stats: {
        totalOrders: 24,
        totalItems: 57,
        totalCustomers: 9,
      },
    });

    render(
      await AdminOrdersPage({
        searchParams: Promise.resolve({}),
      }),
    );

    const summary = screen.getByRole("region", {
      name: "สรุปรายการสั่งซื้อ",
    });

    expect(within(summary).getAllByRole("article")).toHaveLength(2);
    expect(within(summary).getByText("จำนวนคำสั่งซื้อ")).toBeInTheDocument();
    expect(within(summary).getByText("จำนวนลูกค้า")).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "อีเมล" })).toBeInTheDocument();
    expect(
      screen.getByRole("columnheader", { name: "วันหมดอายุ" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Windows 11 Pro")).toBeInTheDocument();
    expect(screen.queryByRole("columnheader", { name: "สถานะ" })).not.toBeInTheDocument();
    expect(screen.queryByRole("columnheader", { name: "จัดการ" })).not.toBeInTheDocument();
  });
});
