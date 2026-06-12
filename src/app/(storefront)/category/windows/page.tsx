import { Suspense } from "react";

import { CatalogExplorer } from "@/components/catalog/CatalogExplorer";
import { CatalogFallback } from "@/components/catalog/CatalogFallback";

export default function WindowsCategoryPage() {
  return (
    <div className="catalog-page catalog-page--windows">
      <header className="catalog-page__hero">
        <div className="storefront-container">
          <span className="catalog-page__eyebrow">Operating systems</span>
          <h1>Windows Operating Systems</h1>
          <p>
            ระบบปฏิบัติการสำหรับพีซีส่วนตัวและงานธุรกิจ
            เลือกรุ่นที่เหมาะกับอุปกรณ์ของคุณพร้อมสิทธิ์ใช้งานดิจิทัล
          </p>
        </div>
      </header>

      <section className="storefront-container catalog-page__content">
        <Suspense fallback={<CatalogFallback />}>
          <CatalogExplorer badgeFirst="Best seller" category="windows" />
        </Suspense>
      </section>
    </div>
  );
}
