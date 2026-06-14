import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({
  usePathname: () => "/admin/chat",
}));

import { AdminNavLinks } from "./AdminNavLinks";

describe("AdminNavLinks", () => {
  it("does not show the contact link in the primary navigation", () => {
    render(<AdminNavLinks />);

    expect(
      screen.queryByRole("link", { name: "ช่องทางติดต่อ" }),
    ).not.toBeInTheDocument();
  });
});
