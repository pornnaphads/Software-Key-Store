import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { ProductConfigurator } from "@/components/product/ProductConfigurator";
import type { ProductDetail } from "@/types/commerce";

vi.mock("@/features/cart/CartProvider", () => ({
  useCart: () => ({ addItem: vi.fn() }),
}));

vi.mock("next-auth/react", () => ({
  useSession: () => ({ status: "authenticated", data: { user: { name: "Test" } } }),
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

    // Base price displayed in the component
    expect(screen.getAllByText("฿ 1,190.00").length).toBeGreaterThan(0);

    await user.click(screen.getByRole("checkbox", { name: /Microsoft Word/ }));
    await user.click(screen.getByRole("checkbox", { name: /Microsoft Excel/ }));

    // After adding Word (450) + Excel (450) = 1190 + 900 = 2090
    expect(screen.getAllByText("฿ 2,090.00").length).toBeGreaterThan(0);

    await user.click(screen.getByRole("checkbox", { name: /Microsoft Word/ }));
    // After removing Word: 1190 + 450 = 1640
    expect(screen.getAllByText("฿ 1,640.00").length).toBeGreaterThan(0);
  });

  it("clamps quantity at available stock", async () => {
    const user = userEvent.setup();
    render(<ProductConfigurator product={product} />);

    // Find increase button (the one with "add" icon)
    const buttons = screen.getAllByRole("button");
    // The increase button has the "add" material icon
    const increase = buttons.find((btn) =>
      btn.textContent?.includes("add"),
    )!;

    await user.click(increase);
    await user.click(increase);

    // After 2 clicks, quantity should be 3 (max stock)
    const input = screen.getByRole("spinbutton");
    expect(input).toHaveValue(3);
    expect(increase).toBeDisabled();

    // Total should be 1190 * 3 = 3570
    expect(screen.getAllByText("฿ 3,570.00").length).toBeGreaterThan(0);
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

    const buttons = screen.getAllByRole("button");
    const addToCartBtn = buttons.find((btn) =>
      btn.textContent?.includes("เพิ่มลงตะกร้า"),
    )!;
    const buyNowBtn = buttons.find((btn) =>
      btn.textContent?.includes("ซื้อเลย"),
    )!;

    expect(addToCartBtn).toBeDisabled();
    expect(buyNowBtn).toBeDisabled();
  });
});
