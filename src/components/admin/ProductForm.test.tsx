import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ProductForm } from "@/components/admin/ProductForm";

vi.mock("@/app/admin/products/actions", () => ({
  createProductAction: vi.fn(),
  updateProductAction: vi.fn(),
}));

describe("ProductForm", () => {
  it("renders create fields and does not show original price, category is select dropdown", () => {
    render(<ProductForm mode="create" />);

    expect(screen.getByLabelText("ชื่อสินค้า")).toBeRequired();
    expect(screen.getByLabelText("รายละเอียดสินค้า")).toBeRequired();
    expect(screen.getByLabelText("หมวดหมู่")).toBeRequired();
    expect(screen.getByRole("combobox", { name: "หมวดหมู่" })).toBeInTheDocument();
    expect(screen.queryByLabelText("ราคาปกติ (บาท)", { exact: false })).not.toBeInTheDocument();
    expect(screen.getByLabelText("Product Keys (คีย์ละบรรทัด)", { exact: false })).toBeInTheDocument();
  });

  it("prefills edit values and does not render keys input or original price", () => {
    render(
      <ProductForm
        mode="edit"
        product={{
          id: 3,
          name: "Windows 11 Pro",
          description: "Digital lifetime license",
          category: "Windows",
          price: "2990.00",
          originalPrice: "3490.00",
          stock: 12,
          image: "windows11_pro",
          archivedAt: null,
          createdAt: "2026-06-13T00:00:00.000Z",
          soldCount: 0,
          availableKeyCount: 12,
        }}
      />,
    );

    expect(screen.getByLabelText("ชื่อสินค้า")).toHaveValue("Windows 11 Pro");
    expect(screen.getByRole("combobox", { name: "หมวดหมู่" })).toHaveValue("Windows");
    expect(screen.queryByLabelText("ราคาปกติ (บาท)", { exact: false })).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Product Keys (คีย์ละบรรทัด)", { exact: false })).not.toBeInTheDocument();
  });
});
