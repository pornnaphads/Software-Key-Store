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
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const prefillAccount = (selectedEmail: string, selectedPassword: string) => {
    setEmail(selectedEmail);
    setPassword(selectedPassword);
  };

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

          {/* Helper Credentials Box */}
          <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 space-y-2.5 text-xs text-[#475569]">
            <p className="font-bold text-[#1E293B] flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px] text-accent-electric">info</span>
              บัญชีทดสอบระบบ (Demo Accounts)
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div 
                className="p-2.5 bg-white rounded-lg border border-slate-200 cursor-pointer hover:border-accent-electric transition-all select-none hover:shadow-sm" 
                onClick={() => prefillAccount("customer@example.com", "password123")}
              >
                <p className="font-bold text-[#2563EB] mb-1">ผู้ใช้งานทั่วไป (Customer)</p>
                <p>Email: <span className="font-mono text-[10px]">customer@example.com</span></p>
                <p>Pass: <span className="font-mono text-[10px]">password123</span></p>
              </div>
              <div 
                className="p-2.5 bg-white rounded-lg border border-slate-200 cursor-pointer hover:border-accent-electric transition-all select-none hover:shadow-sm" 
                onClick={() => prefillAccount("admin@softkeystore.com", "adminpassword123")}
              >
                <p className="font-bold text-[#EF4444] mb-1">ผู้ดูแลระบบ (Admin)</p>
                <p>Email: <span className="font-mono text-[10px]">admin@softkeystore.com</span></p>
                <p>Pass: <span className="font-mono text-[10px]">adminpassword123</span></p>
              </div>
            </div>
            <p className="text-[10px] text-slate-400 text-center">คลิกที่กล่องบัญชีทดสอบด้านบนเพื่อป้อนข้อมูลอัตโนมัติ</p>
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
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
