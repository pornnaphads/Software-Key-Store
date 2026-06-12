import { describe, expect, it } from "vitest";

import {
  PRIORITY_SUPPORT_PRICE,
  prepareCheckout,
  simulateCheckout,
  type CheckoutAttemptGuard,
} from "@/features/checkout/checkout";
import type { CartLine } from "@/features/cart/cart-types";

const line: CartLine = {
  lineId: "3:none",
  productId: 3,
  name: "Microsoft Office 2021",
  category: "Office",
  imageKey: "office2021_pro",
  unitPrice: 1190,
  quantity: 1,
  stock: 3,
  options: [],
};

const validInput = {
  contact: {
    firstName: "Mint",
    lastName: "S.",
    email: "mint@example.com",
  },
  lines: [line],
  paymentMethod: "promptpay" as const,
  prioritySupport: true,
  cartTotal: 1190,
};

describe("prepareCheckout", () => {
  it("prepares PromptPay totals with fixed priority support", () => {
    const result = prepareCheckout(validInput);

    expect(PRIORITY_SUPPORT_PRICE).toBe(150);
    expect(result).toMatchObject({
      valid: true,
      paymentMethod: "promptpay",
      supportPrice: 150,
      total: 1340,
    });
  });

  it("rejects an empty cart", () => {
    expect(
      prepareCheckout({
        ...validInput,
        lines: [],
        cartTotal: 0,
      }),
    ).toMatchObject({
      valid: false,
      status: "empty",
    });
  });

  it("accepts contact details and normalizes them with fallback values", () => {
    expect(
      prepareCheckout({
        ...validInput,
        contact: { firstName: " ", lastName: "", email: "bad" },
      }),
    ).toMatchObject({
      valid: true,
      contact: {
        firstName: "Guest",
        lastName: "User",
        email: "bad",
      },
    });
  });
});

describe("simulateCheckout", () => {
  it("returns an unavailable recovery result for card payment", async () => {
    const prepared = prepareCheckout({
      ...validInput,
      paymentMethod: "card",
    });

    await expect(simulateCheckout(prepared)).resolves.toMatchObject({
      status: "unavailable",
      recoveryMethod: "promptpay",
    });
  });

  it("locks duplicate submissions and releases the guard after success", async () => {
    let finish!: (value: "success") => void;
    const execution = new Promise<"success">((resolve) => {
      finish = resolve;
    });
    const guard: CheckoutAttemptGuard = { inFlight: false };
    const prepared = prepareCheckout(validInput);

    const first = simulateCheckout(prepared, {
      guard,
      execute: () => execution,
    });
    await expect(
      simulateCheckout(prepared, {
        guard,
        execute: () => execution,
      }),
    ).resolves.toMatchObject({ status: "busy" });

    finish("success");
    await expect(first).resolves.toMatchObject({ status: "success" });
    expect(guard.inFlight).toBe(false);
  });

  it("returns recoverable results for payment and network failures", async () => {
    const prepared = prepareCheckout(validInput);

    await expect(
      simulateCheckout(prepared, {
        execute: async () => "failure",
      }),
    ).resolves.toMatchObject({
      status: "failed",
      recoverable: true,
    });

    await expect(
      simulateCheckout(prepared, {
        execute: async () => {
          throw new Error("network");
        },
      }),
    ).resolves.toMatchObject({
      status: "failed",
      recoverable: true,
    });
  });
});
