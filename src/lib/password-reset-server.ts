import "server-only";

import { randomUUID } from "node:crypto";

import { hash } from "bcryptjs";

import { sendPasswordResetOtp } from "@/lib/email/brevo";
import { generateOtp } from "@/lib/password-reset";
import {
  createPasswordResetService,
  type PasswordResetRecord,
} from "@/lib/password-reset-service";
import { prisma } from "@/lib/prisma";

function toResetRecord(record: PasswordResetRecord): PasswordResetRecord {
  return record;
}

export function getPasswordResetService() {
  return createPasswordResetService({
    now: () => new Date(),
    createRequestId: randomUUID,
    createOtp: generateOtp,
    hashPassword: (password) => hash(password, 12),
    sendOtp: sendPasswordResetOtp,
    findUserByEmail: (email) =>
      prisma.user.findUnique({
        where: { email },
        select: {
          id: true,
          email: true,
          name: true,
          password: true,
        },
      }),
    findLatestRequestByUserId: async (userId) => {
      const record = await prisma.passwordResetOtp.findFirst({
        where: { userId },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          email: true,
          otpHash: true,
          userId: true,
          expiresAt: true,
          attempts: true,
          lastSentAt: true,
          verifiedAt: true,
          consumedAt: true,
        },
      });
      return record ? toResetRecord(record) : null;
    },
    invalidateActiveRequests: async (userId, consumedAt) => {
      await prisma.passwordResetOtp.updateMany({
        where: { userId, consumedAt: null },
        data: { consumedAt },
      });
    },
    createRequest: async (data) => {
      await prisma.passwordResetOtp.create({ data });
    },
    findRequest: async (id) => {
      const record = await prisma.passwordResetOtp.findUnique({
        where: { id },
        select: {
          id: true,
          email: true,
          otpHash: true,
          userId: true,
          expiresAt: true,
          attempts: true,
          lastSentAt: true,
          verifiedAt: true,
          consumedAt: true,
        },
      });
      return record ? toResetRecord(record) : null;
    },
    updateRequest: async (id, data) => {
      await prisma.passwordResetOtp.update({
        where: { id },
        data,
      });
    },
    completeReset: async ({
      requestId,
      userId,
      passwordHash,
      consumedAt,
    }) => {
      await prisma.$transaction(async (transaction) => {
        const consumed = await transaction.passwordResetOtp.updateMany({
          where: {
            id: requestId,
            userId,
            consumedAt: null,
            verifiedAt: { not: null },
            expiresAt: { gt: consumedAt },
          },
          data: { consumedAt },
        });

        if (consumed.count !== 1) {
          throw new Error("Password reset request is no longer valid");
        }

        await transaction.user.update({
          where: { id: userId },
          data: { password: passwordHash },
        });
      });
    },
  });
}
