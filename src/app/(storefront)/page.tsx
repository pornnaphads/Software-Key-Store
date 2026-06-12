import Link from "next/link";
import { Suspense } from "react";

import { CatalogExplorer } from "@/components/catalog/CatalogExplorer";
import { CatalogFallback } from "@/components/catalog/CatalogFallback";
import { CategoryDiscovery } from "@/components/home/CategoryDiscovery";
import { FeaturedProducts } from "@/components/home/FeaturedProducts";
import { HeroCarousel } from "@/components/home/HeroCarousel";

export default function HomePage() {
  return (
    <>
      <HeroCarousel />

      <div className="storefront-container">
        <CategoryDiscovery />

        <section className="home-section">
          <div className="section-heading section-heading--action">
            <div>
              <span>คัดสรรเพื่อคุณ</span>
              <h2>สินค้าแนะนำ</h2>
            </div>
            <Link href="#all-products">
              ดูสินค้าทั้งหมด
              <span aria-hidden="true" className="material-symbols-outlined">
                arrow_downward
              </span>
            </Link>
          </div>
          <FeaturedProducts />
        </section>

        <section className="trust-strip" aria-label="จุดเด่นของร้าน">
          <div>
            <span aria-hidden="true" className="material-symbols-outlined">
              verified
            </span>
            <strong>ลิขสิทธิ์แท้</strong>
            <small>ตรวจสอบและอัปเดตได้</small>
          </div>
          <div>
            <span aria-hidden="true" className="material-symbols-outlined">
              bolt
            </span>
            <strong>ส่งรหัสรวดเร็ว</strong>
            <small>รับข้อมูลทางอีเมล</small>
          </div>
          <div>
            <span aria-hidden="true" className="material-symbols-outlined">
              support_agent
            </span>
            <strong>ช่วยเหลือทุกขั้นตอน</strong>
            <small>พร้อมแนะนำการติดตั้ง</small>
          </div>
          <div>
            <span aria-hidden="true" className="material-symbols-outlined">
              lock
            </span>
            <strong>ชำระเงินปลอดภัย</strong>
            <small>ขั้นตอนชัดเจน โปร่งใส</small>
          </div>
        </section>

        <section className="home-section" id="all-products">
          <div className="section-heading">
            <div>
              <span>สำรวจสินค้า</span>
              <h2>ซอฟต์แวร์ทั้งหมด</h2>
            </div>
            <p>
              ค้นหา กรอง และเรียงสินค้าจาก Windows, Office และ
              Adobe Creative Cloud
            </p>
          </div>
          <Suspense fallback={<CatalogFallback />}>
            <CatalogExplorer category="all" />
          </Suspense>
        </section>
      </div>
    </>
  );
}
