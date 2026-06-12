import { Suspense } from "react";
import { Metadata } from "next";

import { CatalogExplorer } from "@/components/catalog/CatalogExplorer";
import { CatalogFallback } from "@/components/catalog/CatalogFallback";

export const metadata: Metadata = {
  title: "สินค้าทั้งหมด | SoftKeyStore",
  description: "เลือกซื้อซอฟต์แวร์ลิขสิทธิ์แท้คุณภาพเยี่ยมจากแบรนด์ชั้นนำ",
};

export default function AllProductsPage() {
  return (
    <div className="catalog-page">
      <div className="catalog-page__hero" style={{ paddingInline: 'var(--page-gutter)', paddingTop: '2rem' }}>
        <div style={{ display: 'flex', gap: '8px', color: 'var(--color-primary)', fontSize: '0.85rem', fontWeight: 600, marginBottom: '1.5rem' }}>
          <span>หน้าแรก</span>
          <span>&gt;</span>
          <span>สินค้าทั้งหมด</span>
        </div>
      </div>
      <div style={{ paddingInline: 'var(--page-gutter)' }}>
        <Suspense fallback={<CatalogFallback />}>
          <CatalogExplorer 
            category="all" 
            title="สินค้าทั้งหมด" 
            subtitle="เลือกซื้อซอฟต์แวร์ลิขสิทธิ์แท้คุณภาพเยี่ยมจากแบรนด์ชั้นนำ พร้อมบริการหลังการขาย 24 ชั่วโมง"
            mode="full" 
          />
        </Suspense>
      </div>
    </div>
  );
}
