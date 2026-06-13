import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { CatalogExplorer } from "@/components/catalog/CatalogExplorer";
import { ProductCard } from "@/components/catalog/ProductCard";

const addItem = vi.fn();
const replace = vi.fn();
let pathname = "/category/windows";
let searchParams = new URLSearchParams();
let loadState: {
  status: "ready";
  products: typeof products;
  retry: () => void;
};

vi.mock("@/features/cart/CartProvider", () => ({
  useCart: () => ({ addItem }),
}));

vi.mock("@/features/catalog/useCatalogProducts", () => ({
  useCatalogProducts: () => loadState,
}));

vi.mock("next/navigation", () => ({
  usePathname: () => pathname,
  useRouter: () => ({ replace }),
  useSearchParams: () => searchParams,
}));

const products = [
  {
    id: 1,
    name: "Windows 11 Pro",
    description: "Digital key for one PC",
    price: 790,
    originalPrice: 1590,
    image: "windows11_pro",
    category: "OS",
    stock: 5,
    featuredRank: 2,
    rating: 4.9,
    reviewCount: 120,
  },
  {
    id: 3,
    name: "Microsoft Office 2021 Professional Plus",
    description: "Word Excel PowerPoint and Outlook",
    price: 1190,
    originalPrice: 2990,
    image: "office2021_pro",
    category: "Office",
    stock: 0,
    featuredRank: 1,
    rating: 4.8,
    reviewCount: 80,
  },
];

describe("catalog components", () => {
  beforeEach(() => {
    addItem.mockReset();
    replace.mockReset();
    pathname = "/category/windows";
    searchParams = new URLSearchParams();
    loadState = {
      status: "ready",
      products,
      retry: vi.fn(),
    };
  });

  it("uses a consistent card hierarchy and adds an available product", async () => {
    const user = userEvent.setup();
    render(<ProductCard product={products[0]} />);

    expect(
      screen.getByRole("heading", { name: "Windows 11 Pro" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Digital key for one PC")).toBeInTheDocument();
    // ProductCard uses ฿790.00 format
    expect(screen.getByText("฿790.00")).toBeInTheDocument();

    await user.click(
      screen.getByRole("button", { name: "เพิ่ม Windows 11 Pro ลงตะกร้า" }),
    );

    expect(addItem).toHaveBeenCalledWith(
      expect.objectContaining({
        lineId: "1:none",
        productId: 1,
        quantity: 1,
        unitPrice: 790,
      }),
    );
  });

  it("filters by category using the toolbar select", async () => {
    const user = userEvent.setup();
    pathname = "/";
    render(<CatalogExplorer category="all" />);

    // The toolbar uses a select dropdown for categories, not buttons
    const categorySelect = screen.getByRole("combobox", { name: "เลือกหมวดหมู่" });
    await user.selectOptions(categorySelect, "windows");

    // After filtering to Windows (category="OS" in data), only Windows products should show
    expect(
      screen.getByRole("heading", { name: "Windows 11 Pro" }),
    ).toBeInTheDocument();
  });

  it("sorts products by price descending", async () => {
    const user = userEvent.setup();
    pathname = "/";
    render(<CatalogExplorer category="all" />);

    await user.selectOptions(
      screen.getByRole("combobox", { name: "เรียงสินค้า" }),
      "price-desc",
    );
    const cards = screen.getAllByTestId("product-card");
    // Office (1190) should be first after sorting by price desc
    expect(within(cards[0]).getByText("฿1,190.00")).toBeInTheDocument();
  });

  it("renders the sort combobox", () => {
    render(<CatalogExplorer category="all" />);

    expect(
      screen.getByRole("combobox", { name: "เรียงสินค้า" }),
    ).toBeInTheDocument();
  });

  it("distinguishes a true empty catalog from a filtered empty result", () => {
    loadState = {
      status: "ready",
      products: [],
      retry: vi.fn(),
    };
    const { unmount } = render(<CatalogExplorer category="all" />);
    expect(screen.getByText("ยังไม่มีสินค้าในร้าน")).toBeInTheDocument();
    unmount();

    loadState = {
      status: "ready",
      products,
      retry: vi.fn(),
    };
    searchParams = new URLSearchParams("q=missing");
    render(<CatalogExplorer category="all" />);
    return waitFor(() => {
      expect(screen.getByText("ไม่พบสินค้าตามตัวกรอง")).toBeInTheDocument();
    });
  });
});
