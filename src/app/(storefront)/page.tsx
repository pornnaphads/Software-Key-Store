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
