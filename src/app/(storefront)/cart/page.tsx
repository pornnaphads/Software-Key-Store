"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

import { CartItem } from "@/components/purchase/CartItem";
import { OrderSummary } from "@/components/purchase/OrderSummary";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { useCart } from "@/features/cart/CartProvider";
import type { ProductSummary } from "@/types/commerce";

async function loadCurrentProducts(): Promise<ProductSummary[]> {
  const response = await fetch("/api/products");
  if (!response.ok) {
    throw new Error("Unable to load products");
  }

  const data = (await response.json()) as { products?: unknown };
  if (!Array.isArray(data.products)) {
    throw new Error("Invalid products response");
  }

  return data.products as ProductSummary[];
}

export default function CartPage() {
  const {
    applyPromotion,
    clearPromotion,
    hydrated,
    issues,
    lines,
    promotion,
    reconcile,
    removeItem,
    setQuantity,
    totals,
  } = useCart();
  const reconciliationRequest = useRef<Promise<ProductSummary[]> | null>(null);
  const reconciliationCompleted = useRef(false);
  const [syncMessage, setSyncMessage] = useState("");

  useEffect(() => {
    if (
      !hydrated ||
      lines.length === 0 ||
      reconciliationCompleted.current
    ) {
      return;
    }

    reconciliationRequest.current ??= loadCurrentProducts();
    let active = true;

    void reconciliationRequest.current
      .then((products) => {
        if (active && !reconciliationCompleted.current) {
          reconciliationCompleted.current = true;
          reconcile(products);
        }
      })
      .catch(() => {
        if (active && !reconciliationCompleted.current) {
          reconciliationCompleted.current = true;
          setSyncMessage(
            "ยังตรวจสอบราคาและสต็อกล่าสุดไม่ได้ คุณยังแก้ไขตะกร้าได้ตามปกติ",
          );
        }
      });

    return () => {
      active = false;
    };
  }, [hydrated, lines.length, reconcile]);

  if (!hydrated) {
    return (
      <main className="cart-page">
        <div className="cart-page__heading">
          <Skeleton className="cart-page__title-skeleton" />
          <Skeleton className="cart-page__subtitle-skeleton" />
        </div>
        <div className="cart-page__layout">
          <Skeleton className="cart-page__items-skeleton" />
          <Skeleton className="cart-page__summary-skeleton" />
        </div>
      </main>
    );
  }

  if (lines.length === 0) {
    return (
      <main className="cart-page cart-page--empty">
        <EmptyState
          action={
            <Link className="ui-button ui-button--primary" href="/">
              เลือกซื้อซอฟต์แวร์
            </Link>
          }
          description="เลือกซอฟต์แวร์ที่ต้องการ แล้วกลับมาดำเนินการสั่งซื้อได้ทุกเมื่อ"
          icon={
            <span aria-hidden="true" className="material-symbols-outlined">
              shopping_cart
            </span>
          }
          title="ตะกร้าสินค้าของคุณว่างอยู่"
        />
      </main>
    );
  }

  const validLines = lines.filter(
    (line) => line.stock > 0 && line.quantity > 0,
  );

  return (
    <main className="cart-page">
      <div className="cart-page__heading">
        <div>
          <span className="cart-page__eyebrow">Your selection</span>
          <h1>ตะกร้าสินค้าของคุณ</h1>
          <p>
            ตรวจสอบรายการ ตัวเลือก และจำนวนสิทธิ์ก่อนดำเนินการชำระเงิน
          </p>
        </div>
        <span className="cart-page__count">
          {lines.length} {lines.length === 1 ? "รายการ" : "รายการ"}
        </span>
      </div>

      {issues.length > 0 || syncMessage ? (
        <div className="cart-page__alerts" role="alert">
          <strong>มีข้อมูลที่ต้องตรวจสอบ</strong>
          {issues.map((issue) => (
            <p key={`${issue.lineId}-${issue.type}`}>{issue.message}</p>
          ))}
          {syncMessage ? <p>{syncMessage}</p> : null}
        </div>
      ) : null}

      <div className="cart-page__layout">
        <section className="cart-page__items" aria-label="รายการสินค้าในตะกร้า">
          <div className="cart-page__columns" aria-hidden="true">
            <span>รายการสินค้า</span>
            <span>จำนวน</span>
            <span>ราคารวม</span>
            <span />
          </div>

          <div className="cart-page__list">
            {lines.map((line) => (
              <CartItem
                issues={issues
                  .filter((issue) => issue.lineId === line.lineId)
                  .map((issue) => issue.message)}
                key={line.lineId}
                line={line}
                onQuantityChange={(quantity) =>
                  setQuantity(line.lineId, quantity)
                }
                onRemove={() => removeItem(line.lineId)}
              />
            ))}
          </div>

          <Link
            className="ui-button ui-button--quiet cart-page__continue"
            href="/"
          >
            <span aria-hidden="true" className="material-symbols-outlined">
              arrow_back
            </span>
            ซื้อสินค้าต่อ
          </Link>
        </section>

        <OrderSummary
          checkoutDisabled={validLines.length === 0}
          onApplyPromotion={applyPromotion}
          onClearPromotion={clearPromotion}
          promotion={promotion}
          totals={totals}
          showTitle={false}
        />
      </div>
    </main>
  );
}
