import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/app/(auth)/actions", () => ({
  googleLoginAction: vi.fn(),
  loginAction: vi.fn(),
}));

import { LoginForm } from "./LoginForm";

describe("LoginForm", () => {
  it("renders the split login and register layout without a home link", () => {
    render(<LoginForm />);

    expect(screen.getByText("Software License")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "เข้าสู่ระบบ" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "สมัครสมาชิก" })).toHaveAttribute(
      "href",
      "/register",
    );
    expect(
      screen.getByRole("button", { name: "เข้าสู่ระบบด้วย Google" }),
    ).toBeInTheDocument();
    expect(screen.getByText("เข้าสู่ระบบด้วย Google")).toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: /กลับสู่หน้าหลัก/ }),
    ).not.toBeInTheDocument();
  });
});
