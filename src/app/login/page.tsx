"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import styles from "./login.module.css";

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError("");
  };

  const handleGoogleLogin = () => {
    // Set a mock user cookie
    document.cookie = "mock_user=Woraphob; path=/; max-age=604800"; // 7 days
    
    setSuccess("เข้าสู่ระบบด้วย Google สำเร็จ!");
    router.push("/");
    setTimeout(() => {
      window.location.reload();
    }, 150);
  };

  const handleCredentialsLogin = (e: React.FormEvent) => {
    e.preventDefault();

    const { email, password } = formData;

    if (!email || !password) {
      setError("กรุณากรอกอีเมลและรหัสผ่าน");
      return;
    }

    // Get registered users from localStorage
    const registeredUsers = JSON.parse(localStorage.getItem("mock_users") || "[]");
    
    // Check credentials
    const user = registeredUsers.find(
      (u: any) => u.email === email && u.password === password
    );

    if (user) {
      // Set the mock user cookie using their registered name
      document.cookie = `mock_user=${encodeURIComponent(user.name)}; path=/; max-age=604800`; // 7 days
      
      setSuccess("เข้าสู่ระบบสำเร็จ! กำลังไปหน้าแรก...");
      router.push("/");
      setTimeout(() => {
        window.location.reload();
      }, 150);
    } else {
      setError("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
    }
  };

  return (
    <div className={styles.loginWrapper}>
      <div className={styles.loginCard}>
        {/* Brand Header */}
        <div className={styles.cardHeader}>
          <div className={styles.logoIcon}>
            <svg viewBox="0 0 24 24" width="36" height="36" fill="currentColor">
              <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-1 6h2v2h-2V7zm0 4h2v6h-2v-6z" />
            </svg>
          </div>
          <h1 className={styles.brandName}>SoftKeyStore</h1>
          <p className={styles.brandSub}>Digital Software License & Tech Asset</p>
        </div>

        <div className={styles.divider}></div>

        <div className={styles.cardBody}>
          <h2 className={styles.title}>เข้าสู่ระบบ</h2>
          
          {error && <div className={styles.errorMessage}>{error}</div>}
          {success && <div className={styles.successMessage}>{success}</div>}

          {/* Google Login Button */}
          <button className={styles.googleButton} onClick={handleGoogleLogin} aria-label="Sign in with Google">
            <div className={styles.googleIconWrapper}>
              <svg viewBox="0 0 48 48" width="24" height="24">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                <path fill="#4285F4" d="M46.5 24c0-1.55-.15-3.24-.47-4.77H24v9.03h12.75c-.53 2.87-2.14 5.31-4.57 6.94l7.1 5.5C43.43 36.63 46.5 30.93 46.5 24z"/>
                <path fill="#FBBC05" d="M10.54 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.98-6.19z"/>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.1-5.5c-1.97 1.32-4.5 2.11-8.79 2.11-6.26 0-11.57-4.22-13.46-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
              </svg>
            </div>
            <span className={styles.googleButtonText}>เข้าสู่ระบบด้วย Google</span>
          </button>

          {/* OR Divider */}
          <div className={styles.orDivider}>
            <span>หรือ ผ่านระบบสมาชิก</span>
          </div>

          {/* Credentials Form */}
          <form onSubmit={handleCredentialsLogin} className={styles.form}>
            {/* Email Field */}
            <div className={styles.inputGroup}>
              <div className={styles.inputWrapper}>
                <span className={styles.inputIcon}>✉️</span>
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="อีเมล"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Password Field */}
            <div className={styles.inputGroup}>
              <div className={styles.inputWrapper}>
                <span className={styles.inputIcon}>🔒</span>
                <input
                  type="password"
                  id="password"
                  name="password"
                  placeholder="รหัสผ่าน"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Remember & Forgot Row */}
            <div className={styles.optionsRow}>
              <label className={styles.checkboxLabel}>
                <input type="checkbox" defaultChecked />
                <span>จดจำไว้ในระบบ</span>
              </label>
              <Link href="/forgot-password" className={styles.forgotLink}>
                ลืมรหัสผ่าน?
              </Link>
            </div>

            {/* Actions Row */}
            <div className={styles.actionsRow}>
              <Link href="/register" className={styles.registerLinkBtn}>
                สมัครสมาชิก
              </Link>
              <button type="submit" className={styles.loginBtn}>
                เข้าสู่ระบบ
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
