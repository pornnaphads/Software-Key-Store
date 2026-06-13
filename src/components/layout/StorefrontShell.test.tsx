import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";

let currentPath = "/";
let cartCount = 0;
let sessionState: {
  data: { user?: { name?: string | null } } | null;
  status: "authenticated" | "unauthenticated" | "loading";
} = {
  data: null,
  status: "unauthenticated",
};

vi.mock("next/navigation", () => ({
  usePathname: () => currentPath,
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock("@/features/cart/CartProvider", () => ({
  useCart: () => ({
    itemCount: cartCount,
  }),
}));

vi.mock("next-auth/react", () => ({
  useSession: () => sessionState,
}));

describe("storefront shell", () => {
  beforeEach(() => {
    currentPath = "/";
    cartCount = 0;
    sessionState = {
      data: null,
      status: "unauthenticated",
    };
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

  it("shows cart count badge when items exist and user is logged in", () => {
    cartCount = 5;
    sessionState = { data: { user: { name: "Test" } }, status: "authenticated" };
    render(<SiteHeader />);

    expect(
      screen.getByRole("link", { name: "ตะกร้าสินค้า 5 รายการ" }),
    ).toHaveAttribute("href", "/cart");
  });

  it("redirects guests to login when clicking the cart link", () => {
    cartCount = 0;
    sessionState = { data: null, status: "unauthenticated" };
    render(<SiteHeader />);

    expect(
      screen.getByRole("link", { name: "ตะกร้าสินค้า 0 รายการ" }),
    ).toHaveAttribute("href", "/login?callbackUrl=/cart");
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

  it("shows the profile link and user name immediately for an authenticated session", () => {
    sessionState = {
      data: {
        user: {
          name: "Mint Jirawat",
        },
      },
      status: "authenticated",
    };

    render(<SiteHeader />);

    expect(screen.getByRole("link", { name: "บัญชีของฉัน" })).toHaveAttribute(
      "href",
      "/profile",
    );
    expect(screen.getByText("Mint Jirawat")).toBeInTheDocument();
  });
});
