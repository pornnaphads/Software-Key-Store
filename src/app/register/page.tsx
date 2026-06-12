"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import styles from "./register.module.css";

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
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

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();

    const { name, email, password, confirmPassword } = formData;

    if (!name || !email || !password || !confirmPassword) {
      setError("กรุณากรอกข้อมูลให้ครบทุกช่อง");
      return;
    }

    if (password !== confirmPassword) {
      setError("รหัสผ่านและยืนยันรหัสผ่านไม่ตรงกัน");
      return;
    }

    if (password.length < 6) {
      setError("รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร");
      return;
    }

    // Get existing users from localStorage
    const existingUsers = JSON.parse(localStorage.getItem("mock_users") || "[]");
    
    // Check if email already exists
    const emailExists = existingUsers.some((user: any) => user.email === email);
    if (emailExists) {
      setError("อีเมลนี้ถูกใช้งานในระบบแล้ว");
      return;
    }

    // Add new user
    const newUser = { name, email, password };
    existingUsers.push(newUser);
    localStorage.setItem("mock_users", JSON.stringify(existingUsers));

    setSuccess("สมัครสมาชิกสำเร็จ! กำลังนำคุณไปยังหน้าเข้าสู่ระบบ...");
    
    // Redirect to login page after 2 seconds
    setTimeout(() => {
      router.push("/login");
    }, 2000);
  };

  return (
    <div className={styles.registerWrapper}>
      <div className={styles.registerCard}>
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
          <h2 className={styles.title}>สมัครสมาชิก</h2>
          
          {error && <div className={styles.errorMessage}>{error}</div>}
          {success && <div className={styles.successMessage}>{success}</div>}

          <form onSubmit={handleRegister} className={styles.form}>
            {/* Name Input */}
            <div className={styles.inputGroup}>
              <label htmlFor="name">ชื่อผู้ใช้</label>
              <div className={styles.inputWrapper}>
                <span className={styles.inputIcon}>👤</span>
                <input
                  type="text"
                  id="name"
                  name="name"
                  placeholder="กรอกชื่อผู้ใช้"
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Email Input */}
            <div className={styles.inputGroup}>
              <label htmlFor="email">อีเมล</label>
              <div className={styles.inputWrapper}>
                <span className={styles.inputIcon}>✉️</span>
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="กรอกอีเมลของคุณ"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Password Input */}
            <div className={styles.inputGroup}>
              <label htmlFor="password">รหัสผ่าน</label>
              <div className={styles.inputWrapper}>
                <span className={styles.inputIcon}>🔒</span>
                <input
                  type="password"
                  id="password"
                  name="password"
                  placeholder="ตั้งรหัสผ่านของคุณ"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Confirm Password Input */}
            <div className={styles.inputGroup}>
              <label htmlFor="confirmPassword">ยืนยันรหัสผ่าน</label>
              <div className={styles.inputWrapper}>
                <span className={styles.inputIcon}>🔒</span>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  placeholder="ยืนยันรหัสผ่านอีกครั้ง"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Actions Row */}
            <div className={styles.actionsRow}>
              <Link href="/login" className={styles.loginLinkBtn}>
                เข้าสู่ระบบ
              </Link>
              <button type="submit" className={styles.registerBtn}>
                สมัครสมาชิก
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
