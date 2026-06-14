"use client";

import Image from "next/image";
import Link from "next/link";
import { useActionState, useEffect, useState } from "react";

import {
  googleLoginAction,
  loginAction,
  type AuthActionState,
} from "@/app/(auth)/actions";
import styles from "@/app/(auth)/login/login.module.css";

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

  useEffect(() => {
    if (state.success && state.redirectTo) {
      window.location.href = state.redirectTo;
    }
  }, [state.success, state.redirectTo]);

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
            <h1>เข้าสู่ระบบ</h1>
            <p>ยินดีต้อนรับกลับมา กรุณาเข้าสู่ระบบเพื่อใช้งาน</p>
          </header>

          <div className={styles.authTabs}>
            <span>เข้าสู่ระบบ</span>
            <Link href="/register">สมัครสมาชิก</Link>
          </div>

          {registered ? (
            <p className="ui-form-message ui-form-message--success" role="status">
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

          <form action={formAction} className={styles.loginForm}>
            <input name="callbackUrl" type="hidden" value={callbackUrl} />

            <label className={styles.field}>
              <span>อีเมล</span>
              <div className={styles.inputShell}>
                <span aria-hidden="true" className="material-symbols-outlined">
                  mail
                </span>
                <input
                  autoComplete="email"
                  id="login-email"
                  name="email"
                  placeholder="กรอกอีเมล"
                  required
                  type="email"
                />
              </div>
            </label>

            <label className={styles.field}>
              <span>รหัสผ่าน</span>
              <div className={styles.inputShell}>
                <span aria-hidden="true" className="material-symbols-outlined">
                  lock
                </span>
                <input
                  autoComplete="current-password"
                  id="login-password"
                  minLength={8}
                  name="password"
                  placeholder="กรอกรหัสผ่าน"
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
            </label>

            <Link className={styles.forgotLink} href="/forgot-password">
              ลืมรหัสผ่าน?
            </Link>

            <button
              className={styles.submitButton}
              disabled={pending}
              type="submit"
            >
              {pending ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
            </button>
          </form>

          <div className={styles.divider}>
            <span />
            หรือ
            <span />
          </div>

          <div className={styles.googleAction}>
            <form action={googleLoginAction}>
              <input name="callbackUrl" type="hidden" value={callbackUrl} />
              <button
                aria-label="เข้าสู่ระบบด้วย Google"
                className={styles.googleButton}
                type="submit"
              >
                <Image
                  alt=""
                  height={20}
                  src="/assets/softkeystore/auth/google.png"
                  width={20}
                />
                <span>เข้าสู่ระบบด้วย Google</span>
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
