"use client";

import { useId, useRef } from "react";

import type { AdminOrderRowDto } from "@/data/admin/orders";
import { formatBaht } from "@/features/admin/money";

const PAYMENT_LABELS: Record<string, string> = {
  PROMPTPAY: "Thai QR Payment",
  CREDIT_CARD: "บัตรเครดิต",
  TRUEMONEY: "TrueMoney",
};

export function OrderDetailsDialog({ order }: { order: AdminOrderRowDto }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();

  function openDialog() {
    const dialog = dialogRef.current;
    if (!dialog) {
      return;
    }

    if (typeof dialog.showModal === "function") {
      dialog.showModal();
    } else {
      dialog.setAttribute("open", "");
    }
  }

  function closeDialog() {
    const dialog = dialogRef.current;
    if (!dialog) {
      return;
    }

    if (typeof dialog.close === "function") {
      dialog.close();
    } else {
      dialog.removeAttribute("open");
      triggerRef.current?.focus();
    }
  }

  return (
    <>
      <button
        className="admin-order-details-trigger"
        onClick={openDialog}
        ref={triggerRef}
        type="button"
      >
        <span aria-hidden="true" className="material-symbols-outlined">
          visibility
        </span>
        ดูรายละเอียด
      </button>
      <dialog
        aria-labelledby={titleId}
        className="admin-order-dialog"
        onCancel={(event) => {
          event.preventDefault();
          closeDialog();
        }}
        onClose={() => triggerRef.current?.focus()}
        ref={dialogRef}
      >
        <div className="admin-order-dialog__header">
          <div>
            <p>คำสั่งซื้อ</p>
            <h2 id={titleId}>#{order.id.toString().padStart(6, "0")}</h2>
          </div>
          <button
            aria-label="ปิดรายละเอียดคำสั่งซื้อ"
            onClick={closeDialog}
            type="button"
          >
            <span aria-hidden="true" className="material-symbols-outlined">
              close
            </span>
          </button>
        </div>

        <dl className="admin-order-dialog__meta">
          <div>
            <dt>ลูกค้า</dt>
            <dd>{order.customerName}</dd>
          </div>
          <div>
            <dt>อีเมล</dt>
            <dd>{order.customerEmail}</dd>
          </div>
          <div>
            <dt>วิธีชำระเงิน</dt>
            <dd>
              {PAYMENT_LABELS[order.paymentMethod ?? ""] ??
                order.paymentMethod ??
                "-"}
            </dd>
          </div>
          <div>
            <dt>โค้ดส่วนลด</dt>
            <dd>{order.discountCode ?? "-"}</dd>
          </div>
        </dl>

        <div className="admin-order-dialog__items">
          <h3>รายการสินค้า</h3>
          {order.items.map((item) => (
            <article key={item.id}>
              <div>
                <strong>{item.productName}</strong>
                <span>
                  {item.quantity} รายการ · {formatBaht(item.price)} / รายการ
                </span>
              </div>
              <span className={item.hasLicenseKey ? "is-ready" : ""}>
                <span aria-hidden="true" className="material-symbols-outlined">
                  {item.hasLicenseKey ? "key" : "schedule"}
                </span>
                {item.hasLicenseKey ? "มีคีย์แล้ว" : "รอจัดสรรคีย์"}
              </span>
            </article>
          ))}
        </div>

        <dl className="admin-order-dialog__totals">
          <div>
            <dt>ยอดสินค้า</dt>
            <dd>{formatBaht(order.subtotal)}</dd>
          </div>
          <div>
            <dt>ส่วนลด</dt>
            <dd>-{formatBaht(order.discountAmount)}</dd>
          </div>
          <div>
            <dt>ยอดสุทธิ</dt>
            <dd>{formatBaht(order.total)}</dd>
          </div>
        </dl>
      </dialog>
    </>
  );
}
