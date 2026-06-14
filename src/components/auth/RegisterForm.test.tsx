import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/app/(auth)/actions", () => ({
  googleLoginAction: vi.fn(),
  registerAction: vi.fn(),
}));

import { RegisterForm } from "./RegisterForm";

describe("RegisterForm", () => {
  it("uses the split auth layout with Google sign up", () => {
    render(<RegisterForm />);

    expect(screen.getByText("Software License")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "สมัครสมาชิก" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "เข้าสู่ระบบ" })).toHaveAttribute(
      "href",
      "/login",
    );
    expect(
      screen.getByRole("button", { name: "สมัครด้วย Google" }),
    ).toBeInTheDocument();
  });
});
