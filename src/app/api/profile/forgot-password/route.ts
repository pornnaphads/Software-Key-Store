import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getPasswordResetService } from "@/lib/password-reset-server";
import { PasswordResetEmailError } from "@/lib/email/brevo";

export async function POST() {
  const session = await auth();
  const userId = Number(session?.user?.id);

  if (!Number.isInteger(userId) || userId <= 0) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Email is missing from session" }, { status: 400 });
  }

  try {
    const email = session.user.email;
    const result = await getPasswordResetService().request(email);
    return NextResponse.json({
      success: true,
      message: "ระบบได้ส่งรหัส OTP สำหรับตั้งรหัสผ่านใหม่ไปยังอีเมลของคุณแล้ว กรุณาตรวจสอบกล่องจดหมาย",
      requestId: result.requestId,
    });
  } catch (error) {
    if (error instanceof PasswordResetEmailError) {
      return NextResponse.json(
        { error: "ไม่สามารถส่งอีเมลได้ในขณะนี้ กรุณาลองใหม่อีกครั้ง" },
        { status: 500 }
      );
    }
    console.error("Error triggering forgot password:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
