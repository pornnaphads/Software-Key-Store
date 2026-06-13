"use client";

import Image from "next/image";
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
                อีเมล
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
                รหัสผ่าน
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
              className="ui-button ui-button--secondary w-full"
              type="submit"
            >
              <Image
                alt=""
                height={20}
                src="/assets/softkeystore/auth/google.png"
                width={20}
              />
              เข้าสู่ระบบด้วย Google
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
