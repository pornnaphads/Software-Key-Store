"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

import { Button } from "@/components/ui/Button";
import { createLineId } from "@/features/cart/cart-math";
import { useCart } from "@/features/cart/CartProvider";
import type { CartLine } from "@/features/cart/cart-types";
import type { ProductDetail, ProductOption } from "@/types/commerce";

interface PurchasePanelProps {
  product: ProductDetail;
  options: readonly ProductOption[];
  quantity: number;
  unitPrice: number;
  disabled?: boolean;
}

export function PurchasePanel({
  disabled = false,
  options,
  product,
  quantity,
  unitPrice,
}: PurchasePanelProps) {
  const { addItem } = useCart();
  const { status } = useSession();
  const router = useRouter();
  const [announcement, setAnnouncement] = useState("");

  const unavailable =
    disabled ||
    product.stock <= 0 ||
    quantity < 1 ||
    quantity > product.stock ||
    !Number.isFinite(unitPrice) ||
    unitPrice <= 0;

  const createLine = (): CartLine => ({
    lineId: createLineId(product.id, options),
    productId: product.id,
    name: product.name,
    category: product.category,
    imageKey: product.image,
    unitPrice,
    quantity,
    stock: product.stock,
    options: [...options],
  });

  const addConfiguredProduct = () => {
    if (unavailable) return;
    if (status !== "authenticated") {
      router.push("/login?callbackUrl=" + encodeURIComponent(window.location.pathname));
      return;
    }
    addItem(createLine());
    setAnnouncement(`เพิ่ม ${product.name} ลงตะกร้าแล้ว`);
  };

  const buyNow = () => {
    if (unavailable) return;
    if (status !== "authenticated") {
      router.push("/login?callbackUrl=" + encodeURIComponent(window.location.pathname));
      return;
    }
    addItem(createLine());
    router.push("/checkout");
  };

  return (
    <div className="purchase-panel">
      <Button disabled={unavailable} onClick={addConfiguredProduct}>
        <span aria-hidden="true" className="material-symbols-outlined">
          add_shopping_cart
        </span>
        เพิ่มลงตะกร้า
      </Button>
      <Button disabled={unavailable} onClick={buyNow} variant="secondary">
        ซื้อทันที
        <span aria-hidden="true" className="material-symbols-outlined">
          arrow_forward
        </span>
      </Button>
      <p className="sr-only" role="status" aria-live="polite">
        {announcement}
      </p>
    </div>
  );
}
