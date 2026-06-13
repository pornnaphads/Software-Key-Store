import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ProductTabs } from "@/components/product/ProductTabs";

describe("ProductTabs", () => {
  it("supports tab switching and displays correct content", () => {
    render(<ProductTabs reviews={[]} />);

    // The component uses plain buttons, not role="tab"
    const details = screen.getByRole("button", { name: "รายละเอียดสินค้า" });
    const howTo = screen.getByRole("button", { name: "วิธีใช้งาน" });
    const reviews = screen.getByRole("button", { name: /รีวิว/ });

    // Details tab is active initially
    expect(details).toBeInTheDocument();
    expect(screen.getByText("Product Overview")).toBeInTheDocument();

    // Click how-to tab
    fireEvent.click(howTo);
    expect(
      screen.getByText("ขั้นตอนการติดตั้ง (How to Install)"),
    ).toBeInTheDocument();

    // Click reviews tab
    fireEvent.click(reviews);
    expect(screen.getByText(/จาก 120 รีวิว/)).toBeInTheDocument();

    // Click back to details
    fireEvent.click(details);
    expect(screen.getByText("Product Overview")).toBeInTheDocument();
  });
});
