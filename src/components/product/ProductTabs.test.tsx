import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ProductTabs } from "@/components/product/ProductTabs";

describe("ProductTabs", () => {
  it("supports tab semantics and arrow, Home, and End navigation", () => {
    render(<ProductTabs reviews={[]} />);

    const details = screen.getByRole("tab", { name: "รายละเอียดสินค้า" });
    const installation = screen.getByRole("tab", { name: "วิธีติดตั้ง" });
    const reviews = screen.getByRole("tab", { name: "รีวิว" });

    expect(details).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("tabpanel")).toHaveAttribute(
      "aria-labelledby",
      details.id,
    );

    details.focus();
    fireEvent.keyDown(details, { key: "ArrowRight" });
    expect(installation).toHaveFocus();
    expect(installation).toHaveAttribute("aria-selected", "true");

    fireEvent.keyDown(installation, { key: "End" });
    expect(reviews).toHaveFocus();
    expect(reviews).toHaveAttribute("aria-selected", "true");

    fireEvent.keyDown(reviews, { key: "Home" });
    expect(details).toHaveFocus();

    fireEvent.keyDown(details, { key: "ArrowLeft" });
    expect(reviews).toHaveFocus();
  });
});
