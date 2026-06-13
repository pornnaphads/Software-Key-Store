"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";

import { useCart } from "@/features/cart/CartProvider";
import { getProductAsset } from "@/lib/product-assets";

function formatBaht(value: number): string {
  return `฿ ${value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export default function CheckoutPage() {
  const { lines, clearCart } = useCart();
  const router = useRouter();

  const [buyNowLine, setBuyNowLine] = useState<any>(null);
  const [isBuyNow, setIsBuyNow] = useState(false);
  const [activeImageKey, setActiveImageKey] = useState<string | null>(null);
  const [selectedItemIds, setSelectedItemIds] = useState<string[] | null>(null);

  // Promo code
  const [promoCode, setPromoCode] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [promoError, setPromoError] = useState("");

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
      const itemsParam = searchParams.get("items");
      if (itemsParam) {
        setSelectedItemIds(itemsParam.split(","));
      }
    }
  }, []);

  const checkoutLines = isBuyNow && buyNowLine ? [buyNowLine] : lines;
  const validLines = checkoutLines.filter(l => l.stock > 0 && l.quantity > 0 && (selectedItemIds === null || selectedItemIds.includes(l.lineId)));
  const subtotal = validLines.reduce((sum, l) => sum + l.unitPrice * l.quantity, 0);
  const discount = promoApplied ? promoDiscount : 0;
  const total = Math.max(0, subtotal - discount);

  const defaultImageKey = validLines[0]?.imageKey || "";
  const currentImageKey = activeImageKey || defaultImageKey;

  const handleApplyPromo = () => {
    setPromoError("");
    if (!promoCode.trim()) { setPromoError("กรุณาระบุรหัสส่วนลด"); return; }
    const code = promoCode.toUpperCase();
    if (code === "SAVE10") { setPromoDiscount(subtotal * 0.1); setPromoApplied(true); }
    else if (code === "SAVE100") { setPromoDiscount(100); setPromoApplied(true); }
    else setPromoError("รหัสส่วนลดไม่ถูกต้องหรือหมดอายุแล้ว");
  };

  const handleRemovePromo = () => {
    setPromoCode(""); setPromoApplied(false); setPromoDiscount(0); setPromoError("");
  };

  const handleProceedToPayment = () => {
    // Store promo info and proceed to payment page
    if (typeof window !== "undefined") {
      sessionStorage.setItem("checkout_promo", JSON.stringify({ code: promoApplied ? promoCode : null, discount }));
    }
    const searchParams = new URLSearchParams(window.location.search);
    const buyNow = searchParams.get("buyNow");
    const items = searchParams.get("items");

    const newParams = new URLSearchParams();
    if (buyNow === "1") {
      newParams.set("buyNow", "1");
    }
    if (items) {
      newParams.set("items", items);
    }

    const paramStr = newParams.toString();
    router.push(paramStr ? `/payment?${paramStr}` : "/payment");
  };

  return (
    <div className="bg-[#fdfbff] text-[#1b1b1f] font-body-md antialiased min-h-screen">
      <main className="max-w-container-max mx-auto px-margin-desktop pt-32 pb-section-gap">

        {/* Breadcrumb */}
        <nav aria-label="เส้นทางนำทาง" className="flex items-center text-xs text-on-surface-variant mb-8 uppercase font-label-sm font-bold tracking-wider">
          <Link href="/" className="hover:text-accent-electric transition-colors">หน้าหลัก</Link>
          <span aria-hidden="true" className="material-symbols-outlined text-[16px] mx-1">chevron_right</span>
          <Link href="/cart" className="hover:text-accent-electric transition-colors">ตะกร้าสินค้า</Link>
          <span aria-hidden="true" className="material-symbols-outlined text-[16px] mx-1">chevron_right</span>
          <span aria-current="page" className="text-on-surface">ยืนยันคำสั่งซื้อ</span>
        </nav>

        {/* Main 3-Column Layout — same as product detail */}
        <div className="flex flex-col lg:flex-row gap-8 items-start">

          {/* ══ LEFT: Product Images (38%) ══ */}
          <div className="w-full lg:w-[38%] flex-shrink-0 sticky top-32">
            <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden shadow-sm">

              {/* Main image */}
              {validLines.length > 0 ? (
                <div className="aspect-square bg-[#0F172A] flex items-center justify-center relative">
                  <Image
                    src={getProductAsset(currentImageKey) || "https://placehold.co/480x480/0F172A/ffffff?text=Product"}
                    alt="Product Image"
                    fill
                    sizes="(max-width:1024px) 100vw, 480px"
                    className="object-contain p-8"
                    priority
                  />
                  {validLines.length > 1 && (
                    <span className="absolute top-4 right-4 bg-[#2563EB] text-white text-[12px] font-bold px-3 py-1 rounded-full">
                      +{validLines.length - 1} รายการ
                    </span>
                  )}
                </div>
              ) : (
                <div className="aspect-square bg-[#F1F5F9] flex flex-col items-center justify-center gap-3">
                  <span className="material-symbols-outlined text-[64px] text-[#CBD5E1]">shopping_cart</span>
                  <span className="text-[#94A3B8] text-[14px]">ไม่มีสินค้าในตะกร้า</span>
                </div>
              )}

              {/* Thumbnail strip — when multiple products */}
              {validLines.length > 1 && (
                <div className="flex gap-2 p-3 border-t border-[#E2E8F0] flex-wrap">
                  {validLines.map((line) => (
                    <div
                      key={line.lineId}
                      onClick={() => setActiveImageKey(line.imageKey)}
                      className={`w-14 h-14 rounded-lg bg-[#0F172A] overflow-hidden flex-shrink-0 relative border-2 cursor-pointer transition-colors ${line.imageKey === currentImageKey ? "border-[#2563EB]" : "border-transparent hover:border-[#CBD5E1]"}`}
                    >
                      <Image
                        src={getProductAsset(line.imageKey) || "https://placehold.co/56x56/0F172A/ffffff?text=P"}
                        alt={line.name}
                        fill
                        sizes="56px"
                        className="object-contain p-1"
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Trust badges */}
              <div className="grid grid-cols-3 gap-0 border-t border-[#E2E8F0]">
                {[
                  { icon: "verified", label: "ของแท้ 100%", sub: "คืนเงินถ้าไม่ได้" },
                  { icon: "bolt", label: "ส่งทันที", sub: "ดิจิทัลอัตโนมัติ" },
                  { icon: "support_agent", label: "24/7", sub: "พร้อมซัพพอร์ต" },
                ].map((badge, i) => (
                  <div key={i} className={`flex flex-col items-center py-4 px-2 text-center ${i < 2 ? "border-r border-[#E2E8F0]" : ""}`}>
                    <span
                      className="material-symbols-outlined text-[#2563EB] text-[22px] mb-1"
                      style={{ fontVariationSettings: '"FILL" 1' }}
                    >
                      {badge.icon}
                    </span>
                    <span className="text-[11px] font-bold text-[#1E293B]">{badge.label}</span>
                    <span className="text-[10px] text-[#64748B]">{badge.sub}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ══ MIDDLE: Order Details (35%) ══ */}
          <section className="flex-grow w-full lg:w-[35%] flex flex-col space-y-6" aria-label="รายละเอียดคำสั่งซื้อ">

            {/* Header */}
            <div>
              <h1 className="font-display-lg text-headline-lg font-bold text-on-surface leading-tight mb-3">
                ยืนยันคำสั่งซื้อ
              </h1>
              <div className="flex items-center gap-1.5 text-green-600 text-xs font-bold bg-green-50 w-max px-2.5 py-1 rounded-full">
                <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: '"FILL" 1' }}>check_circle</span>
                พร้อมดำเนินการสั่งซื้อ
              </div>
            </div>

            <hr className="border-outline-variant/30" />

            {/* Product list — all items */}
            <div>
              <p className="text-[13px] font-bold text-[#475569] uppercase tracking-wide mb-4">
                รายการสินค้า ({validLines.length} รายการ)
              </p>

              {validLines.length === 0 ? (
                <div className="text-center py-12">
                  <span className="material-symbols-outlined text-[48px] text-[#CBD5E1] block mb-3">shopping_cart</span>
                  <p className="text-[#64748B] text-[14px]">ไม่มีสินค้าในตะกร้า</p>
                  <Link href="/" className="text-[#2563EB] font-bold text-[13px] hover:underline mt-2 inline-block">เลือกซื้อสินค้า</Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {validLines.map(line => (
                    <div key={line.lineId} className="flex gap-4 items-start pb-4 border-b border-[#F1F5F9] last:border-0 last:pb-0">
                      {/* Product image */}
                      <div
                        onClick={() => setActiveImageKey(line.imageKey)}
                        className={`w-[80px] h-[80px] bg-[#0F172A] rounded-xl overflow-hidden flex-shrink-0 relative cursor-pointer border-2 transition-colors ${line.imageKey === currentImageKey ? "border-[#2563EB]" : "border-transparent hover:border-[#CBD5E1]"}`}
                      >
                        <Image
                          src={getProductAsset(line.imageKey) || "https://placehold.co/80x80/0F172A/ffffff?text=App"}
                          alt={line.name}
                          fill
                          sizes="80px"
                          className="object-contain p-1.5"
                        />
                      </div>
                      {/* Info */}
                      <div className="flex-grow min-w-0">
                        <p className="font-bold text-[#1E293B] text-[14px] leading-snug mb-1">{line.name}</p>
                        {line.options && line.options.length > 0 && (
                          <p className="text-[12px] text-[#64748B] mb-1.5">
                            {line.options.map((o: any) => o.label).join(", ")}
                          </p>
                        )}
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-[#2563EB] bg-[#EFF6FF] px-2 py-0.5 rounded-full font-bold">LIFETIME</span>
                          <span className="text-[12px] text-[#64748B]">จำนวน {line.quantity} ชิ้น</span>
                        </div>
                      </div>
                      {/* Price */}
                      <div className="flex-shrink-0 text-right">
                        <span className="font-bold text-[#1E293B] text-[15px] block">{formatBaht(line.unitPrice * line.quantity)}</span>
                        {line.quantity > 1 && (
                          <span className="text-[11px] text-[#94A3B8]">{formatBaht(line.unitPrice)}/ชิ้น</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <hr className="border-outline-variant/30" />

            {/* Price breakdown */}
            <div className="flex flex-col mb-6">
              <div className="flex justify-between text-[13px] mb-2">
                <span className="text-[#64748B]">ราคารวม</span>
                <span className="text-[#1E293B] font-medium">{formatBaht(subtotal)}</span>
              </div>
              {promoApplied && (
                <div className="flex justify-between text-[13px] mb-2">
                  <span className="text-emerald-600 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[13px]">local_offer</span>
                    ส่วนลด ({promoCode.toUpperCase()})
                  </span>
                  <span className="text-emerald-600 font-bold">-{formatBaht(discount)}</span>
                </div>
              )}
              <div className="flex items-end justify-between pt-3 border-t border-[#E2E8F0] mt-2">
                <span className="font-bold text-[#1E293B] text-[15px]">ยอดชำระสุทธิ</span>
                <span className="font-bold text-[#2563EB] text-[28px] leading-none">{formatBaht(total)}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 w-full">
              <Link
                href="/cart"
                className="w-full bg-white border border-[#E2E8F0] text-[#475569] hover:bg-[#F8FAFC] py-3.5 rounded-xl font-bold text-[14px] transition-colors flex items-center justify-center gap-2 whitespace-nowrap order-2 sm:order-1"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
                ยกเลิกการชำระ
              </Link>
              <button
                onClick={handleProceedToPayment}
                disabled={validLines.length === 0}
                className="w-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white py-3.5 rounded-xl font-bold text-[14px] transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap order-1 sm:order-2"
              >
                <span className="material-symbols-outlined text-[18px]">bolt</span>
                ดำเนินการชำระเงิน
              </button>
            </div>

            <div className="text-center text-[12px] text-on-surface-variant pt-2 flex items-center justify-center gap-1.5">
              <span className="material-symbols-outlined text-[14px] text-accent-electric">verified_user</span>
              รับประกันของแท้ | คืนเงิน 100% หากติดตั้งไม่ได้
            </div>
          </section>

          {/* ══ RIGHT: Sidebar (same as product detail) ══ */}
          <aside className="w-full lg:w-[280px] flex-shrink-0">
            <div className="sticky top-32 space-y-4">

              {/* Promo Code Card */}
              <div className="bg-[#F8FAFC] rounded-xl p-5 border border-[#E2E8F0]">
                <h3 className="font-bold text-[#1E293B] text-[14px] mb-3 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-[#2563EB]">local_offer</span>
                  รหัสส่วนลด
                </h3>
                {promoApplied ? (
                  <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
                    <div className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-emerald-500 text-[14px]" style={{ fontVariationSettings: '"FILL" 1' }}>check_circle</span>
                      <span className="text-[12px] font-bold text-emerald-700">{promoCode.toUpperCase()}</span>
                      <span className="text-[11px] text-emerald-600">-{formatBaht(promoDiscount)}</span>
                    </div>
                    <button onClick={handleRemovePromo} className="text-[11px] text-[#64748B] hover:text-red-500 font-medium">ยกเลิก</button>
                  </div>
                ) : (
                  <>
                    <div className="flex gap-2 w-full">
                      <input
                        type="text"
                        value={promoCode}
                        onChange={e => { setPromoCode(e.target.value); setPromoError(""); }}
                        onKeyDown={e => e.key === "Enter" && handleApplyPromo()}
                        placeholder="ใส่รหัสส่วนลด"
                        className="min-w-0 flex-grow border border-[#E2E8F0] rounded-lg px-3 py-2 text-[12px] text-[#1E293B] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:border-[#2563EB] bg-white placeholder:text-[#94A3B8]"
                      />
                      <button
                        onClick={handleApplyPromo}
                        className="flex-shrink-0 bg-[#1E293B] hover:bg-[#0F172A] text-white px-4 py-2 rounded-lg text-[12px] font-bold transition-colors"
                      >
                        ใช้
                      </button>
                    </div>
                    {promoError && <p className="text-[11px] text-red-500 mt-1.5">{promoError}</p>}
                  </>
                )}
              </div>

              {/* Gift Card */}
              <div className="bg-[#F8FAFC] rounded-xl p-5 border border-[#E2E8F0]">
                <h3 className="font-bold text-[#1E293B] text-[14px] mb-2">ส่งเป็นของขวัญ</h3>
                <p className="text-[12px] text-[#64748B] mb-3 leading-relaxed">ระบบจะส่งแจ้งเตือนไปที่อีเมลที่ระบุพร้อมข้อความของคุณ</p>
                <label className="flex items-center p-3 border border-[#E2E8F0] rounded-lg bg-white cursor-pointer hover:border-[#CBD5E1] transition-colors">
                  <span className="material-symbols-outlined text-[18px] text-[#64748B]">mail</span>
                  <span className="ml-2 text-[13px] text-[#475569]">ระบุอีเมลผู้รับ</span>
                </label>
              </div>

            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
