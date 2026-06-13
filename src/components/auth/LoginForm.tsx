"use client";

import Link from "next/link";
import { useActionState, useState } from "react";

import {
  googleLoginAction,
  loginAction,
  type AuthActionState,
} from "@/app/(auth)/actions";

const INITIAL_STATE: AuthActionState = { message: "" };

interface LoginFormProps {
  callbackUrl?: string;
  registered?: boolean;
}

export function LoginForm({
  callbackUrl = "",
  registered = false,
}: LoginFormProps) {
  const [state, formAction, pending] = useActionState(
    loginAction,
    INITIAL_STATE,
  );
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f8fafb] px-margin-mobile py-24">
      <div className="w-full max-w-md rounded-2xl border border-outline-variant/60 bg-white p-8 shadow-[0_18px_50px_rgba(7,26,58,0.08)]">
        <div className="space-y-7">
          <div className="flex items-center justify-start">
            <Link
              className="flex items-center gap-1 text-sm font-semibold text-[#64748B] hover:text-accent-electric transition-colors"
              href="/"
            >
              <span className="material-symbols-outlined text-[18px]">arrow_back</span>
              กลับสู่หน้าหลัก
            </Link>
          </div>

          <div className="space-y-2 text-center">
            <span
              aria-hidden="true"
              className="material-symbols-outlined text-4xl text-accent-electric"
            >
              passkey
            </span>
            <h1 className="font-headline-lg text-3xl font-bold text-deep-navy">
              เข้าสู่ระบบ
            </h1>
            <p className="text-sm text-on-surface-variant">
              จัดการคำสั่งซื้อและคีย์ซอฟต์แวร์ของคุณ
            </p>
          </div>



          <div className="flex rounded-lg bg-surface-container-low p-1">
            <span className="flex-1 rounded-md bg-accent-electric px-4 py-2 text-center font-medium text-white shadow-sm">
              เข้าสู่ระบบ
            </span>
            <Link
              className="flex-1 rounded-md px-4 py-2 text-center font-medium text-on-surface-variant transition-colors hover:text-accent-electric"
              href="/register"
            >
              สมัครสมาชิก
            </Link>
          </div>

          {registered ? (
            <p
              className="ui-form-message ui-form-message--success"
              role="status"
            >
              สมัครสมาชิกสำเร็จ กรุณาเข้าสู่ระบบ
            </p>
          ) : null}

          {state.message ? (
            <p
              aria-live="polite"
              className="ui-form-message ui-form-message--error"
              role="alert"
            >
              {state.message}
            </p>
          ) : null}

          <form action={formAction} className="space-y-5">
            <input name="callbackUrl" type="hidden" value={callbackUrl} />

            <div className="ui-field">
              <label className="ui-field__label" htmlFor="login-email">
                อีเมล <span className="text-[#EF4444]">*</span>
              </label>
              <input
                autoComplete="email"
                className="ui-field__input"
                id="login-email"
                name="email"
                placeholder="example@domain.com"
                required
                type="email"
              />
            </div>

            <div className="ui-field ui-password-field">
              <label className="ui-field__label" htmlFor="login-password">
                รหัสผ่าน <span className="text-[#EF4444]">*</span>
              </label>
              <input
                autoComplete="current-password"
                className="ui-field__input"
                id="login-password"
                minLength={8}
                name="password"
                placeholder="กรอกรหัสผ่าน"
                required
                type={showPassword ? "text" : "password"}
              />
              <button
                aria-label={showPassword ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}
                className="ui-button ui-button--quiet ui-button--icon ui-password-field__toggle"
                onClick={() => setShowPassword((value) => !value)}
                type="button"
              >
                <span aria-hidden="true" className="material-symbols-outlined">
                  {showPassword ? "visibility_off" : "visibility"}
                </span>
              </button>
            </div>

            <div className="flex justify-end">
              <Link
                className="text-sm font-medium text-accent-electric hover:underline"
                href="/forgot-password"
              >
                ลืมรหัสผ่าน?
              </Link>
            </div>

            <button
              className="ui-button ui-button--primary w-full"
              disabled={pending}
              type="submit"
            >
              {pending ? (
                <span aria-hidden="true" className="ui-spinner" />
              ) : null}
              {pending ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
            </button>
          </form>

          <div className="flex items-center gap-4 text-xs text-on-surface-variant">
            <span className="h-px flex-1 bg-outline-variant" />
            หรือ
            <span className="h-px flex-1 bg-outline-variant" />
          </div>

          <form action={googleLoginAction}>
            <button
              className="ui-button ui-button--secondary w-full flex items-center justify-center gap-3"
              type="submit"
            >
              {/* Official Google 'G' SVG logo */}
              <svg
                aria-hidden="true"
                height="20"
                viewBox="0 0 24 24"
                width="20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              เข้าสู่ระบบด้วย Google
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
