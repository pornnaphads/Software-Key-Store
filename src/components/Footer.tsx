import React from "react";
import styles from "./Footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.topSection}>
          <div className={styles.brandInfo}>
            <h3 className={styles.brandName}>SoftKeyStore</h3>
            <p className={styles.brandDesc}>
              แหล่งรวมซอฟต์แวร์ลิขสิทธิ์แท้ 100% ทั้งระบบปฏิบัติการ Windows, Microsoft Office และโปรแกรมจาก Adobe มั่นใจ ปลอดภัย จัดส่งทันทีตลอด 24 ชั่วโมง
            </p>
          </div>
          <div className={styles.linksGroup}>
            <h4>หมวดหมู่ยอดนิยม</h4>
            <ul>
              <li><a href="#">ระบบปฏิบัติการ Windows</a></li>
              <li><a href="#">Microsoft Office</a></li>
              <li><a href="#">โปรแกรมออกแบบ Adobe</a></li>
              <li><a href="#">โปรแกรมความปลอดภัย Antivirus</a></li>
            </ul>
          </div>
          <div className={styles.linksGroup}>
            <h4>ช่วยเหลือ & บริการ</h4>
            <ul>
              <li><a href="#">วิธีการสั่งซื้อสินค้า</a></li>
              <li><a href="#">นโยบายการรับประกัน</a></li>
              <li><a href="#">นโยบายความเป็นส่วนตัว</a></li>
              <li><a href="#">ติดต่อเรา</a></li>
            </ul>
          </div>
        </div>
        <div className={styles.bottomSection}>
          <p>© {new Date().getFullYear()} SoftKeyStore - Digital Software License & Tech Asset. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
