"use client";

import Link from "next/link";
import { useActionState, useState } from "react";

import {
  requestPasswordResetAction,
  resendPasswordResetOtpAction,
  resetPasswordAction,
  verifyPasswordResetOtpAction,
  type PasswordResetActionState,
} from "./actions";
import styles from "./forgot-password.module.css";

const initialState: PasswordResetActionState = {
  status: "idle",
  message: "",
};

function Feedback({
  state,
}: {
  state: PasswordResetActionState;
}) {
  if (!state.message) return null;

  const isSuccess =
    state.status === "sent" ||
    state.status === "verified" ||
    state.status === "reset";

  return (
    <div
      className={isSuccess ? styles.successMessage : styles.errorMessage}
      role={isSuccess ? "status" : "alert"}
      aria-live="polite"
    >
      {state.message}
    </div>
  );
}

function FieldError({ messages }: { messages?: string[] }) {
  if (!messages?.length) return null;
  return <p className={styles.fieldError}>{messages[0]}</p>;
}

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [requestState, requestAction, requesting] = useActionState(
    requestPasswordResetAction,
    initialState,
  );
  const [verifyState, verifyAction, verifying] = useActionState(
    verifyPasswordResetOtpAction,
    initialState,
  );
  const [resendState, resendAction, resending] = useActionState(
    resendPasswordResetOtpAction,
    initialState,
  );
  const [resetState, resetAction, resetting] = useActionState(
    resetPasswordAction,
    initialState,
  );

  const requestId = verifyState.requestId ?? requestState.requestId;
  const step =
    resetState.status === "reset"
      ? "done"
      : verifyState.status === "verified"
        ? "password"
        : requestState.status === "sent" && requestId
          ? "otp"
          : "email";

  return (
    <main className={styles.wrapper}>
      <section className={styles.card} aria-labelledby="forgot-password-title">
        <header className={styles.cardHeader}>
          <div className={styles.logoIcon} aria-hidden="true">
            <svg viewBox="0 0 24 24" width="36" height="36" fill="currentColor">
              <path d="M12 1 3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4Zm-1 6h2v2h-2V7Zm0 4h2v6h-2v-6Z" />
            </svg>
          </div>
          <p className={styles.brandName}>SoftKeyStore</p>
          <p className={styles.brandSub}>Digital Software License & Tech Asset</p>
        </header>

        <div className={styles.divider} />

        <div className={styles.cardBody}>
          <h1 id="forgot-password-title" className={styles.title}>
            ลืมรหัสผ่าน
          </h1>

          {step === "email" && (
            <form action={requestAction} className={styles.form}>
              <p className={styles.infoText}>
                กรอกอีเมลที่ใช้สมัครสมาชิก
                ระบบจะส่งรหัส OTP อายุ 10 นาทีไปยังอีเมลนั้น
              </p>
              <div className={styles.inputGroup}>
                <label htmlFor="reset-email">อีเมลที่ลงทะเบียน</label>
                <div className={styles.inputWrapper}>
                  <span className={styles.inputIcon} aria-hidden="true">
                    @
                  </span>
                  <input
                    id="reset-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    required
                  />
                </div>
                <FieldError messages={requestState.fields?.email} />
              </div>
              <Feedback state={requestState} />
              <div className={styles.actionsRow}>
                <Link href="/login" className={styles.backBtn}>
                  กลับหน้าเข้าสู่ระบบ
                </Link>
                <button
                  type="submit"
                  className={styles.submitBtn}
                  disabled={requesting}
                >
                  {requesting ? "กำลังส่ง..." : "ส่งรหัส OTP"}
                </button>
              </div>
            </form>
          )}

          {step === "otp" && requestId && (
            <div className={styles.form}>
              <p className={styles.infoText}>
                หากมีบัญชีสำหรับ <strong>{email}</strong> ระบบได้ส่งรหัสให้แล้ว
                กรุณาตรวจสอบ Inbox และ Spam
              </p>
              <form action={verifyAction} className={styles.form}>
                <input type="hidden" name="requestId" value={requestId} />
                <div className={styles.inputGroup}>
                  <label htmlFor="reset-otp">รหัส OTP 6 หลัก</label>
                  <input
                    id="reset-otp"
                    className={styles.otpInput}
                    name="otp"
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    pattern="[0-9]{6}"
                    maxLength={6}
                    placeholder="000000"
                    required
                  />
                  <FieldError messages={verifyState.fields?.otp} />
                </div>
                <Feedback state={verifyState} />
                <button
                  type="submit"
                  className={styles.submitBtn}
                  disabled={verifying}
                >
                  {verifying ? "กำลังตรวจสอบ..." : "ยืนยันรหัส OTP"}
                </button>
              </form>

              <form action={resendAction} className={styles.resendForm}>
                <input type="hidden" name="requestId" value={requestId} />
                <button
                  type="submit"
                  className={styles.textButton}
                  disabled={resending}
                >
                  {resending ? "กำลังส่ง..." : "ส่งรหัสใหม่"}
                </button>
                <Feedback state={resendState} />
              </form>
            </div>
          )}

          {step === "password" && requestId && (
            <form action={resetAction} className={styles.form}>
              <input type="hidden" name="requestId" value={requestId} />
              <p className={styles.infoText}>
                ยืนยันตัวตนสำเร็จแล้ว ตั้งรหัสผ่านใหม่อย่างน้อย 8 ตัวอักษร
              </p>
              <div className={styles.inputGroup}>
                <label htmlFor="new-password">รหัสผ่านใหม่</label>
                <input
                  id="new-password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  minLength={8}
                  maxLength={128}
                  required
                />
                <FieldError messages={resetState.fields?.password} />
              </div>
              <div className={styles.inputGroup}>
                <label htmlFor="confirm-password">ยืนยันรหัสผ่านใหม่</label>
                <input
                  id="confirm-password"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  minLength={8}
                  maxLength={128}
                  required
                />
                <FieldError messages={resetState.fields?.confirmPassword} />
              </div>
              <Feedback state={resetState} />
              <button
                type="submit"
                className={styles.submitBtn}
                disabled={resetting}
              >
                {resetting ? "กำลังบันทึก..." : "ตั้งรหัสผ่านใหม่"}
              </button>
            </form>
          )}

          {step === "done" && (
            <div className={styles.donePanel}>
              <Feedback state={resetState} />
              <Link href="/login" className={styles.submitBtn}>
                เข้าสู่ระบบ
              </Link>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
