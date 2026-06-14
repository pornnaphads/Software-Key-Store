import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("next-auth/react", () => ({
  useSession: () => ({ data: null, status: "unauthenticated" }),
}));

import { ContactChat } from "./ContactChat";

describe("ContactChat", () => {
  it("starts as a floating chat button", () => {
    render(<ContactChat />);

    expect(
      screen.getByRole("button", { name: "เปิดแชทกับแอดมิน" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("dialog", { name: "แชทติดต่อสอบถาม" }),
    ).not.toBeInTheDocument();
  });
});
