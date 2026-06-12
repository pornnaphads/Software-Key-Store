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
  it("renders the centered Thai QR Payment option and is checked by default", () => {
    render(<Harness />);

    const promptpay = screen.getByRole("radio", {
      name: "Thai QR Payment",
    });

    expect(promptpay).toBeChecked();
    expect(screen.queryByRole("radio", { name: "Credit / Debit Card" })).not.toBeInTheDocument();
  });

  it("displays the PromptPay QR code preview", () => {
    render(<Harness />);

    expect(
      screen.getByAltText("ตัวอย่าง QR สำหรับ Thai QR Payment"),
    ).toBeInTheDocument();
    expect(screen.getByAltText("PromptPay")).toBeInTheDocument();
  });
});
