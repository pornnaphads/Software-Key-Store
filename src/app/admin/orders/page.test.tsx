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

vi.mock("@/components/admin/OrderDetailsDialog", () => ({
  OrderDetailsDialog: () => <button type="button">รายละเอียด</button>,
}));

vi.mock("@/components/admin/OrderStatusForm", () => ({
  OrderStatusForm: () => <button type="button">เปลี่ยนสถานะ</button>,
}));

vi.mock("@/components/admin/AdminSearch", () => ({
  AdminSearch: () => <div>ค้นหารายการ</div>,
}));

import AdminOrdersPage from "./page";

describe("AdminOrdersPage", () => {
  it("removes the filter panel and shows summary cards", async () => {
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
      },
    });

    render(
      await AdminOrdersPage({
        searchParams: Promise.resolve({}),
      }),
    );

    const summary = screen.getByRole("region", {
      name: "สรุปคำสั่งซื้อ",
    });

    expect(within(summary).getAllByRole("article")).toHaveLength(2);
    expect(
      within(summary).getByText("จำนวนรายการสั่งซื้อ"),
    ).toBeInTheDocument();
    expect(within(summary).getByText("จำนวนสินค้า")).toBeInTheDocument();
    expect(
      screen.queryByRole("region", { name: "ตัวกรองคำสั่งซื้อ" }),
    ).not.toBeInTheDocument();
    expect(screen.queryByText("ค้นหารายการ")).not.toBeInTheDocument();
    expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
  });
});
