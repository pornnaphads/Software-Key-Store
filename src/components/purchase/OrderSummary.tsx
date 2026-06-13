"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/Button";
import { FormMessage } from "@/components/ui/FormMessage";
import type {
  CartTotals,
  PromotionResult,
} from "@/features/cart/cart-types";

interface OrderSummaryProps {
  action?: ReactNode;
  additionalLines?: readonly { label: string; amount: number }[];
  children?: ReactNode;
  checkoutDisabled?: boolean;
  checkoutHref?: string;
  onApplyPromotion: (code: string) => PromotionResult;
  onClearPromotion: () => void;
  promotion: PromotionResult;
  showPromotion?: boolean;
  showTitle?: boolean;
  totals: CartTotals;
}

function formatBaht(value: number): string {
  return `฿${value.toLocaleString("en-US", {
    maximumFractionDigits: 0,
  })}`;
}

export function OrderSummary({
  action,
  additionalLines = [],
  children,
  checkoutDisabled = false,
  checkoutHref = "/checkout",
  onApplyPromotion,
  onClearPromotion,
  promotion,
  showPromotion = true,
  showTitle = true,
  totals,
}: OrderSummaryProps) {
  const [code, setCode] = useState("");
  const [feedback, setFeedback] = useState<PromotionResult | null>(null);

  const submitPromotion = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFeedback(onApplyPromotion(code));
  };

  const clearPromotion = () => {
    onClearPromotion();
    setCode("");
    setFeedback(null);
  };

  const message = feedback?.message || promotion.message;
  const messageTone = feedback && !feedback.valid ? "error" : "success";

  return (
    <aside className="order-summary" aria-labelledby={showTitle ? "order-summary-title" : undefined}>
      {showTitle ? (
        <header>
          <span aria-hidden="true" className="material-symbols-outlined">
            receipt_long
          </span>
          <h2 id="order-summary-title">สรุปคำสั่งซื้อ</h2>
        </header>
      ) : null}

      {children}

      {showPromotion ? (
        <div className="order-summary__promotion">
          {promotion.code ? (
            <div className="order-summary__active-code">
              <div>
                <span>โค้ดที่ใช้</span>
                <strong>{promotion.code}</strong>
              </div>
              <button onClick={clearPromotion} type="button">
                นำโค้ดออก
              </button>
            </div>
          ) : (
            <form onSubmit={submitPromotion}>
              <label htmlFor="promotion-code">โค้ดส่วนลด</label>
              <div>
                <input
                  id="promotion-code"
                  onChange={(event) => setCode(event.target.value)}
                  placeholder="เช่น SOFTKEY10"
                  value={code}
                />
                <Button disabled={!code.trim()} type="submit" variant="secondary">
                  ใช้โค้ด
                </Button>
              </div>
            </form>
          )}
          <FormMessage tone={messageTone}>{message}</FormMessage>
        </div>
      ) : null}

      <dl className="order-summary__totals">
        <div>
          <dt>ยอดรวมสินค้า</dt>
          <dd>{formatBaht(totals.subtotal)}</dd>
        </div>
        {totals.discount > 0 ? (
          <div className="order-summary__discount">
            <dt>ส่วนลด</dt>
            <dd>-{formatBaht(totals.discount)}</dd>
          </div>
        ) : null}
        {additionalLines.map((line) => (
          <div key={line.label}>
            <dt>{line.label}</dt>
            <dd>{formatBaht(line.amount)}</dd>
          </div>
        ))}
        <div className="order-summary__grand-total">
          <dt>ยอดรวมสุทธิ</dt>
          <dd>{formatBaht(totals.total)}</dd>
        </div>
      </dl>

      {action ?? (checkoutDisabled ? (
        <Button className="order-summary__checkout" disabled>
          ดำเนินการชำระเงิน
        </Button>
      ) : (
        <Link
          className="ui-button ui-button--primary order-summary__checkout"
          href={checkoutHref}
        >
          ดำเนินการชำระเงิน
          <span aria-hidden="true" className="material-symbols-outlined">
            arrow_forward
          </span>
        </Link>
      ))}

    </aside>
  );
}
