"use client";

import Image from "next/image";
import type { PaymentMethod } from "@/features/checkout/checkout";

interface PaymentSelectorProps {
  value: PaymentMethod;
  onChange: (method: PaymentMethod) => void;
  total?: number;
}

export function PaymentSelector({
  onChange,
  value,
  total,
}: PaymentSelectorProps) {
  return (
    <fieldset className="payment-selector">
      <legend>
        <span aria-hidden="true" className="material-symbols-outlined fill">
          payments
        </span>
        เลือกวิธีการชำระเงิน
      </legend>

      <div className="payment-selector__options">
        <label className="is-selected">
          <input
            aria-label="Thai QR Payment"
            checked={true}
            name="payment-method"
            onChange={() => onChange("promptpay")}
            type="radio"
            value="promptpay"
          />
          <span aria-hidden="true" className="material-symbols-outlined">
            qr_code_2
          </span>
          <strong>Thai QR Payment</strong>
          <small>PromptPay · พร้อมใช้งาน</small>
        </label>
      </div>

      <div className="payment-selector__promptpay">
        <div className="payment-selector__qr">
          <img
            alt="ตัวอย่าง QR สำหรับ Thai QR Payment"
            src={total && total > 0 ? `https://promptpay.io/0653296340/${total.toFixed(2)}.png` : `/assets/softkeystore/payments/promptpay-qr.png`}
          />
        </div>
        <div>
          <Image
            alt="PromptPay"
            height={36}
            src="/assets/softkeystore/payments/promptpay.png"
            style={{ height: "25px", width: "auto" }}
            width={142}
          />
          <p>สแกนด้วยแอป Mobile Banking หลังยืนยันคำสั่งซื้อ</p>
        </div>
      </div>
    </fieldset>
  );
}
