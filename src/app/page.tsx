"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import styles from "./page.module.css";

export default function Home() {
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    // Read mock_user cookie
    const match = document.cookie.match(new RegExp('(^| )mock_user=([^;]+)'));
    if (match) {
      setUserName(decodeURIComponent(match[2]));
    }
  }, []);

  const handleSignOut = () => {
    // Delete cookie
    document.cookie = "mock_user=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
    setUserName(null);
    window.location.reload();
  };
  const products = [
    {
      id: "win11",
      name: "Windows 11 Pro",
      category: "ระบบปฏิบัติการ / Windows",
      price: "790.00 ฿",
      sales: "12580+ ขายแล้ว",
      gradient: "linear-gradient(135deg, #2b6cb0 0%, #3182ce 100%)", // Blue
    },
    {
      id: "win10",
      name: "Windows 10 Pro",
      category: "ระบบปฏิบัติการ / Windows",
      price: "590.00 ฿",
      sales: "8960+ ขายแล้ว",
      gradient: "linear-gradient(135deg, #1a365d 0%, #2b6cb0 100%)", // Dark Blue
    },
    {
      id: "office2021",
      name: "Microsoft Office 2021",
      category: "สำนักงาน / Microsoft Office",
      price: "1,190.00 ฿",
      sales: "13840+ ขายแล้ว",
      gradient: "linear-gradient(135deg, #dd6b20 0%, #ed8936 100%)", // Orange
    },
    {
      id: "adobe-cc",
      name: "Adobe Creative Cloud",
      category: "ออกแบบ / Adobe",
      price: "1,790.00 ฿",
      sales: "6240+ ขายแล้ว",
      gradient: "linear-gradient(135deg, #e53e3e 0%, #dd6b20 100%)", // Sunset Red-Orange
    },
    {
      id: "photoshop",
      name: "Adobe Photoshop 2024",
      category: "ออกแบบ / Adobe",
      price: "890.00 ฿",
      sales: "5120+ ขายแล้ว",
      gradient: "linear-gradient(135deg, #2c5282 0%, #2b6cb0 100%)", // Dark blue-cyan
    },
    {
      id: "kaspersky",
      name: "Kaspersky Total Security",
      category: "แอนตี้ไวรัส / Security",
      price: "690.00 ฿",
      sales: "9360+ ขายแล้ว",
      gradient: "linear-gradient(135deg, #22543d 0%, #2f855a 100%)", // Forest Green
    },
  ];

  return (
    <div className={styles.container}>
      {/* Hero Banner Section */}
      <section className={styles.heroSection}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>คีย์แท้ ส่งไว ใช้งานได้ทันที</h1>
          <p className={styles.heroSub}>ซอฟต์แวร์ลิขสิทธิ์แท้ 100% มั่นใจ ปลอดภัย คุ้มค่า จัดส่งอัตโนมัติภายในไม่กี่วินาที</p>
          <div className={styles.heroCTA}>
            {userName ? (
              <div className={styles.loggedInStatus}>
                <span className={styles.statusText}>เข้าสู่ระบบ login เรียบร้อยแล้ว</span>
                <span className={styles.userEmail}>ยินดีต้อนรับ: {userName}</span>
                <button onClick={handleSignOut} className={styles.signOutBtn}>
                  ออกจากระบบ
                </button>
              </div>
            ) : (
              <Link href="/login" className={styles.primaryBtn}>
                เข้าสู่ระบบเพื่อสั่งซื้อสินค้า
              </Link>
            )}
          </div>
        </div>
        
        {/* Features Row */}
        <div className={styles.featuresRow}>
          <div className={styles.featureItem}>
            <span className={styles.featureIcon}>⚡</span>
            <span className={styles.featureText}>จัดส่งอัตโนมัติในไม่กี่วินาที</span>
          </div>
          <div className={styles.featureItem}>
            <span className={styles.featureIcon}>🛡️</span>
            <span className={styles.featureText}>คีย์แท้ 100% ปลอดภัย มั่นใจได้</span>
          </div>
          <div className={styles.featureItem}>
            <span className={styles.featureIcon}>💳</span>
            <span className={styles.featureText}>ชำระเงินปลอดภัย 100%</span>
          </div>
          <div className={styles.featureItem}>
            <span className={styles.featureIcon}>📞</span>
            <span className={styles.featureText}>บริการช่วยเหลือช่วยเหลือ 24/7</span>
          </div>
        </div>
      </section>

      {/* Recommended Products Grid Section */}
      <section className={styles.productsSection}>
        <h2 className={styles.sectionTitle}>สินค้าแนะนำ</h2>
        <div className={styles.grid}>
          {products.map((product) => (
            <div key={product.id} className={styles.productCard}>
              {/* Cover with brand gradient */}
              <div className={styles.cardCover} style={{ background: product.gradient }}>
                <div className={styles.coverTitle}>{product.name}</div>
              </div>
              
              {/* Product Info */}
              <div className={styles.cardBody}>
                <span className={styles.category}>{product.category}</span>
                <h3 className={styles.productName}>{product.name}</h3>
                <div className={styles.salesInfo}>
                  <span>🛒 {product.sales}</span>
                </div>
                <div className={styles.priceRow}>
                  <span className={styles.price}>{product.price}</span>
                  <Link href="/login" className={styles.buyBtn}>
                    ซื้อเลย
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
