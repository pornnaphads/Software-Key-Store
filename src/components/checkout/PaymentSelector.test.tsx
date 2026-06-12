import { useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { PaymentSelector } from "@/components/checkout/PaymentSelector";
import type { PaymentMethod } from "@/features/checkout/checkout";

function Harness() {
  const [value, setValue] = useState<PaymentMethod>("promptpay");
  return <PaymentSelector onChange={setValue} value={value} />;
}

describe("PaymentSelector", () => {
  it("uses radio semantics and exposes card unavailability", async () => {
    const user = userEvent.setup();
    render(<Harness />);

    const promptpay = screen.getByRole("radio", {
      name: "Thai QR Payment",
    });
    const card = screen.getByRole("radio", {
      name: "Credit / Debit Card",
    });

    expect(promptpay).toBeChecked();
    await user.click(card);
    expect(card).toBeChecked();
    expect(screen.getByRole("status")).toHaveTextContent(
      "ยังไม่เปิดให้ชำระด้วยบัตร",
    );
  });

  it("supports arrow-key selection between payment methods", async () => {
    const user = userEvent.setup();
    render(<Harness />);

    const promptpay = screen.getByRole("radio", {
      name: "Thai QR Payment",
    });
    const card = screen.getByRole("radio", {
      name: "Credit / Debit Card",
    });

    promptpay.focus();
    await user.keyboard("{ArrowRight}");
    expect(card).toBeChecked();
    expect(card).toHaveFocus();

    await user.keyboard("{ArrowLeft}");
    expect(promptpay).toBeChecked();
    expect(promptpay).toHaveFocus();
  });
});
