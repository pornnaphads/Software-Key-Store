"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import Link from "next/link";
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
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function ProductCard({ badge, product }: ProductCardProps) {
  const { addItem } = useCart();
  const available = product.stock > 0;
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  const addToCart = (e: React.MouseEvent) => {
    e.preventDefault();
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
    setShowSuccessPopup(true);
    setTimeout(() => {
      setShowSuccessPopup(false);
    }, 1800);
  };

  const rating = product.rating ?? 0;
  const reviewCount = product.reviewCount ?? 0;
  const soldCount = product.soldCount ?? 0;

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
        <h3>
          <Link href={`/product/${product.id}`}>{product.name}</Link>
        </h3>

        <div className="product-card__stats">
          <div className="product-card__stars">
             {[1, 2, 3, 4, 5].map((i) => {
               if (i <= Math.floor(rating)) {
                 return (
                   <span key={i} aria-hidden="true" className="material-symbols-outlined fill">
                     star
                   </span>
                 );
               } else if (i === Math.ceil(rating) && rating % 1 !== 0) {
                 return (
                   <span key={i} aria-hidden="true" className="material-symbols-outlined fill">
                     star_half
                   </span>
                 );
               } else {
                 return (
                   <span key={i} aria-hidden="true" className="material-symbols-outlined">
                     star
                   </span>
                 );
               }
             })}
             <span className="product-card__review-count">
                ({reviewCount})
             </span>
             <span className={`product-card__stock ${product.stock === 0 ? "product-card__stock--out" : ""}`}>
               {product.stock > 0 ? `• เหลือ ${product.stock} ชิ้น` : "• สินค้าหมด"}
             </span>
          </div>
          <p className="product-card__sold-count">
            ขายแล้ว {soldCount} ชิ้น
          </p>
        </div>

        <p className="product-card__description">{product.description}</p>

        <div className="product-card__purchase">
          <strong>{formatBaht(product.price)}</strong>
          <button
            className="product-card__add-to-cart"
            aria-label={available ? `เพิ่ม ${product.name} ลงตะกร้า` : `${product.name} สินค้าหมด`}
            disabled={!available}
            onClick={addToCart}
          >
            <span aria-hidden="true" className="material-symbols-outlined">
              {available ? "shopping_cart" : "block"}
            </span>
          </button>
        </div>
      </div>

      {showSuccessPopup && typeof document !== "undefined" && createPortal(
        <div className="cart-success-popup">
          <div className="cart-success-popup__content">
            <span aria-hidden="true" className="material-symbols-outlined success-icon">
              check_circle
            </span>
            <h3>เพิ่มลงตะกร้าสำเร็จ!</h3>
            <p className="cart-success-popup__product-name">{product.name}</p>
          </div>
        </div>,
        document.body
      )}
    </article>
  );
}

