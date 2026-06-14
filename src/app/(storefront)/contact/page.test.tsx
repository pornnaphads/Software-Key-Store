import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import ContactPage from "./page";

describe("ContactPage", () => {
  it("shows the three contact methods without the old contact form", () => {
    render(<ContactPage />);

    expect(
      screen.getByRole("heading", { name: "ติดต่อเรา" }),
    ).toBeInTheDocument();
    expect(screen.getByText("support@softkeystore.com")).toBeInTheDocument();
    expect(screen.getByText("+66 2 123 4567")).toBeInTheDocument();
    expect(screen.getByText(/24\/7 Support/)).toBeInTheDocument();
    expect(screen.queryByRole("form")).not.toBeInTheDocument();
  });
});
