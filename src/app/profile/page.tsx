"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "./profile.module.css";

interface Order {
  id: string;
  productName: string;
  price: string;
  date: string;
  status: string;
  key: string;
  reviewed: boolean;
  reviewText?: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const [userName, setUserName] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState("");
  const [orders, setOrders] = useState<Order[]>([
    {
      id: "ORD-1002",
      productName: "Microsoft Office 2021 Professional Plus",
      price: "1,190.00 ฿",
      date: "12 มิ.ย. 2026",
      status: "จัดส่งแล้ว",
      key: "NH3PV-QD9BC-3YMX2-W78GF-P89XH",
      reviewed: false,
    },
    {
      id: "ORD-1001",
      productName: "Windows 11 Pro",
      price: "790.00 ฿",
      date: "10 มิ.ย. 2026",
      status: "จัดส่งแล้ว",
      key: "W269N-WFGWX-YVC9B-4J6C9-T83GX",
      reviewed: true,
      reviewText: "คีย์แท้ใช้งานได้ทันที จัดส่งออโต้เร็วมากครับ",
    },
  ]);

  const [activeOrderForReview, setActiveOrderForReview] = useState<string | null>(null);
  const [reviewInput, setReviewInput] = useState("");

  useEffect(() => {
    // Read mock_user cookie
    const match = document.cookie.match(new RegExp('(^| )mock_user=([^;]+)'));
    if (match) {
      const decodedName = decodeURIComponent(match[2]);
      setUserName(decodedName);

      // Check if user email is stored in localStorage mock_users
      const registeredUsers = JSON.parse(localStorage.getItem("mock_users") || "[]");
      const user = registeredUsers.find((u: any) => u.name === decodedName);
      if (user) {
        setUserEmail(user.email);
      } else {
        // Fallback email
        setUserEmail(`${decodedName.toLowerCase().replace(/\s+/g, "")}@gmail.com`);
      }
    } else {
      // If no cookie, redirect to login page (fallback safety)
      router.push("/login");
    }
  }, [router]);

  const handleSignOut = () => {
    // Delete cookie
    document.cookie = "mock_user=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
    router.push("/");
    setTimeout(() => {
      window.location.reload();
    }, 150);
  };

  const handleOpenReviewModal = (orderId: string) => {
    setActiveOrderForReview(orderId);
    setReviewInput("");
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewInput.trim()) return;

    setOrders((prevOrders) =>
      prevOrders.map((order) => {
        if (order.id === activeOrderForReview) {
          return { ...order, reviewed: true, reviewText: reviewInput };
        }
        return order;
      })
    );

    setActiveOrderForReview(null);
    setReviewInput("");
    alert("ส่งรีวิวสินค้าสำเร็จ! ขอบพระคุณสำหรับความคิดเห็นของคุณครับ");
  };

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    alert("คัดลอกคีย์เรียบร้อยแล้ว: " + key);
  };

  if (!userName) {
    return <div className={styles.loading}>กำลังโหลดข้อมูลโปรไฟล์...</div>;
  }

  return (
    <div className={styles.profileWrapper}>
      <div className={styles.container}>
        {/* Profile Info Header */}
        <div className={styles.profileHeaderCard}>
          <div className={styles.avatarSection}>
            <div className={styles.avatar}>{userName.charAt(0).toUpperCase()}</div>
            <div className={styles.userInfo}>
              <h2 className={styles.userName}>{userName}</h2>
              <p className={styles.userEmail}>{userEmail}</p>
              <span className={styles.userBadge}>ระดับสมาชิก: ลูกค้าชั้นดี</span>
            </div>
          </div>
          <button className={styles.signOutBtn} onClick={handleSignOut}>
            ออกจากระบบ
          </button>
        </div>

        {/* Order History Section */}
        <div className={styles.historyCard}>
          <h3 className={styles.cardTitle}>📦 ประวัติการสั่งซื้อคีย์ซอฟต์แวร์</h3>
          
          <div className={styles.ordersList}>
            {orders.map((order) => (
              <div key={order.id} className={styles.orderItem}>
                <div className={styles.orderHeader}>
                  <div className={styles.orderMeta}>
                    <span className={styles.orderId}>{order.id}</span>
                    <span className={styles.orderDate}>{order.date}</span>
                  </div>
                  <div className={styles.orderStatus}>
                    <span className={styles.statusBadge}>{order.status}</span>
                  </div>
                </div>

                <div className={styles.orderBody}>
                  <div className={styles.productDetails}>
                    <span className={styles.productName}>{order.productName}</span>
                    <span className={styles.productPrice}>{order.price}</span>
                  </div>

                  {/* Software License Key Container */}
                  <div className={styles.keyContainer}>
                    <div className={styles.keyInfo}>
                      <span className={styles.keyLabel}>รหัสคีย์ซอฟต์แวร์ของคุณ:</span>
                      <code className={styles.keyCode}>{order.key}</code>
                    </div>
                    <button className={styles.copyBtn} onClick={() => handleCopyKey(order.key)}>
                      📋 คัดลอกคีย์
                    </button>
                  </div>
                </div>

                {/* Review section (<<extend>> review) */}
                <div className={styles.orderFooter}>
                  {order.reviewed ? (
                    <div className={styles.reviewCompleted}>
                      <span className={styles.reviewLabel}>⭐ รีวิวของคุณ:</span>
                      <p className={styles.reviewText}>"{order.reviewText}"</p>
                    </div>
                  ) : (
                    <button className={styles.reviewBtn} onClick={() => handleOpenReviewModal(order.id)}>
                      ✍️ รีวิวสินค้าชิ้นนี้
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Review Modal Dialog */}
      {activeOrderForReview && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalCard}>
            <h3>✍️ เขียนรีวิวสินค้า</h3>
            <p className={styles.modalSubtitle}>กรุณาแสดงความเห็นเพื่อให้เราปรับปรุงคุณภาพบริการต่อไป</p>
            <form onSubmit={handleSubmitReview}>
              <textarea
                className={styles.reviewTextarea}
                rows={4}
                placeholder="เขียนรีวิวสินค้าชิ้นนี้ เช่น การติดตั้งคีย์, ความเร็วการจัดส่ง..."
                value={reviewInput}
                onChange={(e) => setReviewInput(e.target.value)}
                required
              />
              <div className={styles.modalActions}>
                <button type="button" onClick={() => setActiveOrderForReview(null)} className={styles.cancelBtn}>
                  ยกเลิก
                </button>
                <button type="submit" className={styles.submitReviewBtn}>
                  ส่งรีวิว
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
