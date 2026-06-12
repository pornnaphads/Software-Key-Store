"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import styles from "./forgot-password.module.css";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState(1); // Step 1: Enter Email, Step 2: Reset Password
  const [email, setEmail] = useState("");
  const [passwords, setPasswords] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError("กรุณากรอกอีเมลของคุณ");
      return;
    }

    // Get registered users from localStorage
    const registeredUsers = JSON.parse(localStorage.getItem("mock_users") || "[]");
    
    // Check if user exists
    const userExists = registeredUsers.some((u: any) => u.email === email);

    if (userExists) {
      setError("");
      setStep(2); // Proceed to Step 2
    } else {
      setError("ไม่พบอีเมลนี้ในระบบสมัครสมาชิก");
    }
  };

  const handlePasswordResetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const { newPassword, confirmPassword } = passwords;

    if (!newPassword || !confirmPassword) {
      setError("กรุณากรอกรหัสผ่านใหม่ให้ครบทุกช่อง");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("รหัสผ่านใหม่และยืนยันรหัสผ่านไม่ตรงกัน");
      return;
    }

    if (newPassword.length < 6) {
      setError("รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร");
      return;
    }

    // Update password in localStorage
    const registeredUsers = JSON.parse(localStorage.getItem("mock_users") || "[]");
    const updatedUsers = registeredUsers.map((u: any) => {
      if (u.email === email) {
        return { ...u, password: newPassword };
      }
      return u;
    });

    localStorage.setItem("mock_users", JSON.stringify(updatedUsers));
    setSuccess("รีเซ็ตรหัสผ่านสำเร็จ! กำลังนำคุณกลับหน้าเข้าสู่ระบบ...");

    setTimeout(() => {
      router.push("/login");
    }, 2000);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswords({
      ...passwords,
      [e.target.name]: e.target.value,
    });
    setError("");
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>
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
          <h2 className={styles.title}>ลืมรหัสผ่าน</h2>
          
          {error && <div className={styles.errorMessage}>{error}</div>}
          {success && <div className={styles.successMessage}>{success}</div>}

          {step === 1 ? (
            /* Step 1: Email Form */
            <form onSubmit={handleEmailSubmit} className={styles.form}>
              <p className={styles.infoText}>
                กรอกอีเมลที่คุณใช้สมัครสมาชิก เพื่อทำการยืนยันบัญชีและตั้งรหัสผ่านใหม่
              </p>
              
              <div className={styles.inputGroup}>
                <div className={styles.inputWrapper}>
                  <span className={styles.inputIcon}>✉️</span>
                  <input
                    type="email"
                    placeholder="อีเมลที่ลงทะเบียนไว้"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setError(""); }}
                  />
                </div>
              </div>

              <div className={styles.actionsRow}>
                <Link href="/login" className={styles.backBtn}>
                  ย้อนกลับ
                </Link>
                <button type="submit" className={styles.submitBtn}>
                  ตรวจสอบอีเมล
                </button>
              </div>
            </form>
          ) : (
            /* Step 2: New Password Form */
            <form onSubmit={handlePasswordResetSubmit} className={styles.form}>
              <p className={styles.infoText}>
                ยืนยันบัญชีสำเร็จสำหรับ: <strong>{email}</strong><br />
                กรุณากรอกรหัสผ่านใหม่ที่คุณต้องการใช้งาน
              </p>

              {/* New Password */}
              <div className={styles.inputGroup}>
                <div className={styles.inputWrapper}>
                  <span className={styles.inputIcon}>🔑</span>
                  <input
                    type="password"
                    name="newPassword"
                    placeholder="รหัสผ่านใหม่"
                    value={passwords.newPassword}
                    onChange={handlePasswordChange}
                  />
                </div>
              </div>

              {/* Confirm New Password */}
              <div className={styles.inputGroup}>
                <div className={styles.inputWrapper}>
                  <span className={styles.inputIcon}>🔒</span>
                  <input
                    type="password"
                    name="confirmPassword"
                    placeholder="ยืนยันรหัสผ่านใหม่"
                    value={passwords.confirmPassword}
                    onChange={handlePasswordChange}
                  />
                </div>
              </div>

              <div className={styles.actionsRow}>
                <button type="button" onClick={() => setStep(1)} className={styles.backBtn}>
                  ย้อนกลับ
                </button>
                <button type="submit" className={styles.submitBtn}>
                  รีเซ็ตรหัสผ่าน
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
