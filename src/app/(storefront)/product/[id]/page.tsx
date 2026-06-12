import Link from "next/link";
import { notFound } from "next/navigation";

import { ProductConfigurator } from "@/components/product/ProductConfigurator";
import { ProductGallery } from "@/components/product/ProductGallery";
import { ProductTabs } from "@/components/product/ProductTabs";
import { getProductById } from "@/data/products";

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

function formatBaht(value: number): string {
  return `฿${value.toLocaleString("en-US", {
    maximumFractionDigits: 0,
  })}`;
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

  const rating = product.rating ?? 5;
  const categoryHref =
    product.category === "Office"
      ? "/category/office"
      : product.category === "OS"
        ? "/category/windows"
        : "/";

  return (
    <main className="product-page">
      <nav aria-label="เส้นทางนำทาง" className="product-breadcrumb">
        <Link href="/">หน้าหลัก</Link>
        <span aria-hidden="true" className="material-symbols-outlined">
          chevron_right
        </span>
        <Link href={categoryHref}>{product.category}</Link>
        <span aria-hidden="true" className="material-symbols-outlined">
          chevron_right
        </span>
        <span aria-current="page">{product.name}</span>
      </nav>

      <div className="product-page__grid">
        <ProductGallery product={product} />

        <section className="product-page__intro">
          <span className="product-page__category">{product.category} software</span>
          <h1>{product.name}</h1>
          <div className="product-page__rating">
            <span aria-hidden="true" className="material-symbols-outlined fill">
              star
            </span>
            <strong>{rating.toFixed(1)}</strong>
            <span>จาก {product.reviewCount ?? 0} รีวิว</span>
          </div>
          <p>{product.description}</p>

          <div className="product-page__price">
            <strong>{formatBaht(product.price)}</strong>
            {product.originalPrice ? (
              <>
                <del>{formatBaht(product.originalPrice)}</del>
                <span>
                  ประหยัด{" "}
                  {Math.round(
                    ((product.originalPrice - product.price) /
                      product.originalPrice) *
                      100,
                  )}
                  %
                </span>
              </>
            ) : null}
          </div>

          <div className="product-page__availability">
            <span
              aria-hidden="true"
              className={`material-symbols-outlined fill ${
                product.stock > 0 ? "is-available" : "is-unavailable"
              }`}
            >
              {product.stock > 0 ? "check_circle" : "cancel"}
            </span>
            <div>
              <strong>
                {product.stock > 0 ? "พร้อมจัดส่งทันที" : "สินค้าหมดชั่วคราว"}
              </strong>
              <span>
                {product.stock > 0
                  ? "Product Key จะถูกส่งหลังชำระเงินสำเร็จ"
                  : "กลับมาตรวจสอบอีกครั้งในภายหลัง"}
              </span>
            </div>
          </div>
        </section>

        <ProductConfigurator product={product} />
      </div>

      <ProductTabs reviews={product.reviews} />
    </main>
  );
}
