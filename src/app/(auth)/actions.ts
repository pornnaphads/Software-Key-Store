"use server";

import { Prisma } from "@prisma/client";
import { hash } from "bcryptjs";
import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import { z } from "zod";

import { signIn } from "@/auth";
import {
  findAuthUserByEmail,
  verifyCredentials,
} from "@/data/auth-users";
import { prisma } from "@/lib/prisma";

export interface AuthActionState {
  message: string;
  fields?: Record<string, string[] | undefined>;
}

function safeCallbackUrl(value: FormDataEntryValue | null): string | null {
  if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//")) {
    return null;
  }

  return value;
}

export async function loginAction(
  _state: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const user = await verifyCredentials({ email, password });

  if (!user) {
    return { message: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" };
  }

  try {
    await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { message: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" };
    }

    throw error;
  }

  const callbackUrl = safeCallbackUrl(formData.get("callbackUrl"));
  redirect(user.role === "ADMIN" ? "/admin" : (callbackUrl ?? "/"));
}

export async function googleLoginAction(): Promise<void> {
  await signIn("google", { redirectTo: "/" });
}

const registerSchema = z
  .object({
    firstName: z.string().trim().min(1, "กรุณาระบุชื่อ"),
    lastName: z.string().trim().min(1, "กรุณาระบุนามสกุล"),
    email: z.string().trim().toLowerCase().email("รูปแบบอีเมลไม่ถูกต้อง"),
    password: z
      .string()
      .min(8, "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร")
      .max(128),
    confirmPassword: z.string(),
  })
  .refine((value) => value.password === value.confirmPassword, {
    path: ["confirmPassword"],
    message: "รหัสผ่านไม่ตรงกัน",
  });

export async function registerAction(
  _state: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = registerSchema.safeParse({
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return {
      message: "กรุณาตรวจสอบข้อมูล",
      fields: parsed.error.flatten().fieldErrors,
    };
  }

  const { firstName, lastName, email, password } = parsed.data;
  if (await findAuthUserByEmail(email)) {
    return { message: "ไม่สามารถสมัครด้วยอีเมลนี้ได้" };
  }

  try {
    await prisma.user.create({
      data: {
        name: `${firstName} ${lastName}`.trim(),
        email,
        password: await hash(password, 12),
        role: "CUSTOMER",
      },
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return { message: "ไม่สามารถสมัครด้วยอีเมลนี้ได้" };
    }

    throw error;
  }

  redirect("/login?registered=1");
}
