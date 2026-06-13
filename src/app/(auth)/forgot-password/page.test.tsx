import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const actions = vi.hoisted(() => ({
  requestPasswordResetAction: vi.fn(),
  verifyPasswordResetOtpAction: vi.fn(),
  resendPasswordResetOtpAction: vi.fn(),
  resetPasswordAction: vi.fn(),
}));

vi.mock("./actions", () => actions);
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

import ForgotPasswordPage from "./page";

describe("forgot password page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    actions.requestPasswordResetAction.mockResolvedValue({
      status: "sent",
      message: "ส่ง OTP แล้ว",
      requestId: "request-1",
    });
    actions.verifyPasswordResetOtpAction.mockResolvedValue({
      status: "verified",
      message: "ยืนยัน OTP สำเร็จ",
      requestId: "request-1",
    });
    actions.resendPasswordResetOtpAction.mockResolvedValue({
      status: "sent",
      message: "ส่ง OTP ใหม่แล้ว",
      requestId: "request-1",
    });
    actions.resetPasswordAction.mockResolvedValue({
      status: "reset",
      message: "ตั้งรหัสผ่านใหม่สำเร็จ",
    });
  });

  it("renders without reading mock users from localStorage", () => {
    const getItem = vi
      .spyOn(Storage.prototype, "getItem")
      .mockImplementation(() => {
        throw new Error("localStorage must not be used");
      });

    expect(() => render(<ForgotPasswordPage />)).not.toThrow();
    expect(
      screen.getByRole("heading", { name: "ลืมรหัสผ่าน" }),
    ).toBeInTheDocument();
    expect(getItem).not.toHaveBeenCalled();
  });

  it("advances through email, OTP, and new password steps", async () => {
    const user = userEvent.setup();
    render(<ForgotPasswordPage />);

    await user.type(
      screen.getByRole("textbox", { name: "อีเมลที่ลงทะเบียน" }),
      "owner@example.com",
    );
    await user.click(screen.getByRole("button", { name: "ส่งรหัส OTP" }));

    expect(
      await screen.findByRole("textbox", { name: "รหัส OTP 6 หลัก" }),
    ).toBeInTheDocument();

    await user.type(
      screen.getByRole("textbox", { name: "รหัส OTP 6 หลัก" }),
      "123456",
    );
    await user.click(screen.getByRole("button", { name: "ยืนยันรหัส OTP" }));

    expect(
      await screen.findByLabelText("รหัสผ่านใหม่"),
    ).toBeInTheDocument();
    await user.type(screen.getByLabelText("รหัสผ่านใหม่"), "new-password");
    await user.type(
      screen.getByLabelText("ยืนยันรหัสผ่านใหม่"),
      "new-password",
    );
    await user.click(
      screen.getByRole("button", { name: "ตั้งรหัสผ่านใหม่" }),
    );

    await waitFor(() =>
      expect(
        screen.getByText("ตั้งรหัสผ่านใหม่สำเร็จ"),
      ).toBeInTheDocument(),
    );
    expect(
      screen.getByRole("link", { name: "เข้าสู่ระบบ" }),
    ).toHaveAttribute("href", "/login");
  });
});
