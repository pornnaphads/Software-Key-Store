import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { PurchasePanel } from "@/components/product/PurchasePanel";
import type { ProductDetail, ProductOption } from "@/types/commerce";

const addItem = vi.fn();
const push = vi.fn();

vi.mock("@/features/cart/CartProvider", () => ({
  useCart: () => ({ addItem }),
}));

vi.mock("next-auth/react", () => ({
  useSession: () => ({ status: "authenticated", data: { user: { name: "Test" } } }),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));

const product: ProductDetail = {
  id: 3,
  name: "Microsoft Office 2021 Professional Plus",
  description: "Office productivity suite",
  price: 1190,
  image: "office2021_pro",
  category: "Office",
  stock: 3,
  featuredRank: 1,
  reviews: [],
};

const options: ProductOption[] = [
  { id: "word", label: "Microsoft Word", price: 450 },
];

describe("PurchasePanel", () => {
  beforeEach(() => {
    addItem.mockReset();
    push.mockReset();
  });

  it("adds the configured line and announces success", async () => {
    const user = userEvent.setup();
    render(
      <PurchasePanel
        options={options}
        product={product}
        quantity={2}
        unitPrice={1640}
      />,
    );

    await user.click(screen.getByRole("button", { name: "เพิ่มลงตะกร้า" }));

    expect(addItem).toHaveBeenCalledWith(
      expect.objectContaining({
        lineId: "3:word",
        productId: 3,
        options,
        quantity: 2,
        unitPrice: 1640,
      }),
    );
    expect(screen.getByRole("status")).toHaveTextContent(
      "เพิ่ม Microsoft Office 2021 Professional Plus ลงตะกร้าแล้ว",
    );
  });

  it("adds the line and navigates to checkout for buy now", async () => {
    const user = userEvent.setup();
    render(
      <PurchasePanel
        options={options}
        product={product}
        quantity={1}
        unitPrice={1640}
      />,
    );

    await user.click(screen.getByRole("button", { name: "ซื้อทันที" }));

    expect(addItem).toHaveBeenCalledTimes(1);
    expect(push).toHaveBeenCalledWith("/checkout");
  });
});
