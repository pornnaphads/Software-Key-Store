import { Suspense } from "react";

import { CatalogExplorer } from "@/components/catalog/CatalogExplorer";
import { CatalogFallback } from "@/components/catalog/CatalogFallback";

export default function OfficeCategoryPage() {
  return (
    <div className="catalog-page">
      <header className="catalog-page__hero catalog-page__hero--office">
        <div className="storefront-container">
          <span className="catalog-page__eyebrow">Product license</span>
          <h1>Microsoft Office</h1>
          <p>
            เลือกชุดโปรแกรมสำนักงานสำหรับงาน เรียน และธุรกิจ
            พร้อมสิทธิ์ใช้งานดิจิทัลและคำแนะนำหลังการขาย
          </p>
          <div className="catalog-page__facts">
            <span>
              <span aria-hidden="true" className="material-symbols-outlined">
                download
              </span>
              ส่งข้อมูลทางอีเมล
            </span>
            <span>
              <span aria-hidden="true" className="material-symbols-outlined">
                devices
              </span>
              รองรับเครื่องตามเงื่อนไขสินค้า
            </span>
          </div>
        </div>
      </header>

      <section className="storefront-container catalog-page__content">
        <Suspense fallback={<CatalogFallback />}>
          <CatalogExplorer badgeFirst="Sale" category="microsoft" />
        </Suspense>
      </section>

      <section className="storefront-container category-trust">
        <div>
          <span aria-hidden="true" className="material-symbols-outlined">
            verified_user
          </span>
          <h2>ทำไมต้องเลือก SoftKeyStore?</h2>
          <p>
            สินค้าทุกชิ้นมีรายละเอียดสิทธิ์ใช้งานชัดเจน
            พร้อมช่องทางช่วยเหลือเมื่อติดตั้งหรือเปิดใช้งาน
          </p>
        </div>
        <div className="category-trust__items">
          <span>ลิขสิทธิ์แท้และตรวจสอบได้</span>
          <span>คู่มือภาษาไทยเข้าใจง่าย</span>
          <span>มีทีมช่วยเหลือหลังการขาย</span>
          <span>ราคาชัดเจนก่อนชำระเงิน</span>
        </div>
      </section>
    </div>
  );
}
