"use client";

import React from "react";
import { signIn } from "next-auth/react";
import styles from "./login.module.css";

export default function LoginPage() {
  const handleGoogleLogin = () => {
    signIn("google");
  };


  return (
    <div className={styles.loginWrapper}>
      <div className={styles.loginCard}>
        {/* Brand Header Inside Card */}
        <div className={styles.cardHeader}>
          <div className={styles.logoIcon}>
            <svg viewBox="0 0 24 24" width="36" height="36" fill="currentColor">
              <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-1 6h2v2h-2V7zm0 4h2v6h-2v-6z" />
            </svg>
          </div>
          <h1 className={styles.brandName}>SoftKeyStore</h1>
          <p className={styles.brandSub}>Digital Software License & Tech Asset</p>
        </div>

        {/* Divider */}
        <div className={styles.divider}></div>

        {/* Main Actions */}
        <div className={styles.cardBody}>
          <h2 className={styles.title}>เข้าสู่ระบบ / สมัครสมาชิก</h2>
          <p className={styles.subtitle}>กรุณาเข้าสู่ระบบด้วยบัญชี Google เพื่อดำเนินการสั่งซื้อสินค้าและจัดการคีย์ของคุณ</p>
          
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
        </div>

        {/* Divider */}
        <div className={styles.divider}></div>

        {/* Trust Indicators / Selling Points */}
        <div className={styles.cardFooter}>
          <div className={styles.benefitItem}>
            <svg className={styles.checkIcon} viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>จัดส่งคีย์ทันทีอัตโนมัติภายใน 5 วินาที</span>
          </div>
          <div className={styles.benefitItem}>
            <svg className={styles.checkIcon} viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>คีย์ลิขสิทธิ์แท้ 100% เปิดใช้งานได้ถาวร</span>
          </div>
          <div className={styles.benefitItem}>
            <svg className={styles.checkIcon} viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>ชำระเงินปลอดภัย รองรับทุกช่องทางยอดนิยม</span>
          </div>
        </div>
      </div>
    </div>
  );
}
