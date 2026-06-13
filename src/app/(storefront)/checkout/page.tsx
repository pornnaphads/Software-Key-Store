"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";

import { submitCheckout } from "@/app/(storefront)/checkout/actions";
import { useCart } from "@/features/cart/CartProvider";
import { getProductAsset } from "@/lib/product-assets";

function formatBaht(value: number): string {
  return `${value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} ฿`;
}

export default function CheckoutPage() {
  const { lines, clearCart } = useCart();
  const router = useRouter();
  
  // Timer state
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes
  const [buyNowLine, setBuyNowLine] = useState<any>(null);
  const [isBuyNow, setIsBuyNow] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const searchParams = new URLSearchParams(window.location.search);
      if (searchParams.get("buyNow") === "1") {
        const stored = sessionStorage.getItem("buy_now_item");
        if (stored) {
          try {
            setBuyNowLine(JSON.parse(stored));
            setIsBuyNow(true);
          } catch (e) {
            console.error("Failed to parse buy_now_item", e);
          }
        }
      }
    }
  }, []);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const intervalId = setInterval(() => {
      setTimeLeft(t => t - 1);
    }, 1000);
    return () => clearInterval(intervalId);
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const checkoutLines = isBuyNow && buyNowLine ? [buyNowLine] : lines;
  const validLines = checkoutLines.filter(line => line.stock > 0 && line.quantity > 0);
  const subtotal = validLines.reduce((sum, line) => sum + (line.unitPrice * line.quantity), 0);
  const tax = 0;
  const total = subtotal + tax;

  const handleConfirm = async () => {
    if (validLines.length === 0) return;
    setSubmitting(true);
    setSubmitError(null);

    try {
      const result = await submitCheckout({
        paymentMethod: "PROMPTPAY",
        promotionCode: null,
        lines: validLines.map((l) => ({
          productId: l.productId,
          quantity: l.quantity,
        })),
      });

      if (result.status === "error") {
        setSubmitError(result.message);
        return;
      }

      // สำเร็จ — ล้างตะกร้า แล้ว redirect ไปหน้าประวัติ
      if (isBuyNow) {
        sessionStorage.removeItem("buy_now_item");
      } else {
        clearCart();
      }
      router.push("/profile?tab=orders");
    } catch {
      setSubmitError("เกิดข้อผิดพลาด กรุณาลองใหม่");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#64748B] p-4 md:p-8 overflow-y-auto">
      
      {/* Modal Container */}
      <div className="bg-white rounded-2xl shadow-2xl flex flex-col md:flex-row w-full max-w-[900px] overflow-hidden relative">
        
        {/* Left Side: Payment Method (60%) */}
        <div className="w-full md:w-[60%] p-8 md:p-10 flex flex-col h-full bg-white relative">
          <div className="mb-8">
            <h1 className="text-[24px] font-bold text-[#2563EB] mb-1">ชำระเงิน</h1>
            <p className="text-[13px] text-[#64748B]">การทำธุรกรรมของคุณได้รับการเข้ารหัสอย่างปลอดภัย</p>
          </div>

          <div className="mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px] text-[#64748B]">payment</span>
            <span className="font-bold text-[#1E293B] text-[14px]">เลือกวิธีชำระเงิน</span>
          </div>

          <div className="border border-[#2563EB] rounded-xl p-4 flex flex-col items-center justify-center bg-white cursor-pointer mb-6 ring-1 ring-[#2563EB]/20">
            <span className="material-symbols-outlined text-[#2563EB] text-[24px] mb-2">qr_code_2</span>
            <span className="text-[#1E293B] font-bold text-[13px]">Thai QR Payment</span>
          </div>

          {/* QR Code Area */}
          <div className="bg-[#F8FAFC] rounded-2xl border border-[#E2E8F0] p-6 flex flex-col items-center justify-center flex-grow mb-6">
            <div className="w-[200px] h-[200px] bg-white flex items-center justify-center mb-6 border border-[#E2E8F0] p-2 rounded-lg overflow-hidden">
              <img
                src={total > 0 ? `https://promptpay.io/0653296340/${total.toFixed(2)}.png` : `https://promptpay.io/0653296340.png`}
                alt="PromptPay QR Code"
                className="w-full h-full object-contain"
              />
            </div>
            
            <div className="bg-white border border-[#E2E8F0] rounded-full px-6 py-2 flex items-center gap-2 mb-4 shadow-sm">
              <span className="material-symbols-outlined text-[16px] text-[#64748B]">timer</span>
              <span className="text-[14px] text-[#1E293B] font-medium">
                QR Code หมดอายุใน: <strong className="font-bold">{formatTime(timeLeft)}</strong>
              </span>
            </div>
            
            <div className="flex items-center justify-center gap-2 text-[12px] text-[#64748B]">
              <span className="w-5 h-5 bg-[#0F172A] rounded text-white flex items-center justify-center">
                <span className="material-symbols-outlined text-[14px]">qr_code_scanner</span>
              </span>
              สแกนผ่านแอปธนาคารทุกแอป
            </div>
          </div>

          <div className="text-[#EF4444] text-[13px] font-bold">
            หมายเหตุ : ขอใบกำกับภาษีโปรดติดต่อแอดมิน
          </div>
        </div>

        {/* Right Side: Order Summary (40%) */}
        <div className="w-full md:w-[40%] bg-[#F8FAFC] border-l border-[#E2E8F0] p-8 md:p-10 flex flex-col relative">
          
          <Link href="/cart" className="absolute top-6 right-6 text-[#64748B] hover:text-[#1E293B] transition-colors p-2">
             <span className="material-symbols-outlined">close</span>
          </Link>

          <h3 className="font-bold text-[#1E293B] text-[15px] mb-6 mt-4">สรุปรายการ</h3>

          {/* Items */}
          <div className="space-y-4 mb-8 overflow-y-auto flex-grow max-h-[300px] pr-2">
            {validLines.map(line => (
              <div key={line.lineId} className="flex gap-4 items-start pb-4 border-b border-[#E2E8F0] last:border-0 last:pb-0">
                <div className="w-16 h-16 bg-[#0F172A] rounded-lg overflow-hidden flex items-center justify-center flex-shrink-0 relative">
                  <Image
                    src={getProductAsset(line.imageKey) || "https://placehold.co/96x96/0F172A/ffffff?text=App"}
                    alt={line.name}
                    fill
                    sizes="64px"
                    className="object-contain p-1"
                  />
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-[#1E293B] text-[13px] line-clamp-2 leading-tight mb-1">{line.name}</span>
                  <span className="text-[11px] text-[#64748B] mb-1">จำนวน: {line.quantity}</span>
                  <span className="text-[10px] text-[#2563EB] bg-[#EFF6FF] px-2 py-0.5 rounded-full w-max font-bold">LIFETIME</span>
                </div>
              </div>
            ))}
            {validLines.length === 0 && (
              <div className="text-[#64748B] text-[13px] italic">ไม่มีรายการสั่งซื้อ</div>
            )}
          </div>

          {/* Totals */}
          <div className="space-y-3 pt-6 border-t border-[#E2E8F0] mb-8">
            <div className="flex justify-between text-[13px]">
              <span className="text-[#475569]">ราคาสินค้า</span>
              <span className="text-[#1E293B] font-medium">{formatBaht(subtotal)}</span>
            </div>
            <div className="flex justify-between text-[13px]">
              <span className="text-[#475569]">ภาษี (0%)</span>
              <span className="text-[#1E293B] font-medium">{formatBaht(tax)}</span>
            </div>
            <div className="flex justify-between items-end pt-4 border-t border-[#E2E8F0]">
              <span className="font-bold text-[#1E293B] text-[14px]">ยอดชำระสุทธิ</span>
              <span className="font-bold text-[#2563EB] text-[20px] leading-none">{formatBaht(total)}</span>
            </div>
          </div>

          {/* Error */}
          {submitError && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4 text-red-600 text-[13px] font-medium">
              {submitError}
            </div>
          )}

          {/* Action */}
          <div className="mt-auto">
            <button
              onClick={handleConfirm}
              disabled={validLines.length === 0 || submitting}
              className="w-full bg-[#2563EB] hover:bg-[#1D4ED8] disabled:bg-[#94A3B8] disabled:cursor-not-allowed text-white py-3.5 rounded-xl font-bold text-[14px] transition-colors flex items-center justify-center gap-2 shadow-sm mb-4"
            >
              {submitting ? (
                <>
                  <span className="ui-spinner" />
                  กำลังดำเนินการ...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px]">lock</span>
                  ยืนยันการชำระเงิน
                </>
              )}
            </button>
            <div className="flex items-center justify-center gap-1.5 text-[11px] text-[#64748B]">
              <span className="material-symbols-outlined text-[14px]">verified_user</span>
              Secure SSL Encryption
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
