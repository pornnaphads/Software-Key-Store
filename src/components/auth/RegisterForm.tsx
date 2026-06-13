"use client";

import Link from "next/link";
import { useActionState, useState } from "react";

import {
  registerAction,
  type AuthActionState,
} from "@/app/(auth)/actions";

const INITIAL_STATE: AuthActionState = { message: "" };

function FieldError({ errors }: { errors?: string[] }) {
  if (!errors?.length) {
    return null;
  }

  return (
    <p className="ui-field__error" role="alert">
      {errors[0]}
    </p>
  );
}

export function RegisterForm() {
  const [state, formAction, pending] = useActionState(
    registerAction,
    INITIAL_STATE,
  );
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f8fafb] px-margin-mobile py-24">
      <div className="w-full max-w-lg rounded-2xl border border-outline-variant/60 bg-white p-8 shadow-[0_18px_50px_rgba(7,26,58,0.08)]">
        <div className="space-y-7">
          <div className="flex items-center justify-start">
            <Link
              className="flex items-center gap-1 text-sm font-semibold text-[#64748B] hover:text-accent-electric transition-colors"
              href="/login"
            >
              <span className="material-symbols-outlined text-[18px]">arrow_back</span>
              กลับสู่หน้าเข้าสู่ระบบ
            </Link>
          </div>

          <div className="space-y-2 text-center">
            <span
              aria-hidden="true"
              className="material-symbols-outlined text-4xl text-accent-electric"
            >
              person_add
            </span>
            <h1 className="font-headline-lg text-3xl font-bold text-deep-navy">
              สมัครสมาชิก
            </h1>
          </div>


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
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="ui-field">
                <label className="ui-field__label" htmlFor="first-name">
                  ชื่อ <span className="text-[#EF4444]">*</span>
                </label>
                <input
                  autoComplete="given-name"
                  className="ui-field__input"
                  id="first-name"
                  name="firstName"
                  placeholder="เช่น สมชาย"
                  required
                  type="text"
                />
                <FieldError errors={state.fields?.firstName} />
              </div>

              <div className="ui-field">
                <label className="ui-field__label" htmlFor="last-name">
                  นามสกุล <span className="text-[#EF4444]">*</span>
                </label>
                <input
                  autoComplete="family-name"
                  className="ui-field__input"
                  id="last-name"
                  name="lastName"
                  placeholder="เช่น ใจดี"
                  required
                  type="text"
                />
                <FieldError errors={state.fields?.lastName} />
              </div>
            </div>

            <div className="ui-field">
              <label className="ui-field__label" htmlFor="register-email">
                อีเมล <span className="text-[#EF4444]">*</span>
              </label>
              <input
                autoComplete="email"
                className="ui-field__input"
                id="register-email"
                name="email"
                placeholder="example@domain.com"
                required
                type="email"
              />
              <FieldError errors={state.fields?.email} />
            </div>

            <div className="ui-field ui-password-field">
              <label className="ui-field__label" htmlFor="register-password">
                รหัสผ่าน <span className="text-[#EF4444]">*</span>
              </label>
              <input
                autoComplete="new-password"
                className="ui-field__input"
                id="register-password"
                minLength={8}
                name="password"
                placeholder="อย่างน้อย 8 ตัวอักษร"
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
              <FieldError errors={state.fields?.password} />
            </div>

            <div className="ui-field ui-password-field">
              <label className="ui-field__label" htmlFor="confirm-password">
                ยืนยันรหัสผ่าน <span className="text-[#EF4444]">*</span>
              </label>
              <input
                autoComplete="new-password"
                className="ui-field__input"
                id="confirm-password"
                minLength={8}
                name="confirmPassword"
                placeholder="กรอกรหัสผ่านอีกครั้ง"
                required
                type={showConfirmation ? "text" : "password"}
              />
              <button
                aria-label={
                  showConfirmation ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"
                }
                className="ui-button ui-button--quiet ui-button--icon ui-password-field__toggle"
                onClick={() => setShowConfirmation((value) => !value)}
                type="button"
              >
                <span aria-hidden="true" className="material-symbols-outlined">
                  {showConfirmation ? "visibility_off" : "visibility"}
                </span>
              </button>
              <FieldError errors={state.fields?.confirmPassword} />
            </div>

            <button
              className="ui-button ui-button--primary w-full"
              disabled={pending}
              type="submit"
            >
              {pending ? (
                <span aria-hidden="true" className="ui-spinner" />
              ) : null}
              {pending ? "กำลังสร้างบัญชี..." : "สมัครสมาชิก"}
            </button>
          </form>

          <p className="text-center text-sm text-on-surface-variant">
            มีบัญชีอยู่แล้ว?{" "}
            <Link
              className="font-semibold text-accent-electric hover:underline"
              href="/login"
            >
              เข้าสู่ระบบ
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
