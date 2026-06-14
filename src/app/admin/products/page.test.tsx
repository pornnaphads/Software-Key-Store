import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

const { listAdminProducts, parseProductListQuery } = vi.hoisted(() => ({
  listAdminProducts: vi.fn(),
  parseProductListQuery: vi.fn(),
}));

vi.mock("@/data/admin/products", () => ({
  listAdminProducts,
  parseProductListQuery,
}));

vi.mock("@/app/admin/products/actions", () => ({
  archiveProductAction: vi.fn(),
}));

vi.mock("@/components/admin/AdminSearch", () => ({
  AdminSearch: () => <div>ค้นหาสินค้า</div>,
}));

import AdminProductsPage from "./page";

describe("AdminProductsPage", () => {
  it("renders the compact product management layout", async () => {
    parseProductListQuery.mockReturnValue({
      page: 1,
      pageSize: 10,
      search: "",
      category: "",
      state: "active",
      sort: "createdAt",
      direction: "desc",
    });

    listAdminProducts.mockResolvedValue({
      rows: [
        {
          id: 1,
          name: "Windows 11 Pro",
          description: "Lifetime license",
          category: "Windows",
          price: "2990.00",
          stock: 1245,
          image: "windows11_pro",
          archivedAt: null,
          createdAt: "2026-06-14T00:00:00.000Z",
          soldCount: 562,
          availableKeyCount: 1245,
        },
      ],
      totalRows: 1,
      page: 1,
      pageSize: 10,
      categories: ["Windows"],
      stats: {
        totalProducts: 78,
        availableProducts: 73,
        outOfStockProducts: 5,
        availableKeys: 4325,
      },
    });

    render(
      await AdminProductsPage({
        searchParams: Promise.resolve({}),
      }),
    );

    expect(screen.queryByRole("heading", { name: "จัดการสินค้า" })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "เพิ่มสินค้าใหม่" })).toBeInTheDocument();
    expect(screen.getAllByRole("combobox")).toHaveLength(2);

    const summary = screen.getByRole("region", { name: "สรุปสินค้า" });
    expect(within(summary).getAllByRole("article")).toHaveLength(4);
    expect(within(summary).getByText("สินค้าทั้งหมด")).toBeInTheDocument();
    expect(within(summary).getByText("พร้อมขาย")).toBeInTheDocument();
    expect(within(summary).getByText("ไม่มีสินค้า")).toBeInTheDocument();
    expect(within(summary).getByText("คีย์คงเหลือทั้งหมด")).toBeInTheDocument();
    expect(screen.getByText("Windows 11 Pro")).toBeInTheDocument();
  });
});
