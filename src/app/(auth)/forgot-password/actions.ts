"use server";

import { z } from "zod";

import { PasswordResetEmailError } from "@/lib/email/brevo";
import { getPasswordResetService } from "@/lib/password-reset-server";

export interface PasswordResetActionState {
  status:
    | "idle"
    | "sent"
    | "verified"
    | "reset"
    | "cooldown"
    | "error";
  message: string;
  requestId?: string;
  retryAfterSeconds?: number;
  fields?: Record<string, string[] | undefined>;
}

const emailSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("กรุณากรอกอีเมลให้ถูกต้อง"),
});

const otpSchema = z.object({
  requestId: z.string().min(1),
  otp: z.string().regex(/^\d{6}$/, "กรุณากรอกรหัส OTP 6 หลัก"),
});

const requestIdSchema = z.object({
  requestId: z.string().min(1),
});

const passwordSchema = z
  .object({
    requestId: z.string().min(1),
    password: z
      .string()
      .min(8, "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร")
      .max(128, "รหัสผ่านต้องไม่เกิน 128 ตัวอักษร"),
    confirmPassword: z.string(),
  })
  .refine((value) => value.password === value.confirmPassword, {
    path: ["confirmPassword"],
    message: "รหัสผ่านทั้งสองช่องไม่ตรงกัน",
  });

function validationError(
  fields: Record<string, string[] | undefined>,
): PasswordResetActionState {
  return {
    status: "error",
    message: "กรุณาตรวจสอบข้อมูลที่กรอก",
    fields,
  };
}

export async function requestPasswordResetAction(
  _state: PasswordResetActionState,
  formData: FormData,
): Promise<PasswordResetActionState> {
  const parsed = emailSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) {
    return validationError(parsed.error.flatten().fieldErrors);
  }

  try {
    const result = await getPasswordResetService().request(parsed.data.email);
    return {
      status: "sent",
      message:
        "หากอีเมลนี้มีบัญชีอยู่ในระบบ เราได้ส่งรหัส OTP ไปให้แล้ว กรุณาตรวจสอบกล่องจดหมาย",
      requestId: result.requestId,
    };
  } catch (error) {
    if (error instanceof PasswordResetEmailError) {
      return {
        status: "error",
        message: "ไม่สามารถส่งอีเมลได้ในขณะนี้ กรุณาลองใหม่อีกครั้ง",
      };
    }
    throw error;
  }
}

export async function verifyPasswordResetOtpAction(
  _state: PasswordResetActionState,
  formData: FormData,
): Promise<PasswordResetActionState> {
  const parsed = otpSchema.safeParse({
    requestId: formData.get("requestId"),
    otp: formData.get("otp"),
  });
  if (!parsed.success) {
    return validationError(parsed.error.flatten().fieldErrors);
  }

  const result = await getPasswordResetService().verify(
    parsed.data.requestId,
    parsed.data.otp,
  );
  if (result.status !== "verified") {
    return {
      status: "error",
      message:
        result.status === "locked"
          ? "กรอกรหัสผิดเกินจำนวนที่กำหนด กรุณาขอรหัสใหม่"
          : "รหัส OTP ไม่ถูกต้องหรือหมดอายุแล้ว",
      requestId: parsed.data.requestId,
    };
  }

  return {
    status: "verified",
    message: "ยืนยันรหัส OTP สำเร็จ",
    requestId: parsed.data.requestId,
  };
}

export async function resendPasswordResetOtpAction(
  _state: PasswordResetActionState,
  formData: FormData,
): Promise<PasswordResetActionState> {
  const parsed = requestIdSchema.safeParse({
    requestId: formData.get("requestId"),
  });
  if (!parsed.success) {
    return { status: "error", message: "คำขอรีเซ็ตรหัสผ่านไม่ถูกต้อง" };
  }

  try {
    const result = await getPasswordResetService().resend(parsed.data.requestId);
    if (result.status === "cooldown") {
      return {
        status: "cooldown",
        message: `กรุณารอ ${result.retryAfterSeconds} วินาทีก่อนขอรหัสใหม่`,
        requestId: parsed.data.requestId,
        retryAfterSeconds: result.retryAfterSeconds,
      };
    }
    if (result.status !== "sent") {
      return {
        status: "error",
        message: "คำขอหมดอายุแล้ว กรุณาเริ่มใหม่อีกครั้ง",
      };
    }
    return {
      status: "sent",
      message: "ส่งรหัส OTP ใหม่แล้ว กรุณาตรวจสอบอีเมล",
      requestId: parsed.data.requestId,
    };
  } catch (error) {
    if (error instanceof PasswordResetEmailError) {
      return {
        status: "error",
        message: "ไม่สามารถส่งอีเมลได้ในขณะนี้ กรุณาลองใหม่อีกครั้ง",
        requestId: parsed.data.requestId,
      };
    }
    throw error;
  }
}

export async function resetPasswordAction(
  _state: PasswordResetActionState,
  formData: FormData,
): Promise<PasswordResetActionState> {
  const parsed = passwordSchema.safeParse({
    requestId: formData.get("requestId"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (!parsed.success) {
    return validationError(parsed.error.flatten().fieldErrors);
  }

  const result = await getPasswordResetService().reset(
    parsed.data.requestId,
    parsed.data.password,
  );
  if (result.status !== "reset") {
    return {
      status: "error",
      message: "คำขอหมดอายุหรือถูกใช้งานแล้ว กรุณาเริ่มใหม่อีกครั้ง",
    };
  }

  return {
    status: "reset",
    message: "ตั้งรหัสผ่านใหม่สำเร็จ คุณสามารถเข้าสู่ระบบได้แล้ว",
  };
}
