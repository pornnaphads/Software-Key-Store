"use client";

import { ProductCard } from "@/components/catalog/ProductCard";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { useCatalogProducts } from "@/features/catalog/useCatalogProducts";

export function FeaturedProducts() {
  const state = useCatalogProducts();

  if (state.status === "loading") {
    return (
      <div aria-label="กำลังโหลดสินค้าแนะนำ" className="featured-products">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="featured-products__skeleton" />
        ))}
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <EmptyState
        action={
          <Button onClick={state.retry} variant="secondary">
            ลองอีกครั้ง
          </Button>
        }
        description={state.message}
        title="โหลดสินค้าแนะนำไม่สำเร็จ"
      />
    );
  }

  const products = state.products.slice(0, 4);
  if (products.length === 0) {
    return (
      <EmptyState
        description="สินค้าแนะนำจะปรากฏเมื่อร้านพร้อมจำหน่าย"
        title="ยังไม่มีสินค้าแนะนำ"
      />
    );
  }

  return (
    <div className="featured-products">
      {products.map((product, index) => (
        <ProductCard
          key={product.id}
          badge={index === 0 ? "Best seller" : undefined}
          product={product}
        />
      ))}
    </div>
  );
}
