import {
  createHash,
  randomInt,
  timingSafeEqual,
} from "node:crypto";

export const OTP_LENGTH = 6;
export const OTP_TTL_MS = 10 * 60 * 1000;
export const OTP_RESEND_COOLDOWN_MS = 60 * 1000;
export const OTP_MAX_ATTEMPTS = 5;

type RandomInt = (minimum: number, maximum: number) => number;

export function generateOtp(
  getRandomInt: RandomInt = randomInt,
): string {
  return String(getRandomInt(0, 10 ** OTP_LENGTH)).padStart(OTP_LENGTH, "0");
}

export function hashOtp(requestId: string, otp: string): string {
  return createHash("sha256").update(`${requestId}:${otp}`).digest("hex");
}

export function verifyOtpHash(
  requestId: string,
  otp: string,
  expectedHash: string,
): boolean {
  const actual = Buffer.from(hashOtp(requestId, otp), "hex");
  const expected = Buffer.from(expectedHash, "hex");
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

export function createOtpExpiry(now = new Date()): Date {
  return new Date(now.getTime() + OTP_TTL_MS);
}

export function isOtpExpired(expiresAt: Date, now = new Date()): boolean {
  return expiresAt.getTime() <= now.getTime();
}

export function isResendAllowed(lastSentAt: Date, now = new Date()): boolean {
  return now.getTime() - lastSentAt.getTime() >= OTP_RESEND_COOLDOWN_MS;
}

export function isOtpLocked(attempts: number): boolean {
  return attempts >= OTP_MAX_ATTEMPTS;
}
