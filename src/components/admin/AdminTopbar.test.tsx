import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

const navigation = vi.hoisted(() => ({
  pathname: "/admin",
}));

vi.mock("next/navigation", () => ({
  usePathname: () => navigation.pathname,
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
}));

vi.mock("@/components/admin/AdminMobileNav", () => ({
  AdminMobileNav: () => null,
}));

import { AdminTopbar } from "@/components/admin/AdminTopbar";

describe("AdminTopbar", () => {
  afterEach(() => {
    navigation.pathname = "/admin";
  });

  it("shows the calendar and notification buttons on the dashboard", () => {
    render(<AdminTopbar />);

    expect(screen.queryByText("Admin")).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "เปิดปฏิทิน" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "การแจ้งเตือน" }),
    ).toBeInTheDocument();
  });

  it("hides the dashboard controls on other admin pages", () => {
    navigation.pathname = "/admin/orders";

    render(<AdminTopbar />);

    expect(
      screen.queryByRole("button", { name: "เปิดปฏิทิน" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "การแจ้งเตือน" }),
    ).not.toBeInTheDocument();
  });
});
