import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ProductForm } from "@/components/admin/ProductForm";

vi.mock("@/app/admin/products/actions", () => ({
  createProductAction: vi.fn(),
  updateProductAction: vi.fn(),
}));

describe("ProductForm", () => {
  it("renders create fields and accepts only approved image types", () => {
    render(<ProductForm mode="create" />);

    expect(screen.getByLabelText("ชื่อสินค้า")).toBeRequired();
    expect(screen.getByLabelText("รายละเอียดสินค้า")).toBeRequired();
    expect(screen.getByLabelText("รูปสินค้า")).toHaveAttribute(
      "accept",
      "image/jpeg,image/png,image/webp",
    );
    expect(screen.getByRole("button", { name: "เพิ่มสินค้า" })).toBeEnabled();
  });

  it("prefills edit values and shows the current product image", () => {
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
        }}
      />,
    );

    expect(screen.getByLabelText("ชื่อสินค้า")).toHaveValue("Windows 11 Pro");
    expect(screen.getByRole("img", { name: "รูปปัจจุบันของ Windows 11 Pro" }))
      .toHaveAttribute("src", expect.stringContaining("windows11-pro.png"));
    expect(
      screen.getByRole("button", { name: "บันทึกการแก้ไข" }),
    ).toBeEnabled();
  });
});
