"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

import { CartItem } from "@/components/purchase/CartItem";
import { useCart } from "@/features/cart/CartProvider";
import type { ProductSummary } from "@/types/commerce";

async function loadCurrentProducts(): Promise<ProductSummary[]> {
  const response = await fetch("/api/products");
  if (!response.ok) {
    throw new Error("Unable to load products");
  }

  const data = (await response.json()) as { products?: unknown };
  if (!Array.isArray(data.products)) {
    throw new Error("Invalid products response");
  }

  return data.products as ProductSummary[];
}

function formatBaht(value: number): string {
  return `${value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} ฿`;
}

export default function CartPage() {
  const {
    hydrated,
    issues,
    lines,
    reconcile,
    removeItem,
    setQuantity,
  } = useCart();
  const { status } = useSession();
  const reconciliationRequest = useRef<Promise<ProductSummary[]> | null>(null);
  const reconciliationCompleted = useRef(false);
  const [syncMessage, setSyncMessage] = useState("");
  const router = useRouter();

  // Redirect guests to login
  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login?callbackUrl=/cart");
    }
  }, [status, router]);

  // State for selections
  const [selectedLineIds, setSelectedLineIds] = useState<string[]>([]);

  useEffect(() => {
    if (!hydrated) return;
    // Initially select all valid items
    const validIds = lines.filter(l => l.stock > 0).map(l => l.lineId);
    setSelectedLineIds(validIds);
  }, [hydrated, lines.length]); // Re-run when items change

  useEffect(() => {
    if (!hydrated || lines.length === 0 || reconciliationCompleted.current) {
      return;
    }

    reconciliationRequest.current ??= loadCurrentProducts();
    let active = true;

    void reconciliationRequest.current
      .then((products) => {
        if (active && !reconciliationCompleted.current) {
          reconciliationCompleted.current = true;
          reconcile(products);
        }
      })
      .catch(() => {
        if (active && !reconciliationCompleted.current) {
          reconciliationCompleted.current = true;
          setSyncMessage(
            "ยังตรวจสอบราคาและสต็อกล่าสุดไม่ได้ คุณยังแก้ไขตะกร้าได้ตามปกติ",
          );
        }
      });

    return () => {
      active = false;
    };
  }, [hydrated, lines.length, reconcile]);

  // Show loading while session is being determined or user is being redirected
  if (status === "loading" || status === "unauthenticated") {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <p className="animate-pulse text-[#64748B]">กำลังตรวจสอบสิทธิ์การเข้าใช้งาน...</p>
      </div>
    );
  }

  if (!hydrated) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <p className="animate-pulse text-[#64748B]">กำลังโหลดข้อมูลตะกร้าสินค้า...</p>
      </div>
    );
  }

  if (lines.length === 0) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center px-4">
        <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center text-[#CBD5E1] shadow-sm mb-6">
          <span className="material-symbols-outlined text-[48px]">shopping_cart</span>
        </div>
        <h1 className="text-2xl font-bold text-[#1E293B] mb-2">ตะกร้าสินค้าของคุณว่างอยู่</h1>
        <p className="text-[#64748B] mb-8 text-center">เลือกซอฟต์แวร์ที่ต้องการ แล้วกลับมาดำเนินการสั่งซื้อได้ทุกเมื่อ</p>
        <Link href="/" className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white px-8 py-3.5 rounded-xl font-bold transition-colors">
          เลือกซื้อซอฟต์แวร์
        </Link>
      </div>
    );
  }

  const validLines = lines.filter((line) => line.stock > 0 && line.quantity > 0);
  const selectedLines = validLines.filter(line => selectedLineIds.includes(line.lineId));

  const isAllSelected = selectedLines.length === validLines.length && validLines.length > 0;

  const handleToggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedLineIds([]);
    } else {
      setSelectedLineIds(validLines.map(l => l.lineId));
    }
  };

  const handleToggleSelect = (lineId: string) => {
    setSelectedLineIds(prev =>
      prev.includes(lineId) ? prev.filter(id => id !== lineId) : [...prev, lineId]
    );
  };

  const totalAmount = selectedLines.reduce((sum, line) => sum + (line.unitPrice * line.quantity), 0);

  const handleCheckout = () => {
    if (selectedLines.length > 0) {
      const ids = selectedLines.map(l => l.lineId).join(",");
      router.push(`/checkout?items=${encodeURIComponent(ids)}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#fdfbff] text-[#1b1b1f] font-body-md antialiased pb-40">
      <main className="max-w-container-max mx-auto px-margin-desktop pt-24">

        {/* Header */}
        <div className="mb-10">
          <h1 className="text-[28px] font-bold text-[#1E293B] inline-block border-b-4 border-accent-electric pb-2">
            ตะกร้าสินค้าของคุณ
          </h1>
        </div>

        {/* Alerts */}
        {(issues.length > 0 || syncMessage) && (
          <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-xl mb-6 text-[13px]">
            <strong className="block mb-1 font-bold">มีข้อมูลที่ต้องตรวจสอบ</strong>
            {issues.map((issue) => (
              <p key={`${issue.lineId}-${issue.type}`}>• {issue.message}</p>
            ))}
            {syncMessage && <p>• {syncMessage}</p>}
          </div>
        )}

        {/* Table Header (Hidden on Mobile) */}
        <div className="hidden md:flex items-center justify-between px-6 py-3 text-[12px] font-bold text-[#64748B] uppercase tracking-wider border-b border-[#E2E8F0] mb-4">
          <div className="w-[50%] flex items-center gap-6">
            <span className="w-5 text-center">เลือก</span>
            <span>รายการสินค้า</span>
          </div>
          <div className="w-[20%] text-center">จำนวน</div>
          <div className="w-[30%] text-right pr-16">ราคารวม</div>
        </div>

        {/* Item List */}
        <div className="space-y-4 mb-10">
          {lines.map((line) => (
            <CartItem
              issues={issues.filter((issue) => issue.lineId === line.lineId).map((issue) => issue.message)}
              key={line.lineId}
              line={line}
              selected={selectedLineIds.includes(line.lineId)}
              onToggleSelect={() => handleToggleSelect(line.lineId)}
              onQuantityChange={(quantity) => setQuantity(line.lineId, quantity)}
              onRemove={() => removeItem(line.lineId)}
            />
          ))}
        </div>

        {/* Continue Shopping Link */}
        <Link href="/" className="inline-flex items-center text-[#64748B] hover:text-[#2563EB] font-bold text-[14px] transition-colors">
          <span className="material-symbols-outlined text-[18px] mr-1">arrow_back</span>
          ซื้อสินค้าต่อ
        </Link>
      </main>

      {/* Sticky Bottom Checkout Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#E2E8F0] shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-50 p-4 md:p-6">
        <div className="max-w-container-max mx-auto px-margin-desktop flex flex-col md:flex-row items-center justify-between gap-4">

          <div className="flex items-center gap-4">
            <label className="flex items-center cursor-pointer group">
              <input
                type="checkbox"
                checked={isAllSelected}
                onChange={handleToggleSelectAll}
                className="w-5 h-5 text-accent-electric rounded border-[#CBD5E1] focus:ring-accent-electric"
              />
              <span className="ml-3 text-[14px] text-[#475569] group-hover:text-[#1E293B] transition-colors">
                เลือกทั้งหมด ({selectedLines.length})
              </span>
            </label>
          </div>

          <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
            <div className="flex items-center gap-3">
              <span className="text-[14px] text-[#475569]">ยอดรวมสุทธิ:</span>
              <span className="text-[24px] font-bold text-accent-electric leading-none">
                {formatBaht(totalAmount)}
              </span>
            </div>
            <button
              onClick={handleCheckout}
              disabled={selectedLines.length === 0}
              className="bg-[#2563EB] hover:bg-[#1D4ED8] disabled:bg-[#94A3B8] disabled:cursor-not-allowed text-white px-8 py-3.5 rounded-xl font-bold text-[15px] transition-colors shadow-sm"
            >
              ชำระเงิน
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
