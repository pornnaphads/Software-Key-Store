import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { ProductConfigurator } from "@/components/product/ProductConfigurator";
import type { ProductDetail } from "@/types/commerce";

vi.mock("@/features/cart/CartProvider", () => ({
  useCart: () => ({ addItem: vi.fn() }),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

const product: ProductDetail = {
  id: 3,
  name: "Microsoft Office 2021 Professional Plus",
  description: "Office productivity suite",
  price: 1190,
  originalPrice: 2990,
  image: "office2021_pro",
  category: "Office",
  stock: 3,
  featuredRank: 1,
  rating: 4.8,
  reviewCount: 12,
  reviews: [],
};

describe("ProductConfigurator", () => {
  it("updates unit and total prices when options change", async () => {
    const user = userEvent.setup();
    render(<ProductConfigurator product={product} />);

    expect(screen.getByText("ราคาต่อสิทธิ์ ฿1,190")).toBeInTheDocument();
    expect(screen.getByText("ยอดรวม ฿1,190")).toBeInTheDocument();

    await user.click(screen.getByRole("checkbox", { name: /Microsoft Word/ }));
    await user.click(screen.getByRole("checkbox", { name: /Microsoft Excel/ }));

    expect(screen.getByText("ราคาต่อสิทธิ์ ฿2,090")).toBeInTheDocument();
    expect(screen.getByText("ยอดรวม ฿2,090")).toBeInTheDocument();

    await user.click(screen.getByRole("checkbox", { name: /Microsoft Word/ }));
    expect(screen.getByText("ราคาต่อสิทธิ์ ฿1,640")).toBeInTheDocument();
  });

  it("clamps quantity at available stock", async () => {
    const user = userEvent.setup();
    render(<ProductConfigurator product={product} />);

    const increase = screen.getByRole("button", {
      name: "เพิ่มจำนวน Microsoft Office 2021 Professional Plus",
    });
    await user.click(increase);
    await user.click(increase);

    expect(screen.getByRole("spinbutton", { name: "จำนวนสิทธิ์" })).toHaveValue(
      3,
    );
    expect(increase).toBeDisabled();
    expect(screen.getByText("ยอดรวม ฿3,570")).toBeInTheDocument();
  });

  it("disables purchase when stock is zero", () => {
    render(
      <ProductConfigurator
        product={{
          ...product,
          stock: 0,
        }}
      />,
    );

    expect(
      screen.getByRole("button", { name: "เพิ่มลงตะกร้า" }),
    ).toBeDisabled();
    expect(screen.getByRole("button", { name: "ซื้อทันที" })).toBeDisabled();
    expect(screen.getByText("สินค้าหมดชั่วคราว")).toBeInTheDocument();
  });
});
