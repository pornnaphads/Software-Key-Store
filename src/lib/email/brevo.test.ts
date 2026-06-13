import { afterEach, describe, expect, it, vi } from "vitest";

import {
  PasswordResetEmailError,
  sendPasswordResetOtp,
} from "@/lib/email/brevo";

describe("Brevo password reset email", () => {
  const originalEnv = { ...process.env };

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it("sends a readable Thai OTP email through the Brevo API", async () => {
    process.env.BREVO_API_KEY = "test-api-key";
    process.env.BREVO_SENDER_EMAIL = "sender@example.com";
    process.env.BREVO_SENDER_NAME = "SoftKeyStore";
    const fetchImpl = vi
      .fn()
      .mockResolvedValue(new Response(null, { status: 201 }));

    await sendPasswordResetOtp(
      { to: "customer@example.com", name: "Mint", otp: "123456" },
      fetchImpl,
    );

    expect(fetchImpl).toHaveBeenCalledOnce();
    const [url, init] = fetchImpl.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("https://api.brevo.com/v3/smtp/email");
    expect(init.method).toBe("POST");
    expect(init.headers).toMatchObject({
      "api-key": "test-api-key",
      "content-type": "application/json",
    });
    expect(JSON.parse(String(init.body))).toMatchObject({
      sender: { email: "sender@example.com", name: "SoftKeyStore" },
      to: [{ email: "customer@example.com", name: "Mint" }],
      subject: "รหัส OTP สำหรับรีเซ็ตรหัสผ่าน SoftKeyStore",
    });
    expect(String(init.body)).toContain("123456");
    expect(String(init.body)).toContain("รหัสนี้มีอายุ 10 นาที");
  });

  it("fails safely when configuration or delivery is unavailable", async () => {
    delete process.env.BREVO_API_KEY;
    delete process.env.BREVO_SENDER_EMAIL;

    await expect(
      sendPasswordResetOtp(
        { to: "customer@example.com", name: "Mint", otp: "123456" },
        vi.fn(),
      ),
    ).rejects.toBeInstanceOf(PasswordResetEmailError);

    process.env.BREVO_API_KEY = "test-api-key";
    process.env.BREVO_SENDER_EMAIL = "sender@example.com";
    await expect(
      sendPasswordResetOtp(
        { to: "customer@example.com", name: "Mint", otp: "123456" },
        vi.fn().mockResolvedValue(new Response(null, { status: 400 })),
      ),
    ).rejects.toBeInstanceOf(PasswordResetEmailError);

    await expect(
      sendPasswordResetOtp(
        { to: "customer@example.com", name: "Mint", otp: "123456" },
        vi.fn().mockRejectedValue(new Error("network unavailable")),
      ),
    ).rejects.toBeInstanceOf(PasswordResetEmailError);
  });
});
