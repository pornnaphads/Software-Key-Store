import {
  OTP_MAX_ATTEMPTS,
  OTP_RESEND_COOLDOWN_MS,
  createOtpExpiry,
  hashOtp,
  isOtpExpired,
  isOtpLocked,
  isResendAllowed,
  verifyOtpHash,
} from "@/lib/password-reset";

export interface PasswordResetUser {
  id: number;
  email: string;
  name: string;
  password: string;
}

export interface PasswordResetRecord {
  id: string;
  email: string;
  otpHash: string;
  userId: number | null;
  expiresAt: Date;
  attempts: number;
  lastSentAt: Date;
  verifiedAt: Date | null;
  consumedAt: Date | null;
}

interface CreateRequestData {
  id: string;
  email: string;
  otpHash: string;
  userId: number;
  expiresAt: Date;
  lastSentAt: Date;
}

interface PasswordResetDependencies {
  now: () => Date;
  createRequestId: () => string;
  createOtp: () => string;
  hashPassword: (password: string) => Promise<string>;
  sendOtp: (message: { to: string; name: string; otp: string }) => Promise<void>;
  findUserByEmail: (email: string) => Promise<PasswordResetUser | null>;
  findLatestRequestByUserId: (
    userId: number,
  ) => Promise<PasswordResetRecord | null>;
  invalidateActiveRequests: (userId: number, consumedAt: Date) => Promise<void>;
  createRequest: (data: CreateRequestData) => Promise<void>;
  findRequest: (id: string) => Promise<PasswordResetRecord | null>;
  updateRequest: (
    id: string,
    data: Partial<Omit<PasswordResetRecord, "id" | "email" | "userId">>,
  ) => Promise<void>;
  completeReset: (data: {
    requestId: string;
    userId: number;
    passwordHash: string;
    consumedAt: Date;
  }) => Promise<void>;
}

export function createPasswordResetService(deps: PasswordResetDependencies) {
  return {
    async request(rawEmail: string) {
      const email = rawEmail.trim().toLowerCase();
      const requestId = deps.createRequestId();
      const user = await deps.findUserByEmail(email);

      if (!user || !user.password) {
        return { status: "sent" as const, requestId };
      }

      const now = deps.now();
      const latestRequest = await deps.findLatestRequestByUserId(user.id);
      if (
        latestRequest &&
        !latestRequest.consumedAt &&
        !latestRequest.verifiedAt &&
        !isOtpExpired(latestRequest.expiresAt, now) &&
        !isResendAllowed(latestRequest.lastSentAt, now)
      ) {
        return { status: "sent" as const, requestId: latestRequest.id };
      }

      const otp = deps.createOtp();
      await deps.invalidateActiveRequests(user.id, now);
      await deps.createRequest({
        id: requestId,
        email,
        otpHash: hashOtp(requestId, otp),
        userId: user.id,
        expiresAt: createOtpExpiry(now),
        lastSentAt: now,
      });

      try {
        await deps.sendOtp({ to: user.email, name: user.name, otp });
      } catch (error) {
        await deps.updateRequest(requestId, { consumedAt: now });
        throw error;
      }

      return { status: "sent" as const, requestId };
    },

    async verify(requestId: string, otp: string) {
      const request = await deps.findRequest(requestId);
      const now = deps.now();
      if (
        !request ||
        !request.userId ||
        request.consumedAt ||
        request.verifiedAt ||
        isOtpExpired(request.expiresAt, now) ||
        isOtpLocked(request.attempts)
      ) {
        return { status: "invalid" as const };
      }

      if (!verifyOtpHash(request.id, otp, request.otpHash)) {
        const attempts = request.attempts + 1;
        await deps.updateRequest(request.id, { attempts });
        return {
          status: attempts >= OTP_MAX_ATTEMPTS ? "locked" as const : "invalid" as const,
        };
      }

      await deps.updateRequest(request.id, { verifiedAt: now });
      return { status: "verified" as const };
    },

    async resend(requestId: string) {
      const request = await deps.findRequest(requestId);
      const now = deps.now();
      if (
        !request ||
        !request.userId ||
        request.consumedAt ||
        request.verifiedAt ||
        isOtpExpired(request.expiresAt, now)
      ) {
        return { status: "invalid" as const };
      }

      if (!isResendAllowed(request.lastSentAt, now)) {
        const remaining = OTP_RESEND_COOLDOWN_MS - (now.getTime() - request.lastSentAt.getTime());
        return {
          status: "cooldown" as const,
          retryAfterSeconds: Math.ceil(remaining / 1000),
        };
      }

      const otp = deps.createOtp();
      await deps.sendOtp({ to: request.email, name: request.email, otp });
      await deps.updateRequest(request.id, {
        otpHash: hashOtp(request.id, otp),
        expiresAt: createOtpExpiry(now),
        attempts: 0,
        lastSentAt: now,
        verifiedAt: null,
      });
      return { status: "sent" as const };
    },

    async reset(requestId: string, password: string) {
      const request = await deps.findRequest(requestId);
      const now = deps.now();
      if (
        !request ||
        !request.userId ||
        !request.verifiedAt ||
        request.consumedAt ||
        isOtpExpired(request.expiresAt, now)
      ) {
        return { status: "invalid" as const };
      }

      const passwordHash = await deps.hashPassword(password);
      await deps.completeReset({
        requestId: request.id,
        userId: request.userId,
        passwordHash,
        consumedAt: now,
      });
      return { status: "reset" as const };
    },
  };
}
