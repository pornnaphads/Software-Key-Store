import { Suspense } from "react";

import { CatalogExplorer } from "@/components/catalog/CatalogExplorer";
import { CatalogFallback } from "@/components/catalog/CatalogFallback";

export default function AdobeCategoryPage() {
  return (
    <div className="catalog-page catalog-page--adobe">
      <header className="catalog-page__hero">
        <div className="storefront-container">
          <span className="catalog-page__eyebrow">Creative Tools</span>
          <h1>Adobe Creative Cloud</h1>
          <p>
            เครื่องมือสำหรับนักออกแบบระดับมืออาชีพ เลือกใช้งานแพ็กเกจที่คุณต้องการ
            พร้อมสิทธิ์ใช้งานของแท้ และบริการดูแลตลอดการใช้งาน
          </p>
          <div className="catalog-page__facts">
            <span>
              <span aria-hidden="true" className="material-symbols-outlined">
                cloud_download
              </span>
              ดาวน์โหลดจาก Adobe โดยตรง
            </span>
            <span>
              <span aria-hidden="true" className="material-symbols-outlined">
                devices
              </span>
              รองรับทั้ง Mac และ PC
            </span>
          </div>
        </div>
      </header>

      <section className="storefront-container catalog-page__content">
        <Suspense fallback={<CatalogFallback />}>
          <CatalogExplorer category="all" />
        </Suspense>
      </section>
    </div>
  );
}
