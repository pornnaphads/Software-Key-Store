import { beforeEach, describe, expect, it, vi } from "vitest";

const { getPasswordResetService } = vi.hoisted(() => ({
  getPasswordResetService: vi.fn(),
}));

vi.mock("@/lib/password-reset-server", () => ({
  getPasswordResetService,
}));

import {
  requestPasswordResetAction,
  resendPasswordResetOtpAction,
  resetPasswordAction,
  verifyPasswordResetOtpAction,
} from "./actions";

function formData(values: Record<string, string>): FormData {
  const data = new FormData();
  for (const [key, value] of Object.entries(values)) {
    data.set(key, value);
  }
  return data;
}

describe("forgot password actions", () => {
  const service = {
    request: vi.fn(),
    verify: vi.fn(),
    resend: vi.fn(),
    reset: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    getPasswordResetService.mockReturnValue(service);
  });

  it("validates email before requesting an OTP", async () => {
    const result = await requestPasswordResetAction(
      { status: "idle", message: "" },
      formData({ email: "not-an-email" }),
    );

    expect(result.status).toBe("error");
    expect(result.fields?.email).toBeDefined();
    expect(service.request).not.toHaveBeenCalled();
  });

  it("returns a generic sent state with the request ID", async () => {
    service.request.mockResolvedValue({
      status: "sent",
      requestId: "request-1",
    });

    const result = await requestPasswordResetAction(
      { status: "idle", message: "" },
      formData({ email: " Owner@example.com " }),
    );

    expect(service.request).toHaveBeenCalledWith("owner@example.com");
    expect(result).toEqual({
      status: "sent",
      message: expect.stringContaining("OTP"),
      requestId: "request-1",
    });
  });

  it("accepts only a six-digit OTP", async () => {
    const result = await verifyPasswordResetOtpAction(
      { status: "idle", message: "" },
      formData({ requestId: "request-1", otp: "12345a" }),
    );

    expect(result.status).toBe("error");
    expect(result.fields?.otp).toBeDefined();
    expect(service.verify).not.toHaveBeenCalled();
  });

  it("advances after a verified OTP", async () => {
    service.verify.mockResolvedValue({ status: "verified" });

    const result = await verifyPasswordResetOtpAction(
      { status: "idle", message: "" },
      formData({ requestId: "request-1", otp: "123456" }),
    );

    expect(result).toEqual({
      status: "verified",
      message: expect.any(String),
      requestId: "request-1",
    });
  });

  it("reports resend cooldown without exposing account details", async () => {
    service.resend.mockResolvedValue({
      status: "cooldown",
      retryAfterSeconds: 25,
    });

    const result = await resendPasswordResetOtpAction(
      { status: "idle", message: "" },
      formData({ requestId: "request-1" }),
    );

    expect(result.status).toBe("cooldown");
    expect(result.retryAfterSeconds).toBe(25);
  });

  it("requires matching passwords of at least eight characters", async () => {
    const result = await resetPasswordAction(
      { status: "idle", message: "" },
      formData({
        requestId: "request-1",
        password: "password-one",
        confirmPassword: "password-two",
      }),
    );

    expect(result.status).toBe("error");
    expect(result.fields?.confirmPassword).toBeDefined();
    expect(service.reset).not.toHaveBeenCalled();
  });

  it("returns reset after replacing the password", async () => {
    service.reset.mockResolvedValue({ status: "reset" });

    const result = await resetPasswordAction(
      { status: "idle", message: "" },
      formData({
        requestId: "request-1",
        password: "new-password",
        confirmPassword: "new-password",
      }),
    );

    expect(service.reset).toHaveBeenCalledWith("request-1", "new-password");
    expect(result.status).toBe("reset");
  });
});
