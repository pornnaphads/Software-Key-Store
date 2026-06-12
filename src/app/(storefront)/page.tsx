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
      </div>

      <div className="storefront-container">
        <section className="home-section">
          <div className="section-heading section-heading--action">
            <div>
              <h2>สินค้าแนะนำ</h2>
              <p>Selected top-sellers for you</p>
            </div>
            <Link href="#all-products" className="group">
              View All
              <span aria-hidden="true" className="material-symbols-outlined group-hover:translate-x-1 transition-transform">
                arrow_right_alt
              </span>
            </Link>
          </div>
          <FeaturedProducts />
        </section>

        <section className="home-section" id="all-products">
          <Suspense fallback={<CatalogFallback />}>
            <CatalogExplorer 
              category="all" 
              title="ซอฟต์แวร์ทั้งหมด" 
              subtitle="Browse our complete collection of digital licenses"
              mode="compact"
            />
          </Suspense>
        </section>
      </div>
    </>
  );
}
