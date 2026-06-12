import Image from "next/image";
import Link from "next/link";

import { QuantityControl } from "@/components/purchase/QuantityControl";
import type { CartLine } from "@/features/cart/cart-types";
import { getProductAsset } from "@/lib/product-assets";

interface CartItemProps {
  issues?: string[];
  line: CartLine;
  onQuantityChange: (quantity: number) => void;
  onRemove: () => void;
}

function formatBaht(value: number): string {
  return `฿${value.toLocaleString("en-US", {
    maximumFractionDigits: 0,
  })}`;
}

export function CartItem({
  issues = [],
  line,
  onQuantityChange,
  onRemove,
}: CartItemProps) {
  const unavailable = line.stock <= 0 || line.quantity <= 0;

  return (
    <article className="cart-item">
      <div className="cart-item__product">
        <Link
          aria-label={`ดูรายละเอียด ${line.name}`}
          className="cart-item__image"
          href={`/product/${line.productId}`}
        >
          <Image
            alt={line.name}
            fill
            sizes="96px"
            src={getProductAsset(line.imageKey)}
          />
        </Link>
        <div className="cart-item__identity">
          <span>{line.category} · Digital License</span>
          <h2>
            <Link href={`/product/${line.productId}`}>{line.name}</Link>
          </h2>
          {line.options.length > 0 ? (
            <ul aria-label="ตัวเลือกสินค้า">
              {line.options.map((option) => (
                <li key={option.id}>{option.label}</li>
              ))}
            </ul>
          ) : null}
          <strong>{formatBaht(line.unitPrice)} / สิทธิ์</strong>
        </div>
      </div>

      <div className="cart-item__quantity">
        <span className="cart-item__mobile-label">จำนวน</span>
        <QuantityControl
          name={line.name}
          onChange={onQuantityChange}
          quantity={line.quantity}
          stock={line.stock}
        />
        <small>
          {unavailable ? "สินค้าหมด" : `คงเหลือ ${line.stock} สิทธิ์`}
        </small>
      </div>

      <div className="cart-item__total">
        <span className="cart-item__mobile-label">ราคารวม</span>
        <strong>{formatBaht(line.unitPrice * line.quantity)}</strong>
      </div>

      <button
        aria-label={`นำ ${line.name} ออกจากตะกร้า`}
        className="cart-item__remove"
        onClick={onRemove}
        type="button"
      >
        <span aria-hidden="true" className="material-symbols-outlined">
          delete
        </span>
      </button>

      {issues.length > 0 ? (
        <div className="cart-item__issues">
          {issues.map((issue) => (
            <p key={issue}>
              <span aria-hidden="true" className="material-symbols-outlined">
                info
              </span>
              {issue}
            </p>
          ))}
        </div>
      ) : null}
    </article>
  );
}
