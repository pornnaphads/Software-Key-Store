import { describe, expect, it } from "vitest";

import {
  OTP_MAX_ATTEMPTS,
  createOtpExpiry,
  generateOtp,
  hashOtp,
  isOtpExpired,
  isOtpLocked,
  isResendAllowed,
  verifyOtpHash,
} from "@/lib/password-reset";

describe("password reset OTP primitives", () => {
  it("generates a zero-padded six-digit OTP", () => {
    expect(generateOtp(() => 42)).toBe("000042");
  });

  it("hashes and verifies an OTP without storing plaintext", () => {
    const hash = hashOtp("request-1", "123456");

    expect(hash).toHaveLength(64);
    expect(hash).not.toContain("123456");
    expect(verifyOtpHash("request-1", "123456", hash)).toBe(true);
    expect(verifyOtpHash("request-1", "654321", hash)).toBe(false);
  });

  it("expires OTP requests after ten minutes", () => {
    const issuedAt = new Date("2026-06-13T09:00:00.000Z");
    const expiresAt = createOtpExpiry(issuedAt);

    expect(expiresAt.toISOString()).toBe("2026-06-13T09:10:00.000Z");
    expect(isOtpExpired(expiresAt, new Date("2026-06-13T09:09:59.999Z"))).toBe(false);
    expect(isOtpExpired(expiresAt, new Date("2026-06-13T09:10:00.000Z"))).toBe(true);
  });

  it("enforces resend cooldown and attempt locking", () => {
    const sentAt = new Date("2026-06-13T09:00:00.000Z");

    expect(isResendAllowed(sentAt, new Date("2026-06-13T09:00:59.999Z"))).toBe(false);
    expect(isResendAllowed(sentAt, new Date("2026-06-13T09:01:00.000Z"))).toBe(true);
    expect(isOtpLocked(OTP_MAX_ATTEMPTS - 1)).toBe(false);
    expect(isOtpLocked(OTP_MAX_ATTEMPTS)).toBe(true);
  });
});
