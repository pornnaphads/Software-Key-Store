"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";

import {
  verifyPaymentSlip,
  createPendingOrderAction,
  confirmPaymentAction,
  cancelOrderAction,
  getPendingOrderTimeLeftAction,
} from "@/app/(storefront)/checkout/actions";
import { useCart } from "@/features/cart/CartProvider";
import { getProductAsset } from "@/lib/product-assets";

function formatBaht(value: number): string {
  return `฿ ${value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export default function PaymentPage() {
  const { lines, clearCart, removeItem, hydrated } = useCart();
  const router = useRouter();

  // Timer & initialization state
  const [orderId, setOrderId] = useState<number | null>(null);
  const [initializingOrder, setInitializingOrder] = useState(true);
  const [showExpiredModal, setShowExpiredModal] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes

  const [buyNowLine, setBuyNowLine] = useState<any>(null);
  const [isBuyNow, setIsBuyNow] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [selectedItemIds, setSelectedItemIds] = useState<string[] | null>(null);

  // Promo & discount states
  const [promoCode, setPromoCode] = useState<string | null>(null);
  const [discount, setDiscount] = useState(0);

  // Gift details states
  const [giftEmail, setGiftEmail] = useState<string | null>(null);
  const [giftMessage, setGiftMessage] = useState<string | null>(null);

  // Slip validation states
  const [verifyingSlip, setVerifyingSlip] = useState(false);
  const [slipVerified, setSlipVerified] = useState(false);
  const [verifiedSlipData, setVerifiedSlipData] = useState<any>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorModalMessage, setErrorModalMessage] = useState("");

  const initRef = useRef(false);

  // Step 1: Initialize states and create/verify pending order on mount when hydrated
  useEffect(() => {
    if (!hydrated || typeof window === "undefined") return;
    if (initRef.current) return;
    initRef.current = true;

    const initializeOrder = async () => {
      const searchParams = new URLSearchParams(window.location.search);
      let isBuyNowLocal = false;
      let buyNowLineLocal: any = null;

      if (searchParams.get("buyNow") === "1") {
        const stored = sessionStorage.getItem("buy_now_item");
        if (stored) {
          try {
            buyNowLineLocal = JSON.parse(stored);
            isBuyNowLocal = true;
            setBuyNowLine(buyNowLineLocal);
            setIsBuyNow(true);
          } catch (e) {
            console.error("Failed to parse buy_now_item", e);
          }
        }
      }

      // Retrieve applied promotion information
      let promoCodeLocal: string | null = null;
      let discountLocal = 0;
      const promoStored = sessionStorage.getItem("checkout_promo");
      if (promoStored) {
        try {
          const parsed = JSON.parse(promoStored);
          promoCodeLocal = parsed.code;
          discountLocal = parsed.discount || 0;
          setPromoCode(parsed.code);
          setDiscount(parsed.discount || 0);
        } catch (e) {
          console.error("Failed to parse checkout_promo", e);
        }
      }

      // Retrieve gift settings
      let giftEmailLocal: string | null = null;
      let giftMessageLocal: string | null = null;
      const giftStored = sessionStorage.getItem("checkout_gift");
      if (giftStored) {
        try {
          const parsed = JSON.parse(giftStored);
          giftEmailLocal = parsed.email;
          giftMessageLocal = parsed.message;
          setGiftEmail(parsed.email);
          setGiftMessage(parsed.message);
        } catch (e) {
          console.error("Failed to parse checkout_gift", e);
        }
      }

      let selectedItemIdsLocal: string[] | null = null;
      const itemsParam = searchParams.get("items");
      if (itemsParam) {
        selectedItemIdsLocal = itemsParam.split(",");
        setSelectedItemIds(selectedItemIdsLocal);
      }

      const checkoutLines = isBuyNowLocal && buyNowLineLocal ? [buyNowLineLocal] : lines;
      const validLinesLocal = checkoutLines.filter(
        (l) =>
          l.stock > 0 &&
          l.quantity > 0 &&
          (selectedItemIdsLocal === null || selectedItemIdsLocal.includes(l.lineId))
      );

      if (validLinesLocal.length === 0) {
        setInitializingOrder(false);
        return;
      }

      // Check for existing pending order
      const storedOrderId = sessionStorage.getItem("pending_order_id");
      if (storedOrderId) {
        const parsedOrderId = parseInt(storedOrderId, 10);
        if (!isNaN(parsedOrderId)) {
          const timeRes = await getPendingOrderTimeLeftAction(parsedOrderId);
          if (timeRes.status === "active") {
            setOrderId(parsedOrderId);
            setTimeLeft(timeRes.timeLeft);
            setInitializingOrder(false);
            return;
          } else {
            sessionStorage.removeItem("pending_order_id");
            setShowExpiredModal(true);
            setInitializingOrder(false);
            return;
          }
        }
      }

      // Create a new pending order (locks keys & decrements stock)
      try {
        const result = await createPendingOrderAction({
          promotionCode: promoCodeLocal || null,
          lines: validLinesLocal.map((l) => ({
            productId: l.productId,
            quantity: l.quantity,
          })),
          giftEmail: giftEmailLocal,
          giftMessage: giftMessageLocal,
        });

        if (result.status === "error") {
          setSubmitError(result.message);
        } else if (result.orderId) {
          setOrderId(result.orderId);
          sessionStorage.setItem("pending_order_id", result.orderId.toString());
          setTimeLeft(600); // 10 minutes
        }
      } catch (err) {
        setSubmitError("ไม่สามารถสำรองคีย์สินค้าสำหรับชำระเงินได้ กรุณาลองใหม่อีกครั้ง");
      } finally {
        setInitializingOrder(false);
      }
    };

    initializeOrder();
  }, [hydrated]);

  // Step 2: Handle timer countdown and expiration
  useEffect(() => {
    if (initializingOrder || orderId === null || showExpiredModal) return;

    if (timeLeft <= 0) {
      const handleExpire = async () => {
        try {
          await cancelOrderAction(orderId);
        } catch (e) {
          console.error("Failed to cancel order on expire", e);
        }
        sessionStorage.removeItem("pending_order_id");
        setShowExpiredModal(true);
      };
      handleExpire();
      return;
    }

    const intervalId = setInterval(() => {
      setTimeLeft((t) => t - 1);
    }, 1000);

    return () => clearInterval(intervalId);
  }, [timeLeft, orderId, initializingOrder, showExpiredModal]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const checkoutLines = isBuyNow && buyNowLine ? [buyNowLine] : lines;
  const validLines = checkoutLines.filter(
    (l) => l.stock > 0 && l.quantity > 0 && (selectedItemIds === null || selectedItemIds.includes(l.lineId))
  );
  const subtotal = validLines.reduce((sum, l) => sum + l.unitPrice * l.quantity, 0);
  const total = Math.max(0, subtotal - discount);

  const handleConfirm = async () => {
    if (orderId === null || !slipVerified) return;
    setSubmitting(true);
    setSubmitError(null);

    try {
      const result = await confirmPaymentAction(orderId);

      if (result.status === "error") {
        setSubmitError(result.message);
        return;
      }

      // Success - clear cart and redirect to profile orders tab
      if (isBuyNow) {
        sessionStorage.removeItem("buy_now_item");
      } else {
        validLines.forEach((line) => {
          removeItem(line.lineId);
        });
      }
      sessionStorage.removeItem("checkout_promo");
      sessionStorage.removeItem("checkout_gift");
      sessionStorage.removeItem("pending_order_id");
      router.push("/profile?tab=orders");
    } catch (e) {
      setSubmitError("เกิดข้อผิดพลาดในการดำเนินการคำสั่งซื้อ กรุณาลองใหม่อีกครั้ง");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelPayment = async () => {
    if (orderId !== null) {
      setSubmitting(true);
      try {
        await cancelOrderAction(orderId);
      } catch (e) {
        console.error("Failed to cancel order", e);
      } finally {
        setSubmitting(false);
      }
      sessionStorage.removeItem("pending_order_id");
    }
    router.push("/cart");
  };

  const handleExpiredOk = () => {
    setShowExpiredModal(false);
    router.push("/cart");
  };

  const handleSlipUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setVerifyingSlip(true);
    setSubmitError(null);
    setSlipVerified(false);
    setVerifiedSlipData(null);

    const formData = new FormData();
    formData.append("slip", file);

    try {
      const result = await verifyPaymentSlip(formData);
      if (result.status === "error") {
        setErrorModalMessage(result.message || "สลิปไม่ถูกต้อง หรือไม่ใช่สลิปโอนเงินจริง");
        setShowErrorModal(true);
        e.target.value = "";
        return;
      }

      // Check if amount matches total
      const slipAmount = Number(result.data.amount);
      const expectedAmount = Number(total);

      // Allow minor float differences e.g. 0.01
      if (Math.abs(slipAmount - expectedAmount) > 0.01) {
        setErrorModalMessage(`จำนวนเงินในสลิป (${slipAmount.toFixed(2)} ฿) ไม่ตรงกับยอดชำระจริง (${expectedAmount.toFixed(2)} ฿)`);
        setShowErrorModal(true);
        e.target.value = "";
        return;
      }

      // Successful verification!
      setVerifiedSlipData(result.data);
      setSlipVerified(true);
      setShowSuccessModal(true);
    } catch (err) {
      setErrorModalMessage("เกิดข้อผิดพลาดในการเชื่อมต่อตรวจสอบสลิป");
      setShowErrorModal(true);
      e.target.value = "";
    } finally {
      setVerifyingSlip(false);
    }
  };

  if (initializingOrder) {
    return (
      <div className="bg-[#fdfbff] text-[#1b1b1f] font-body-md antialiased min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <span className="w-12 h-12 border-4 border-t-transparent border-[#2563EB] rounded-full animate-spin" />
          <span className="text-[14px] font-medium text-[#64748B]">กำลังตรวจสอบความพร้อมของระบบและล็อกคีย์สินค้าชั่วคราว...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#fdfbff] text-[#1b1b1f] font-body-md antialiased min-h-screen">
      <main className="max-w-container-max mx-auto px-margin-desktop pt-32 pb-section-gap">
        {/* Breadcrumb */}
        <nav aria-label="เส้นทางนำทาง" className="flex items-center text-xs text-on-surface-variant mb-8 uppercase font-label-sm font-bold tracking-wider">
          <Link href="/" className="hover:text-accent-electric transition-colors">หน้าหลัก</Link>
          <span aria-hidden="true" className="material-symbols-outlined text-[16px] mx-1">chevron_right</span>
          <Link href="/cart" className="hover:text-accent-electric transition-colors">ตะกร้าสินค้า</Link>
          <span aria-hidden="true" className="material-symbols-outlined text-[16px] mx-1">chevron_right</span>
          <span aria-current="page" className="text-on-surface">ชำระเงิน</span>
        </nav>

        {/* Main 3-Column Layout */}
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* ══ LEFT: QR Code Scanner (38%) ══ */}
          <div className="w-full lg:w-[38%] flex-shrink-0 sticky top-32">
            <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-sm flex flex-col items-center">
              <div className="mb-4 text-center">
                <h2 className="text-[18px] font-bold text-[#1E293B]">สแกน QR Code เพื่อชำระเงิน</h2>
                <p className="text-[12px] text-[#64748B]">Thai QR Payment</p>
              </div>

              {/* QR Image Container */}
              <div className="w-[200px] h-[200px] bg-white flex items-center justify-center mb-4 border border-[#E2E8F0] p-2 rounded-xl overflow-hidden shadow-inner">
                <img
                  src={total > 0 ? `https://promptpay.io/0653296340/${total.toFixed(2)}.png` : `https://promptpay.io/0653296340.png`}
                  alt="PromptPay QR Code"
                  className="w-full h-full object-contain"
                />
              </div>

              {/* QR Details */}
              <div className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-4 mb-4 text-[13px] text-[#475569] space-y-2">
                <div className="flex justify-between">
                  <span>บัญชีพร้อมเพย์:</span>
                  <strong className="text-[#1E293B] font-bold">065-329-6340</strong>
                </div>
                <div className="flex justify-between">
                  <span>ชื่อบัญชี:</span>
                  <strong className="text-[#1E293B] font-bold">นายรัฐภูมิ</strong>
                </div>
                <div className="flex justify-between">
                  <span>ยอดเงินที่ต้องโอน:</span>
                  <strong className="text-[#2563EB] font-bold text-[14px]">{formatBaht(total)}</strong>
                </div>
              </div>

              {/* Timer Badge */}
              <div className="bg-[#EFF6FF] border border-[#BFDBFE] text-[#1E40AF] rounded-full px-4 py-1.5 flex items-center gap-1.5 shadow-sm text-[12px] font-medium">
                <span className="material-symbols-outlined text-[16px] animate-spin-slow">timer</span>
                {timeLeft > 0 ? (
                  <span>QR Code หมดอายุใน: <strong className="font-bold">{formatTime(timeLeft)}</strong></span>
                ) : (
                  <span className="text-red-500 font-bold">QR Code หมดอายุแล้ว กรุณาสร้างใหม่</span>
                )}
              </div>
            </div>
          </div>

          {/* ══ MIDDLE: Verification and Action Buttons (35%) ══ */}
          <section className="flex-grow w-full lg:w-[35%] flex flex-col space-y-6" aria-label="ยืนยันการชำระเงิน">
            <div>
              <span className="font-label-sm text-accent-electric text-xs uppercase font-bold tracking-wider mb-2 block">
                PAYMENT VERIFICATION
              </span>
              <h1 className="font-display-lg text-headline-lg font-bold text-on-surface leading-tight mb-3">
                ยืนยันการชำระเงิน
              </h1>
              <p className="text-[13px] text-[#64748B] mb-2 leading-relaxed">
                โปรดแสกน QR Code ด้านซ้ายมือเพื่อทำการชำระเงิน จากนั้นอัปโหลดสลิปเพื่อทำการตรวจสอบความถูกต้องและดำเนินการสร้างคำสั่งซื้อ
              </p>
            </div>

            <hr className="border-outline-variant/30" />

            {/* Upload Slip Area */}
            <div>
              <p className="text-[13px] font-bold text-[#475569] uppercase tracking-wide mb-3 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[18px] text-[#2563EB]">upload_file</span>
                อัปโหลดสลิปโอนเงิน
              </p>

              {verifyingSlip ? (
                <div className="border border-[#E2E8F0] rounded-2xl p-8 bg-[#F8FAFC] flex flex-col items-center justify-center text-center">
                  <span className="w-10 h-10 border-4 border-t-transparent border-[#2563EB] rounded-full animate-spin mb-3" />
                  <span className="text-[13px] font-medium text-[#64748B]">กำลังเชื่อมต่อระบบ SlipOk เพื่อตรวจสอบสลิป...</span>
                </div>
              ) : slipVerified && verifiedSlipData ? (
                <div className="border border-emerald-200 rounded-2xl p-5 bg-emerald-50/50 flex flex-col space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 flex-shrink-0 shadow-sm">
                      <span className="material-symbols-outlined text-[20px] font-bold">check</span>
                    </div>
                    <div>
                      <span className="text-[14px] font-bold text-emerald-800 block">ตรวจสอบสลิปสำเร็จแล้ว</span>
                      <span className="text-[11px] text-emerald-600">เงินเข้าบัญชี นายรัฐภูมิ เรียบร้อยแล้ว</span>
                    </div>
                  </div>

                  <div className="bg-white border border-emerald-100 rounded-xl p-4 text-[13px] text-[#475569] space-y-2">
                    <div className="flex justify-between">
                      <span>จำนวนเงินโอน:</span>
                      <strong className="text-[#1E293B] font-bold">{verifiedSlipData.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })} ฿</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>ชื่อผู้โอน:</span>
                      <strong className="text-[#1E293B] font-bold">{verifiedSlipData.senderName}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>ธนาคารผู้โอน:</span>
                      <strong className="text-[#1E293B] font-bold">{verifiedSlipData.sendingBank}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>เวลาโอน:</span>
                      <strong className="text-[#1E293B] font-bold">{verifiedSlipData.dateTime}</strong>
                    </div>
                  </div>

                  <label className="text-[12px] font-bold text-[#2563EB] hover:text-[#1D4ED8] cursor-pointer text-right block">
                    อัปโหลดสลิปใหม่
                    <input type="file" accept="image/*" className="hidden" onChange={handleSlipUpload} />
                  </label>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center border-2 border-dashed border-[#2563EB]/40 rounded-2xl p-8 bg-white hover:bg-[#EFF6FF] cursor-pointer transition-all group shadow-sm hover:shadow-md">
                  <span className="material-symbols-outlined text-[#2563EB] text-[32px] mb-2 group-hover:scale-110 transition-transform">cloud_upload</span>
                  <span className="text-[13px] font-bold text-[#1E293B]">อัปโหลดรูปภาพสลิปโอนเงิน</span>
                  <span className="text-[11px] text-[#64748B] mt-1">รองรับไฟล์ภาพ JPG, PNG, WEBP</span>
                  <input type="file" accept="image/*" className="hidden" onChange={handleSlipUpload} />
                </label>
              )}
            </div>

            {submitError && (
              <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-3 text-[13px] font-medium">
                {submitError}
              </div>
            )}

            <hr className="border-outline-variant/30" />

            {/* Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 w-full">
              <button
                type="button"
                onClick={handleCancelPayment}
                className="w-full bg-white border border-[#E2E8F0] text-[#475569] hover:bg-[#F8FAFC] py-3.5 rounded-xl font-bold text-[14px] transition-colors flex items-center justify-center gap-2 whitespace-nowrap order-2 sm:order-1"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
                ยกเลิกการชำระ
              </button>
              <button
                onClick={handleConfirm}
                disabled={validLines.length === 0 || submitting || !slipVerified}
                className="w-full bg-[#2563EB] hover:bg-[#1D4ED8] disabled:bg-[#94A3B8] disabled:cursor-not-allowed text-white py-3.5 rounded-xl font-bold text-[14px] transition-colors flex items-center justify-center gap-2 shadow-sm whitespace-nowrap order-1 sm:order-2"
              >
                {submitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin" />
                    กำลังตรวจสอบ...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[18px]">lock</span>
                    ยืนยันการชำระเงิน
                  </>
                )}
              </button>
            </div>

            <div className="text-center text-[12px] text-on-surface-variant pt-2 flex items-center justify-center gap-1.5">
              <span className="material-symbols-outlined text-[14px] text-accent-electric">verified_user</span>
              รับประกันความปลอดภัยของข้อมูลธุรกรรม
            </div>
          </section>

          {/* ══ RIGHT: Sidebar Summary (280px) ══ */}
          <aside className="w-full lg:w-[280px] flex-shrink-0">
            <div className="sticky top-32 space-y-4">
              <div className="bg-[#F8FAFC] rounded-2xl p-6 border border-[#E2E8F0] shadow-sm">
                <h3 className="font-bold text-[#1E293B] text-[15px] mb-4">สรุปรายการคำสั่งซื้อ</h3>

                {validLines.length === 0 ? (
                  <p className="text-[13px] text-[#64748B] italic">ไม่มีรายการสินค้า</p>
                ) : (
                  <div className="space-y-3 mb-4 max-h-[240px] overflow-y-auto pr-1">
                    {validLines.map((line) => (
                      <div key={line.lineId} className="flex gap-2 items-center">
                        <div className="w-9 h-9 bg-[#0F172A] rounded-lg flex-shrink-0 relative overflow-hidden">
                          <Image
                            src={getProductAsset(line.imageKey) || "https://placehold.co/36x36/0F172A/fff?text=P"}
                            alt={line.name}
                            fill
                            sizes="36px"
                            className="object-contain p-0.5"
                          />
                        </div>
                        <div className="flex-grow min-w-0">
                          <p className="text-[11px] font-bold text-[#1E293B] line-clamp-1">{line.name}</p>
                          <p className="text-[10px] text-[#64748B]">×{line.quantity}</p>
                        </div>
                        <span className="text-[12px] font-bold text-[#1E293B] flex-shrink-0">{formatBaht(line.unitPrice * line.quantity)}</span>
                      </div>
                    ))}
                  </div>
                )}

                <hr className="border-[#E2E8F0] mb-4" />

                <div className="space-y-2 mb-4 text-[13px]">
                  <div className="flex justify-between">
                    <span className="text-[#64748B]">ราคารวม:</span>
                    <span className="text-[#1E293B] font-medium">{formatBaht(subtotal)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-emerald-600 font-medium">
                      <span>ส่วนลด:</span>
                      <span>-{formatBaht(discount)}</span>
                    </div>
                  )}
                </div>

                <hr className="border-[#E2E8F0] mb-4" />

                <div className="flex justify-between items-end mb-1">
                  <span className="font-bold text-[#1E293B] text-[14px]">ยอดทั้งหมด</span>
                  <span className="font-bold text-[#2563EB] text-[22px] leading-none">{formatBaht(total)}</span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>

      {/* Success Modal */}
      {showSuccessModal && verifiedSlipData && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl p-6 md:p-8 w-full max-w-[450px] shadow-2xl border border-emerald-100 flex flex-col items-center">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4 text-emerald-600">
              <span className="material-symbols-outlined text-[36px]">check_circle</span>
            </div>
            <h3 className="text-[20px] font-bold text-[#1E293B] mb-2">ตรวจสอบสลิปสำเร็จ</h3>
            <p className="text-[13px] text-emerald-600 font-medium mb-6">ยอดเงินตรงตามสลิปโอนเงินเรียบร้อยแล้ว</p>

            <div className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-4 space-y-3 mb-6 text-[13px] text-[#475569]">
              <div className="flex justify-between">
                <span className="font-medium">จำนวนเงินโอน:</span>
                <strong className="text-[#1E293B] font-bold">{verifiedSlipData.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })} ฿</strong>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">ชื่อผู้โอน:</span>
                <strong className="text-[#1E293B] font-bold">{verifiedSlipData.senderName}</strong>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">วันเวลาที่โอน:</span>
                <strong className="text-[#1E293B] font-bold">{verifiedSlipData.dateTime}</strong>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">ธนาคารผู้โอน:</span>
                <strong className="text-[#1E293B] font-bold">{verifiedSlipData.sendingBank}</strong>
              </div>
            </div>

            <button
              onClick={() => setShowSuccessModal(false)}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl text-[14px] transition-colors shadow-sm"
            >
              ตกลง
            </button>
          </div>
        </div>
      )}

      {/* Error Modal */}
      {showErrorModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl p-6 md:p-8 w-full max-w-[450px] shadow-2xl border border-red-100 flex flex-col items-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4 text-red-600">
              <span className="material-symbols-outlined text-[36px]">error</span>
            </div>
            <h3 className="text-[20px] font-bold text-[#1E293B] mb-2">ตรวจสอบสลิปผิดพลาด</h3>
            <p className="text-[13px] text-red-600 font-medium mb-6">ไม่สามารถยืนยันการชำระเงินได้</p>

            <p className="text-center text-[14px] text-[#475569] mb-8 leading-relaxed px-2">
              {errorModalMessage}
            </p>

            <button
              onClick={() => setShowErrorModal(false)}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl text-[14px] transition-colors shadow-sm"
            >
              ตกลง
            </button>
          </div>
        </div>
      )}

      {/* Expiration Modal */}
      {showExpiredModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl p-6 md:p-8 w-full max-w-[450px] shadow-2xl border border-red-100 flex flex-col items-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4 text-red-600">
              <span className="material-symbols-outlined text-[36px]">timer_off</span>
            </div>
            <h3 className="text-[20px] font-bold text-[#1E293B] mb-2">เวลาในการชำระเงินหมดลงแล้ว</h3>
            <p className="text-[13px] text-red-600 font-medium mb-6">คีย์ที่ถูกล็อกไว้ได้รับการปล่อยคืนสู่คลังเรียบร้อยแล้ว</p>

            <p className="text-center text-[14px] text-[#475569] mb-8 leading-relaxed px-2">
              เพื่อความปลอดภัยในการซื้อขาย คีย์ที่สำรองไว้จะถูกล็อกได้เพียง 10 นาทีเท่านั้น กรุณาทำรายการใหม่อีกครั้ง
            </p>

            <button
              onClick={handleExpiredOk}
              className="w-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold py-3 rounded-xl text-[14px] transition-colors shadow-sm"
            >
              ตกลง
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
