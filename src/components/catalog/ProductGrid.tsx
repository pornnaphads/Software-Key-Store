import { ProductCard } from "@/components/catalog/ProductCard";
import type { ProductSummary } from "@/types/commerce";

interface ProductGridProps {
  products: readonly ProductSummary[];
  badgeFirst?: string;
}

export function ProductGrid({ badgeFirst, products }: ProductGridProps) {
  return (
    <div className="product-grid">
      {products.map((product, index) => (
        <ProductCard
          key={product.id}
          badge={index === 0 ? badgeFirst : undefined}
          product={product}
        />
      ))}
    </div>
  );
}
