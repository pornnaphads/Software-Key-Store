import Link from "next/link";
import { notFound } from "next/navigation";
import Image from "next/image";

import { ProductConfigurator } from "@/components/product/ProductConfigurator";
import { ProductGallery } from "@/components/product/ProductGallery";
import { ProductTabs } from "@/components/product/ProductTabs";
import { getProductById } from "@/data/products";

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;
  const productId = Number(id);

  if (!Number.isInteger(productId) || productId <= 0) {
    notFound();
  }

  const product = await getProductById(productId);
  if (!product) {
    notFound();
  }

  const productCategoryNorm = product.category.toLowerCase();
  const categoryHref =
    productCategoryNorm === "office" || productCategoryNorm === "microsoft"
      ? "/category/office"
      : productCategoryNorm === "os" || productCategoryNorm === "windows" || productCategoryNorm === "windowns"
        ? "/category/windows"
        : productCategoryNorm === "adobe" || productCategoryNorm === "design"
          ? "/category/adobe"
          : "/";

  return (
    <div className="bg-[#fdfbff] text-[#1b1b1f] font-body-md antialiased min-h-screen">
      <main className="max-w-container-max mx-auto px-margin-desktop pt-32 pb-section-gap">
        {/* Breadcrumb */}
        <nav aria-label="เส้นทางนำทาง" className="flex items-center text-xs text-on-surface-variant mb-6 uppercase font-label-sm font-bold tracking-wider">
          <Link href="/" className="hover:text-accent-electric transition-colors">หน้าหลัก</Link>
          <span aria-hidden="true" className="material-symbols-outlined text-[16px] mx-1">chevron_right</span>
          <Link href={categoryHref} className="hover:text-accent-electric transition-colors">{product.category}</Link>
          <span aria-hidden="true" className="material-symbols-outlined text-[16px] mx-1">chevron_right</span>
          <span aria-current="page" className="text-on-surface">{product.name}</span>
        </nav>

        {/* Main Product Layout */}
        <div className="flex flex-col lg:flex-row gap-8 items-start relative">
          
          {/* Left Column: Gallery */}
          <div className="w-full lg:w-[40%] flex-shrink-0 sticky top-32">
            <ProductGallery product={product} />
          </div>

          {/* Middle Column: Configurator & Details */}
          <div className="flex-grow w-full lg:w-[35%]">
            <ProductConfigurator product={product} />
          </div>

        </div>

        {/* Bottom Section: Tabs */}
        <div className="mt-16">
          <ProductTabs reviews={product.reviews} />
        </div>
      </main>
    </div>
  );
}
