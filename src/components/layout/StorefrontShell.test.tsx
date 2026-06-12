import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";

let currentPath = "/";
let cartCount = 0;

vi.mock("next/navigation", () => ({
  usePathname: () => currentPath,
}));

vi.mock("@/features/cart/CartProvider", () => ({
  useCart: () => ({
    itemCount: cartCount,
  }),
}));

const products = [
  {
    id: 3,
    name: "Microsoft Office 2021 Professional Plus",
    description: "ชุดโปรแกรมสำนักงานสำหรับ Windows",
    price: 1990,
    originalPrice: 2590,
    image: "office2021_pro",
    category: "Office",
    stock: 25,
    featuredRank: 1,
  },
];

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
    currentPath = "/category/office";
    cartCount = 3;
    document.cookie = `mock_user=${encodeURIComponent(
      JSON.stringify({ email: "buyer@example.com" }),
    )}; path=/`;

    render(<SiteHeader />);

    expect(
      screen.getByRole("link", { name: "Microsoft Office" }),
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

  it("searches products, reports no results, and restores focus on close", async () => {
    const user = userEvent.setup();
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ products }),
      }),
    );

    render(<SiteHeader />);

    const trigger = screen.getByRole("button", { name: "เปิดการค้นหา" });
    await user.click(trigger);
    const search = await screen.findByRole("searchbox", {
      name: "ค้นหาซอฟต์แวร์",
    });

    await user.type(search, "Office");
    expect(
      await screen.findByRole("link", {
        name: /Microsoft Office 2021 Professional Plus/,
      }),
    ).toHaveAttribute("href", "/product/3");

    await user.clear(search);
    await user.type(search, "ไม่พบแน่นอน");
    expect(screen.getByText("ไม่พบสินค้าที่ตรงกับคำค้นหา")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "ปิดการค้นหา" }));
    expect(trigger).toHaveFocus();
  });

  it("shows loading and supports retry after a search request fails", async () => {
    const user = userEvent.setup();
    let rejectRequest: ((reason?: unknown) => void) | undefined;
    const pending = new Promise((_resolve, reject) => {
      rejectRequest = reject;
    });
    const fetchMock = vi
      .fn()
      .mockReturnValueOnce(pending)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ products }),
      });
    vi.stubGlobal("fetch", fetchMock);

    render(<SiteHeader />);
    await user.click(screen.getByRole("button", { name: "เปิดการค้นหา" }));

    expect(screen.getByRole("status")).toHaveTextContent("กำลังโหลดสินค้า");

    await act(async () => {
      rejectRequest?.(new Error("network"));
      await pending.catch(() => undefined);
    });

    const retry = await screen.findByRole("button", { name: "ลองอีกครั้ง" });
    await user.click(retry);

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(2);
    });
    expect(
      screen.queryByText("ไม่สามารถโหลดสินค้าได้"),
    ).not.toBeInTheDocument();
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
