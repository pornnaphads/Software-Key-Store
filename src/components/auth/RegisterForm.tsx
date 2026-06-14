"use client";

import Image from "next/image";
import Link from "next/link";
import { useActionState, useState } from "react";

import {
  googleLoginAction,
  registerAction,
  type AuthActionState,
} from "@/app/(auth)/actions";
import styles from "@/app/(auth)/login/login.module.css";

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
    <div className={styles.loginPage}>
      <section className={styles.promoPanel}>
        <div className={styles.promoCopy}>
          <h2>
            แหล่งรวม <span>Software License</span> แท้
            <br />
            ซื้อง่าย ส่งคีย์ทันที
          </h2>
          <p>ปลอดภัย มั่นใจ 100% | Support ตลอด 24 ชั่วโมง</p>
        </div>

        <div aria-hidden="true" className={styles.productStack}>
          <div className={`${styles.productCard} ${styles.productCardLeft}`}>
            <Image
              alt=""
              height={160}
              src="/assets/softkeystore/products/office2021-pro.png"
              width={160}
            />
          </div>
          <div className={`${styles.productCard} ${styles.productCardRight}`}>
            <Image
              alt=""
              height={160}
              src="/assets/softkeystore/products/adobe-creative-cloud.png"
              width={160}
            />
          </div>
          <div className={`${styles.productCard} ${styles.productCardMain}`}>
            <Image
              alt=""
              height={190}
              src="/assets/softkeystore/products/windows11-pro.png"
              width={190}
            />
            <strong>Windows 11 Pro</strong>
            <span>Genuine License</span>
          </div>
        </div>
      </section>

      <section className={styles.formPanel}>
        <div className={styles.formShell}>
          <header className={styles.formHeader}>
            <h1>สมัครสมาชิก</h1>
            <p>สร้างบัญชีเพื่อเลือกซื้อซอฟต์แวร์และติดตามคำสั่งซื้อของคุณ</p>
          </header>

          <div className={styles.authTabs}>
            <Link href="/login">เข้าสู่ระบบ</Link>
            <span>สมัครสมาชิก</span>
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

          <form action={formAction} className={styles.registerForm}>
            <div className={styles.nameGrid}>
              <label className={styles.field}>
                <span>ชื่อ</span>
                <div className={styles.inputShell}>
                  <span aria-hidden="true" className="material-symbols-outlined">
                    person
                  </span>
                  <input
                    autoComplete="given-name"
                    id="first-name"
                    name="firstName"
                    placeholder="กรอกชื่อ"
                    required
                    type="text"
                  />
                </div>
                <FieldError errors={state.fields?.firstName} />
              </label>

              <label className={styles.field}>
                <span>นามสกุล</span>
                <div className={styles.inputShell}>
                  <span aria-hidden="true" className="material-symbols-outlined">
                    badge
                  </span>
                  <input
                    autoComplete="family-name"
                    id="last-name"
                    name="lastName"
                    placeholder="กรอกนามสกุล"
                    required
                    type="text"
                  />
                </div>
                <FieldError errors={state.fields?.lastName} />
              </label>
            </div>

            <label className={styles.field}>
              <span>อีเมล</span>
              <div className={styles.inputShell}>
                <span aria-hidden="true" className="material-symbols-outlined">
                  mail
                </span>
                <input
                  autoComplete="email"
                  id="register-email"
                  name="email"
                  placeholder="กรอกอีเมล"
                  required
                  type="email"
                />
              </div>
              <FieldError errors={state.fields?.email} />
            </label>

            <label className={styles.field}>
              <span>รหัสผ่าน</span>
              <div className={styles.inputShell}>
                <span aria-hidden="true" className="material-symbols-outlined">
                  lock
                </span>
                <input
                  autoComplete="new-password"
                  id="register-password"
                  minLength={8}
                  name="password"
                  placeholder="อย่างน้อย 8 ตัวอักษร"
                  required
                  type={showPassword ? "text" : "password"}
                />
                <button
                  aria-label={showPassword ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}
                  onClick={() => setShowPassword((value) => !value)}
                  type="button"
                >
                  <span aria-hidden="true" className="material-symbols-outlined">
                    {showPassword ? "visibility_off" : "visibility"}
                  </span>
                </button>
              </div>
              <FieldError errors={state.fields?.password} />
            </label>

            <label className={styles.field}>
              <span>ยืนยันรหัสผ่าน</span>
              <div className={styles.inputShell}>
                <span aria-hidden="true" className="material-symbols-outlined">
                  lock
                </span>
                <input
                  autoComplete="new-password"
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
                  onClick={() => setShowConfirmation((value) => !value)}
                  type="button"
                >
                  <span aria-hidden="true" className="material-symbols-outlined">
                    {showConfirmation ? "visibility_off" : "visibility"}
                  </span>
                </button>
              </div>
              <FieldError errors={state.fields?.confirmPassword} />
            </label>

            <button
              className={styles.submitButton}
              disabled={pending}
              type="submit"
            >
              {pending ? "กำลังสร้างบัญชี..." : "สมัครสมาชิก"}
            </button>
          </form>

          <div className={styles.divider}>
            <span />
            หรือ
            <span />
          </div>

          <div className={styles.googleAction}>
            <form action={googleLoginAction}>
              <button
                aria-label="สมัครด้วย Google"
                className={styles.googleButton}
                type="submit"
              >
                <Image
                  alt=""
                  height={20}
                  src="/assets/softkeystore/auth/google.png"
                  width={20}
                />
                <span>สมัครด้วย Google</span>
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
