"use client";

import { useRef } from "react";
import Image from "next/image";

import type { PaymentMethod } from "@/features/checkout/checkout";

interface PaymentSelectorProps {
  value: PaymentMethod;
  onChange: (method: PaymentMethod) => void;
}

const METHODS: readonly PaymentMethod[] = ["promptpay", "card"];

export function PaymentSelector({
  onChange,
  value,
}: PaymentSelectorProps) {
  const inputRefs = useRef<Record<PaymentMethod, HTMLInputElement | null>>({
    promptpay: null,
    card: null,
  });

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>,
    method: PaymentMethod,
  ) => {
    if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key)) {
      return;
    }

    event.preventDefault();
    const currentIndex = METHODS.indexOf(method);
    const direction =
      event.key === "ArrowRight" || event.key === "ArrowDown" ? 1 : -1;
    const nextIndex =
      (currentIndex + direction + METHODS.length) % METHODS.length;
    const nextMethod = METHODS[nextIndex];

    onChange(nextMethod);
    inputRefs.current[nextMethod]?.focus();
  };

  return (
    <fieldset className="payment-selector">
      <legend>
        <span aria-hidden="true" className="material-symbols-outlined fill">
          payments
        </span>
        เลือกวิธีการชำระเงิน
      </legend>

      <div className="payment-selector__options">
        <label className={value === "promptpay" ? "is-selected" : undefined}>
          <input
            aria-label="Thai QR Payment"
            checked={value === "promptpay"}
            name="payment-method"
            onChange={() => onChange("promptpay")}
            onKeyDown={(event) => handleKeyDown(event, "promptpay")}
            ref={(node) => {
              inputRefs.current.promptpay = node;
            }}
            type="radio"
            value="promptpay"
          />
          <span aria-hidden="true" className="material-symbols-outlined">
            qr_code_2
          </span>
          <strong>Thai QR Payment</strong>
          <small>PromptPay · พร้อมใช้งาน</small>
        </label>

        <label className={value === "card" ? "is-selected" : undefined}>
          <input
            aria-label="Credit / Debit Card"
            checked={value === "card"}
            name="payment-method"
            onChange={() => onChange("card")}
            onKeyDown={(event) => handleKeyDown(event, "card")}
            ref={(node) => {
              inputRefs.current.card = node;
            }}
            type="radio"
            value="card"
          />
          <span aria-hidden="true" className="material-symbols-outlined">
            credit_card
          </span>
          <strong>Credit / Debit Card</strong>
          <small>เตรียมเปิดให้บริการ</small>
        </label>
      </div>

      {value === "promptpay" ? (
        <div className="payment-selector__promptpay">
          <div className="payment-selector__qr">
            <Image
              alt="ตัวอย่าง QR สำหรับ Thai QR Payment"
              height={220}
              priority
              src="/assets/softkeystore/payments/promptpay-qr.png"
              width={220}
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
      ) : (
        <div className="payment-selector__card" role="status">
          <div>
            <Image
              alt="Visa"
              height={32}
              src="/assets/softkeystore/payments/visa.png"
              width={84}
            />
            <Image
              alt="Mastercard"
              height={40}
              src="/assets/softkeystore/payments/mastercard.png"
              width={64}
            />
          </div>
          <span aria-hidden="true" className="material-symbols-outlined">
            schedule
          </span>
          <h3>ยังไม่เปิดให้ชำระด้วยบัตร</h3>
          <p>
            หน้านี้ไม่รับหรือส่งข้อมูลบัตร กรุณาเลือก Thai QR Payment
            เพื่อดำเนินการต่อ
          </p>
        </div>
      )}
    </fieldset>
  );
}
