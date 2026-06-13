import { describe, expect, it, vi } from "vitest";

import {
  createPasswordResetService,
  type PasswordResetRecord,
} from "@/lib/password-reset-service";
import { hashOtp } from "@/lib/password-reset";

function setup(overrides?: {
  user?: { id: number; email: string; name: string; password: string } | null;
  request?: PasswordResetRecord | null;
}) {
  let request = overrides?.request ?? null;
  const user = overrides?.user === undefined
    ? { id: 7, email: "owner@example.com", name: "Owner", password: "$2b$hash" }
    : overrides.user;
  const now = new Date("2026-06-13T09:00:00.000Z");
  const sendOtp = vi.fn().mockResolvedValue(undefined);
  const completeReset = vi.fn().mockResolvedValue(undefined);

  const service = createPasswordResetService({
    now: () => now,
    createRequestId: () => "request-1",
    createOtp: () => "123456",
    hashPassword: async (password) => `hashed:${password}`,
    sendOtp,
    findUserByEmail: async () => user,
    findLatestRequestByUserId: async () => request,
    invalidateActiveRequests: vi.fn().mockResolvedValue(undefined),
    createRequest: async (data) => {
      request = { ...data, attempts: 0, verifiedAt: null, consumedAt: null };
    },
    findRequest: async () => request,
    updateRequest: async (_id, data) => {
      if (request) request = { ...request, ...data };
    },
    completeReset,
  });

  return { service, sendOtp, completeReset, getRequest: () => request };
}

describe("password reset service", () => {
  it("creates and emails an OTP for a real password account", async () => {
    const { service, sendOtp, getRequest } = setup();

    const result = await service.request(" OWNER@example.com ");

    expect(result).toEqual({ status: "sent", requestId: "request-1" });
    expect(sendOtp).toHaveBeenCalledWith({
      to: "owner@example.com",
      name: "Owner",
      otp: "123456",
    });
    expect(getRequest()?.otpHash).toBe(hashOtp("request-1", "123456"));
  });

  it("returns the same public result for an unknown email without sending", async () => {
    const { service, sendOtp } = setup({ user: null });

    await expect(service.request("missing@example.com")).resolves.toEqual({
      status: "sent",
      requestId: "request-1",
    });
    expect(sendOtp).not.toHaveBeenCalled();
  });

  it("reuses a recent request instead of sending another OTP", async () => {
    const recent: PasswordResetRecord = {
      id: "recent-request",
      email: "owner@example.com",
      otpHash: hashOtp("recent-request", "999999"),
      userId: 7,
      expiresAt: new Date("2026-06-13T09:10:00.000Z"),
      attempts: 0,
      lastSentAt: new Date("2026-06-13T08:59:30.000Z"),
      verifiedAt: null,
      consumedAt: null,
    };
    const { service, sendOtp } = setup({ request: recent });

    await expect(service.request("owner@example.com")).resolves.toEqual({
      status: "sent",
      requestId: "recent-request",
    });
    expect(sendOtp).not.toHaveBeenCalled();
  });

  it("verifies the OTP and counts invalid attempts", async () => {
    const base: PasswordResetRecord = {
      id: "request-1",
      email: "owner@example.com",
      otpHash: hashOtp("request-1", "123456"),
      userId: 7,
      expiresAt: new Date("2026-06-13T09:10:00.000Z"),
      attempts: 0,
      lastSentAt: new Date("2026-06-13T09:00:00.000Z"),
      verifiedAt: null,
      consumedAt: null,
    };
    const invalid = setup({ request: base });
    await expect(invalid.service.verify("request-1", "000000")).resolves.toEqual({
      status: "invalid",
    });
    expect(invalid.getRequest()?.attempts).toBe(1);

    const valid = setup({ request: base });
    await expect(valid.service.verify("request-1", "123456")).resolves.toEqual({
      status: "verified",
    });
    expect(valid.getRequest()?.verifiedAt).toEqual(new Date("2026-06-13T09:00:00.000Z"));
  });

  it("rejects expired, locked, and consumed requests", async () => {
    const record: PasswordResetRecord = {
      id: "request-1",
      email: "owner@example.com",
      otpHash: hashOtp("request-1", "123456"),
      userId: 7,
      expiresAt: new Date("2026-06-13T08:59:59.000Z"),
      attempts: 5,
      lastSentAt: new Date("2026-06-13T08:00:00.000Z"),
      verifiedAt: null,
      consumedAt: new Date("2026-06-13T08:30:00.000Z"),
    };

    await expect(setup({ request: record }).service.verify("request-1", "123456"))
      .resolves.toEqual({ status: "invalid" });
  });

  it("enforces resend cooldown and replaces the OTP after cooldown", async () => {
    const record: PasswordResetRecord = {
      id: "request-1",
      email: "owner@example.com",
      otpHash: hashOtp("request-1", "999999"),
      userId: 7,
      expiresAt: new Date("2026-06-13T09:10:00.000Z"),
      attempts: 2,
      lastSentAt: new Date("2026-06-13T08:59:30.000Z"),
      verifiedAt: null,
      consumedAt: null,
    };
    const cooldown = setup({ request: record });
    await expect(cooldown.service.resend("request-1")).resolves.toEqual({
      status: "cooldown",
      retryAfterSeconds: 30,
    });

    record.lastSentAt = new Date("2026-06-13T08:58:00.000Z");
    const allowed = setup({ request: record });
    await expect(allowed.service.resend("request-1")).resolves.toEqual({
      status: "sent",
    });
    expect(allowed.getRequest()?.attempts).toBe(0);
    expect(allowed.getRequest()?.otpHash).toBe(hashOtp("request-1", "123456"));
  });

  it("replaces the password only after verification and consumes the request", async () => {
    const record: PasswordResetRecord = {
      id: "request-1",
      email: "owner@example.com",
      otpHash: hashOtp("request-1", "123456"),
      userId: 7,
      expiresAt: new Date("2026-06-13T09:10:00.000Z"),
      attempts: 0,
      lastSentAt: new Date("2026-06-13T08:58:00.000Z"),
      verifiedAt: new Date("2026-06-13T08:59:00.000Z"),
      consumedAt: null,
    };
    const { service, completeReset } = setup({ request: record });

    await expect(service.reset("request-1", "new-password")).resolves.toEqual({
      status: "reset",
    });
    expect(completeReset).toHaveBeenCalledWith({
      requestId: "request-1",
      userId: 7,
      passwordHash: "hashed:new-password",
      consumedAt: new Date("2026-06-13T09:00:00.000Z"),
    });
  });
});
