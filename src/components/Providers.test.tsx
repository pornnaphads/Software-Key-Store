import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

const { sessionProviderSpy } = vi.hoisted(() => ({
  sessionProviderSpy: vi.fn(),
}));

vi.mock("next-auth/react", () => ({
  SessionProvider: ({ children, session }: { children: React.ReactNode; session?: unknown }) => {
    sessionProviderSpy(session);
    return <div data-testid="session-provider">{children}</div>;
  },
}));

vi.mock("@/features/cart/CartProvider", () => ({
  CartProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="cart-provider">{children}</div>
  ),
}));

import Providers from "./Providers";

describe("Providers", () => {
  it("passes the initial session through to SessionProvider", () => {
    const session = {
      user: {
        id: "7",
        name: "Buyer",
        email: "buyer@example.com",
        role: "CUSTOMER",
      },
      expires: "2026-06-14T00:00:00.000Z",
    };

    render(
      <Providers session={session}>
        <div>content</div>
      </Providers>,
    );

    expect(screen.getByTestId("session-provider")).toBeInTheDocument();
    expect(screen.getByTestId("cart-provider")).toBeInTheDocument();
    expect(sessionProviderSpy).toHaveBeenCalledWith(session);
  });
});
