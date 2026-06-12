"use client";

import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/Button";
import { createLineId } from "@/features/cart/cart-math";
import { useCart } from "@/features/cart/CartProvider";
import { getProductAsset } from "@/lib/product-assets";
import type { ProductSummary } from "@/types/commerce";

interface ProductCardProps {
  product: ProductSummary;
  badge?: string;
}

function formatBaht(value: number): string {
  return `฿${value.toLocaleString("en-US", {
    maximumFractionDigits: 0,
  })}`;
}

export function ProductCard({ badge, product }: ProductCardProps) {
  const { addItem } = useCart();
  const available = product.stock > 0;

  const addToCart = () => {
    addItem({
      lineId: createLineId(product.id, []),
      productId: product.id,
      name: product.name,
      category: product.category,
      imageKey: product.image,
      unitPrice: product.price,
      quantity: 1,
      stock: product.stock,
      options: [],
    });
  };

  return (
    <article className="product-card" data-testid="product-card">
      <Link
        aria-label={`ดูรายละเอียด ${product.name}`}
        className="product-card__media"
        href={`/product/${product.id}`}
      >
        <Image
          alt={product.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1100px) 50vw, 25vw"
          src={getProductAsset(product.image)}
        />
        {badge ? <span className="product-card__badge">{badge}</span> : null}
      </Link>

      <div className="product-card__body">
        <div className="product-card__meta">
          <span>{product.category}</span>
          <span className={available ? "is-available" : "is-unavailable"}>
            {available ? `เหลือ ${product.stock} สิทธิ์` : "สินค้าหมด"}
          </span>
        </div>

        <h3>
          <Link href={`/product/${product.id}`}>{product.name}</Link>
        </h3>
        <p className="product-card__description">{product.description}</p>

        <div className="product-card__rating" aria-label={`คะแนน ${product.rating ?? 5} จาก 5`}>
          <span aria-hidden="true" className="material-symbols-outlined fill">
            star
          </span>
          <strong>{(product.rating ?? 5).toFixed(1)}</strong>
          <span>({product.reviewCount ?? 0})</span>
        </div>

        <div className="product-card__purchase">
          <div>
            {product.originalPrice ? (
              <del>{formatBaht(product.originalPrice)}</del>
            ) : null}
            <strong>{formatBaht(product.price)}</strong>
          </div>
          <Button
            aria-label={
              available
                ? `เพิ่ม ${product.name} ลงตะกร้า`
                : `${product.name} สินค้าหมด`
            }
            disabled={!available}
            iconOnly
            onClick={addToCart}
          >
            <span aria-hidden="true" className="material-symbols-outlined">
              {available ? "add_shopping_cart" : "block"}
            </span>
          </Button>
        </div>
      </div>
    </article>
  );
}
