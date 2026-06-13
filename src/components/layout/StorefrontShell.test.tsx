import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";

let currentPath = "/";
let cartCount = 0;

vi.mock("next/navigation", () => ({
  usePathname: () => currentPath,
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}));

vi.mock("@/features/cart/CartProvider", () => ({
  useCart: () => ({
    itemCount: cartCount,
  }),
}));

vi.mock("next-auth/react", () => ({
  useSession: () => ({ data: null, status: "unauthenticated" }),
}));

describe("storefront shell", () => {
  beforeEach(() => {
    currentPath = "/";
    cartCount = 0;
    document.cookie = "mock_user=; Max-Age=0; path=/";
    vi.restoreAllMocks();
  });

  afterEach(() => {
    document.body.style.overflow = "";
  });

  it("marks the current route and reflects cart and account state", async () => {
    currentPath = "/all-products";
    cartCount = 3;
    document.cookie = `mock_user=${encodeURIComponent(
      JSON.stringify({ email: "buyer@example.com" }),
    )}; path=/`;

    render(<SiteHeader />);

    expect(
      screen.getByRole("link", { name: "สินค้าทั้งหมด" }),
    ).toHaveAttribute("aria-current", "page");
    expect(
      screen.getByRole("link", { name: "ตะกร้าสินค้า 3 รายการ" }),
    ).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByRole("link", { name: "บัญชีของฉัน" })).toHaveAttribute(
        "href",
        "/profile",
      );
    });
  });

  it("opens and closes mobile navigation with Escape and restores focus", async () => {
    const user = userEvent.setup();
    render(<SiteHeader />);

    const trigger = screen.getByRole("button", { name: "เปิดเมนู" });
    await user.click(trigger);

    expect(
      screen.getByRole("dialog", { name: "เมนูหลัก" }),
    ).toBeInTheDocument();
    expect(document.body.style.overflow).toBe("hidden");

    await user.keyboard("{Escape}");

    expect(
      screen.queryByRole("dialog", { name: "เมนูหลัก" }),
    ).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it("renders header navigation links correctly", () => {
    render(<SiteHeader />);

    // Verify main navigation links exist
    expect(screen.getByRole("link", { name: "สินค้าทั้งหมด" })).toHaveAttribute("href", "/all-products");
    expect(screen.getByRole("link", { name: "วิธีสั่งซื้อ" })).toHaveAttribute("href", "/how-to-buy");
    expect(screen.getByRole("link", { name: "ติดต่อ" })).toHaveAttribute("href", "/contact");
  });

  it("shows cart count badge when items exist", () => {
    cartCount = 5;
    render(<SiteHeader />);

    expect(
      screen.getByRole("link", { name: "ตะกร้าสินค้า 5 รายการ" }),
    ).toHaveAttribute("href", "/cart");
  });

  it("does not render placeholder links", () => {
    const { container } = render(
      <>
        <SiteHeader />
        <SiteFooter />
      </>,
    );

    expect(container.querySelector('a[href="#"]')).not.toBeInTheDocument();
  });
});
