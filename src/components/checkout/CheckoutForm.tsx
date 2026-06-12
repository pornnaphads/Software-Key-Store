"use client";

import { useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

import { PaymentSelector } from "@/components/checkout/PaymentSelector";
import { OrderSummary } from "@/components/purchase/OrderSummary";
import { Field } from "@/components/ui/Field";
import { FormMessage } from "@/components/ui/FormMessage";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { useCart } from "@/features/cart/CartProvider";
import {
  PRIORITY_SUPPORT_PRICE,
  prepareCheckout,
  simulateCheckout,
  type CheckoutAttemptGuard,
  type CheckoutContact,
  type CheckoutResult,
  type PaymentMethod,
} from "@/features/checkout/checkout";
import { getProductAsset } from "@/lib/product-assets";
import type { FieldErrors } from "@/types/commerce";

interface CheckoutFormProps {
  checkoutSimulator?: typeof simulateCheckout;
}

const EMPTY_CONTACT: CheckoutContact = {
  firstName: "",
  lastName: "",
  email: "",
};

function formatBaht(value: number): string {
  return `฿${value.toLocaleString("en-US", {
    maximumFractionDigits: 0,
  })}`;
}

export function CheckoutForm({
  checkoutSimulator = simulateCheckout,
}: CheckoutFormProps) {
  const { clearCart, lines, promotion, totals } = useCart();
  const router = useRouter();
  const guard = useRef<CheckoutAttemptGuard>({ inFlight: false });
  const [contact, setContact] = useState<CheckoutContact>(EMPTY_CONTACT);
  const [errors, setErrors] = useState<FieldErrors<CheckoutContact>>({});
  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>("promptpay");
  const [prioritySupport, setPrioritySupport] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<CheckoutResult | null>(null);

  const supportPrice = prioritySupport ? PRIORITY_SUPPORT_PRICE : 0;
  const checkoutTotals = useMemo(
    () => ({
      subtotal: totals.subtotal,
      discount: totals.discount,
      total: totals.total + supportPrice,
    }),
    [supportPrice, totals.discount, totals.subtotal, totals.total],
  );

  const updateContact = (field: keyof CheckoutContact, value: string) => {
    setContact((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const submitCheckout = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting) {
      return;
    }

    const preparation = prepareCheckout({
      cartTotal: totals.total,
      contact,
      lines,
      paymentMethod,
      prioritySupport,
    });

    if (!preparation.valid) {
      setErrors(preparation.fields);
      setResult({
        status: preparation.status,
        message: preparation.message,
        fields: preparation.fields,
      });
      return;
    }

    setErrors({});
    setResult(null);
    setSubmitting(true);

    const nextResult = await checkoutSimulator(preparation, {
      guard: guard.current,
    });
    setResult(nextResult);
    setSubmitting(false);

    if (nextResult.status === "success") {
      clearCart();
      router.push("/profile");
    }
  };

  const resultTone = result?.status === "success" ? "success" : "error";
  const emptyCart = lines.length === 0;

  return (
    <form className="checkout-form" onSubmit={submitCheckout}>
      <div className="checkout-form__main">
        <section className="checkout-card">
          <PaymentSelector
            onChange={(method) => {
              setPaymentMethod(method);
              setResult(null);
            }}
            value={paymentMethod}
          />
        </section>

        <section className="checkout-card checkout-contact">
          <header>
            <span aria-hidden="true" className="material-symbols-outlined fill">
              contact_mail
            </span>
            <div>
              <h2>ข้อมูลสำหรับจัดส่ง Product Key</h2>
              <p>ใช้สำหรับส่งคีย์ ใบเสร็จ และข้อมูลคำสั่งซื้อเท่านั้น</p>
            </div>
          </header>
          <div className="checkout-contact__fields">
            <Field
              autoComplete="email"
              className="checkout-contact__email"
              error={errors.email}
              id="checkout-email"
              label="อีเมลสำหรับรับ Product Key"
              onChange={(event) => updateContact("email", event.target.value)}
              placeholder="you@example.com"
              type="email"
              value={contact.email}
            />
            <Field
              autoComplete="given-name"
              error={errors.firstName}
              id="checkout-first-name"
              label="ชื่อ"
              onChange={(event) =>
                updateContact("firstName", event.target.value)
              }
              placeholder="Mint"
              value={contact.firstName}
            />
            <Field
              autoComplete="family-name"
              error={errors.lastName}
              id="checkout-last-name"
              label="นามสกุล"
              onChange={(event) =>
                updateContact("lastName", event.target.value)
              }
              placeholder="S."
              value={contact.lastName}
            />
          </div>
        </section>
      </div>

      <OrderSummary
        action={
          <SubmitButton
            className="order-summary__checkout"
            disabled={emptyCart || submitting}
            loading={submitting}
            loadingText="กำลังยืนยันการชำระเงิน"
          >
            <span aria-hidden="true" className="material-symbols-outlined">
              lock
            </span>
            ยืนยันการชำระเงิน
          </SubmitButton>
        }
        additionalLines={
          prioritySupport
            ? [{ label: "Priority Support", amount: PRIORITY_SUPPORT_PRICE }]
            : []
        }
        checkoutDisabled={emptyCart}
        onApplyPromotion={() => promotion}
        onClearPromotion={() => undefined}
        promotion={promotion}
        showPromotion={false}
        totals={checkoutTotals}
      >
        <div className="checkout-summary__content">
          {emptyCart ? (
            <p className="checkout-summary__empty">ไม่มีสินค้าในตะกร้า</p>
          ) : (
            <div className="checkout-summary__items">
              {lines.map((line) => (
                <article key={line.lineId}>
                  <div className="checkout-summary__image">
                    <Image
                      alt={line.name}
                      fill
                      sizes="64px"
                      src={getProductAsset(line.imageKey)}
                    />
                  </div>
                  <div>
                    <h3>{line.name}</h3>
                    <p>
                      จำนวน {line.quantity} ·{" "}
                      {line.options.length > 0
                        ? line.options.map((option) => option.label).join(", ")
                        : "Digital License"}
                    </p>
                    <strong>
                      {formatBaht(line.unitPrice * line.quantity)}
                    </strong>
                  </div>
                </article>
              ))}
            </div>
          )}

          <label className="checkout-summary__support">
            <input
              aria-label="Priority Support"
              checked={prioritySupport}
              disabled={emptyCart}
              onChange={(event) => setPrioritySupport(event.target.checked)}
              type="checkbox"
            />
            <span>
              <strong>Priority Support</strong>
              <small>รับการช่วยเหลือติดตั้งแบบเร่งด่วน</small>
            </span>
            <b>+{formatBaht(PRIORITY_SUPPORT_PRICE)}</b>
          </label>
        </div>

        {result ? (
          <FormMessage className="checkout-form__result" tone={resultTone}>
            {result.message}
          </FormMessage>
        ) : null}
      </OrderSummary>
    </form>
  );
}
