"use client";

import React from "react";
import Link from "next/link";
import styles from "./Header.module.css";

export default function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.container}>
        {/* Brand Logo */}
        <Link href="/" className={styles.logoContainer}>
          <div className={styles.logoIcon}>
            <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor">
              <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-1 6h2v2h-2V7zm0 4h2v6h-2v-6z" />
            </svg>
          </div>
          <div className={styles.logoText}>
            <span className={styles.brandName}>SoftKeyStore</span>
            <span className={styles.subText}>Digital Software License & Tech Asset</span>
          </div>
        </Link>

        {/* Navigation Menu */}
        <nav className={styles.nav}>
          <div className={styles.navItem}>
            <span>หมวดหมู่สินค้า</span>
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
              <path d="M7 10l5 5 5-5z" />
            </svg>
          </div>
          <Link href="/" className={styles.navLink}>สินค้าทั้งหมด</Link>
          <Link href="/" className={styles.navLink}>วิธีสั่งซื้อ</Link>
          <Link href="/" className={styles.navLink}>การจัดส่ง</Link>
          <Link href="/" className={styles.navLink}>บทความ</Link>
          <Link href="/" className={styles.navLink}>ติดต่อเรา</Link>
        </nav>

        {/* Right Section: Actions */}
        <div className={styles.actions}>
          <button className={styles.actionButton} aria-label="Search">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </button>
          
          <Link href="/login" className={styles.actionButton} aria-label="Account">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </Link>
          
          <div className={styles.cartContainer}>
            <div className={styles.cartIconWrapper}>
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="21" r="1"></circle>
                <circle cx="20" cy="21" r="1"></circle>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
              </svg>
              <span className={styles.cartBadge}>0</span>
            </div>
            <div className={styles.cartText}>
              <span className={styles.cartLabel}>ตะกร้าสินค้า</span>
              <span className={styles.cartValue}>0.00 ฿</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
