import Link from "next/link";
import { Suspense } from "react";

import { CatalogExplorer } from "@/components/catalog/CatalogExplorer";
import { CatalogFallback } from "@/components/catalog/CatalogFallback";
import { FeaturedProducts } from "@/components/home/FeaturedProducts";
import { HeroCarousel } from "@/components/home/HeroCarousel";

export default function HomePage() {
  return (
    <>
      <HeroCarousel />

      <div className="flex justify-center gap-4 mt-8 mb-4 max-w-container-max mx-auto px-margin-desktop overflow-x-auto pb-2">
        <Link href="/category/windows" className="flex items-center gap-2 px-6 py-2.5 bg-white border border-[#E2E8F0] rounded-full hover:border-[#CBD5E1] transition-colors text-[14px] font-medium text-[#1E293B] shadow-[0_2px_10px_rgba(0,0,0,0.02)] whitespace-nowrap">
          <span className="material-symbols-outlined text-[18px]">grid_view</span>
          Windows
        </Link>
        <Link href="/category/office" className="flex items-center gap-2 px-6 py-2.5 bg-white border border-[#E2E8F0] rounded-full hover:border-[#CBD5E1] transition-colors text-[14px] font-medium text-[#1E293B] shadow-[0_2px_10px_rgba(0,0,0,0.02)] whitespace-nowrap">
          <span className="material-symbols-outlined text-[18px]">description</span>
          Microsoft Office
        </Link>
        <Link href="/category/adobe" className="flex items-center gap-2 px-6 py-2.5 bg-white border border-[#E2E8F0] rounded-full hover:border-[#CBD5E1] transition-colors text-[14px] font-medium text-[#1E293B] shadow-[0_2px_10px_rgba(0,0,0,0.02)] whitespace-nowrap">
          <span className="material-symbols-outlined text-[18px]">brush</span>
          Adobe CC
        </Link>
        <Link href="/discount" className="flex items-center gap-2 px-6 py-2.5 bg-[#0969da] hover:bg-[#085ec3] border border-transparent rounded-full transition-colors text-[14px] font-semibold text-white shadow-[0_2px_10px_rgba(9,105,218,0.2)] whitespace-nowrap">
          <span className="material-symbols-outlined text-[18px] text-white">sell</span>
          โค้ดส่วนลด
        </Link>
      </div>

      <div className="storefront-container">
        <section className="home-section">
          <div className="section-heading">
            <div>
              <h2>สินค้าแนะนำ</h2>
            </div>
          </div>
          <FeaturedProducts />
        </section>

        <section className="home-section" id="all-products">
          <Suspense fallback={<CatalogFallback />}>
            <CatalogExplorer
              category="all"
              title="ซอฟต์แวร์ทั้งหมด"
              mode="compact"
            />
          </Suspense>
        </section>
      </div>
    </>
  );
}
