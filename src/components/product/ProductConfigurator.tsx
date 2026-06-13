"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

import { OFFICE_OPTIONS } from "@/features/product/product-options";
import {
  clampQuantity,
  getConfiguredTotal,
  getConfiguredUnitPrice,
} from "@/features/product/pricing";
import { createLineId } from "@/features/cart/cart-math";
import type { ProductDetail, ProductOption } from "@/types/commerce";
import { useCart } from "@/features/cart/CartProvider";

const NO_OPTIONS: readonly ProductOption[] = [];

function formatBaht(value: number): string {
  return `฿ ${value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function ProductConfigurator({ product }: { product: ProductDetail }) {
  const availableOptions: readonly ProductOption[] =
    product.category.toLowerCase() === "office" ? OFFICE_OPTIONS : NO_OPTIONS;
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [quantity, setQuantity] = useState(() => clampQuantity(1, product.stock));
  const { addItem } = useCart();
  const { status } = useSession();
  const [isAdding, setIsAdding] = useState(false);
  const router = useRouter();

  const selectedOptions = useMemo<ProductOption[]>(
    () =>
      availableOptions
        .filter((option) => selectedIds.includes(option.id))
        .map((option) => ({ ...option })),
    [availableOptions, selectedIds],
  );
  
  const unitPrice = getConfiguredUnitPrice(product.price, selectedOptions);
  const total = getConfiguredTotal(product.price, selectedOptions, quantity);
  const rating = product.rating ?? 5;

  const toggleOption = (optionId: string) => {
    setSelectedIds((current) =>
      current.includes(optionId)
        ? current.filter((id) => id !== optionId)
        : [...current, optionId],
    );
  };

  const changeQuantity = (nextQuantity: number) => {
    setQuantity(clampQuantity(nextQuantity, product.stock));
  };

  const handleAddToCart = async () => {
    if (product.stock <= 0) return;
    // redirect guests to login
    if (status !== "authenticated") {
      router.push("/login?callbackUrl=" + encodeURIComponent(window.location.pathname));
      return;
    }
    setIsAdding(true);
    // Simulate slight delay for UX
    await new Promise((resolve) => setTimeout(resolve, 300));
    addItem({
      lineId: createLineId(product.id, selectedOptions),
      productId: product.id,
      name: product.name,
      category: product.category,
      imageKey: product.image,
      unitPrice: unitPrice,
      quantity: quantity,
      stock: product.stock,
      options: selectedOptions,
    });
    setIsAdding(false);
    alert("เพิ่มสินค้าลงตะกร้าแล้ว!");
  };

  const handleBuyNow = () => {
    if (product.stock <= 0) return;
    // redirect guests to login
    if (status !== "authenticated") {
      router.push("/login?callbackUrl=" + encodeURIComponent(window.location.pathname));
      return;
    }
    const buyNowLine = {
      lineId: createLineId(product.id, selectedOptions),
      productId: product.id,
      name: product.name,
      category: product.category,
      imageKey: product.image,
      unitPrice: unitPrice,
      quantity: quantity,
      stock: product.stock,
      options: selectedOptions,
    };
    if (typeof window !== "undefined") {
      sessionStorage.setItem("buy_now_item", JSON.stringify(buyNowLine));
    }
    router.push("/checkout?buyNow=1");
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 w-full">
      {/* Middle Column: Details & Configurator */}
      <section className="flex-grow flex flex-col space-y-6" aria-label="ข้อมูลสินค้า">
        {/* Header */}
        <div>
          <span className="font-label-sm text-accent-electric text-xs uppercase font-bold tracking-wider mb-2 block">
            {product.category} SOFTWARE
          </span>
          <h1 className="font-display-lg text-headline-lg font-bold text-on-surface leading-tight mb-3">
            {product.name}
          </h1>
          <div className="flex items-center gap-2 mb-4">
            <div className="flex text-amber-400 text-[18px]">
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  className="material-symbols-outlined"
                  style={{ fontVariationSettings: star <= Math.round(rating) ? '"FILL" 1' : '"FILL" 0' }}
                >
                  star
                </span>
              ))}
            </div>
            <span className="text-sm text-on-surface-variant">({product.reviewCount ?? 120} รีวิว)</span>
          </div>
          <p className="text-sm text-on-surface-variant leading-relaxed mb-6">
            {product.description || "ซอฟต์แวร์ประสิทธิภาพสูงสุด เพื่อยกระดับการทำงานของคุณให้สะดวกและปลอดภัยยิ่งขึ้น ใช้งานถาวร ไม่มีรายปี"}
          </p>

          <div className="flex flex-col mb-6">
            <div className="flex items-end gap-3 mb-1">
              <span className="font-display-lg text-4xl font-bold text-on-surface">
                {formatBaht(product.price)}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-green-600 text-xs font-bold bg-green-50 w-max px-2.5 py-1 rounded-full mt-2">
              <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: '"FILL" 1' }}>check_circle</span>
              มีสินค้า พร้อมจัดส่ง
            </div>
          </div>
        </div>

        <hr className="border-outline-variant/30" />

        {/* Options */}
        {availableOptions.length > 0 && (
          <fieldset className="space-y-4">
            <legend className="font-title-md font-bold text-on-surface text-[15px] mb-1">เลือกโปรแกรมเสริม</legend>
            <p className="text-xs text-on-surface-variant mb-4">สถานะ: เพิ่มได้มากกว่า 1 รายการ</p>
            <div className="space-y-3">
              {availableOptions.map((option) => {
                const selected = selectedIds.includes(option.id);
                // Assign dummy icons based on label
                let iconUrl = "https://placehold.co/24x24/E2E8F0/1E293B?text=App";
                if (option.label.includes("Word")) iconUrl = "https://lh3.googleusercontent.com/aida-public/AB6AXuCRxpEfuq11_vYbapBgipuLc59XKXurRyeZI4Ig01WowvhMcyd6OHXV4iwTSQ6J6w8lwdq9uW7Sj9yc0n2jDuCRmwzVhp7QLJP3bxsfw6eCb-8Mr26hLmO-TEoJ_LSOizV0tpDRxKqgsY89LCK4WqIacLhAV97s7leoH-h8UVMBuoKcWDtssAeg8sHcSzAputpW_I_459wM-C5YYd-1q7jz9nyyGRY5J-rxxUXRVyAfrDWRbRbb6gV7SHAXkdjrBNSLLSqXvJg-_Ok"; // Fake icon
                if (option.label.includes("Excel")) iconUrl = "https://lh3.googleusercontent.com/aida-public/AB6AXuClJ7vlZFuvja_Xqng18bp6TFUVektyA6-PVQb6W-kRcrr2moYwCcBZIfZfSqXniLPUjzTyWM6ntzNvW81qTUd1MkYvkyqp5_pdlzirzBtGoaoRHk_zFMPtOMcKPcAP_5PtpRTscYtmTETD-31w4OOzGBPEAEPayB3fcISBeZM-S_mrhvuJeYurCHqsJSpgxYhnWtUEKLLNJdPq4Z60eHHNXFdEeQTEH_3eUNXLJspjFhP5WFfv4iJXE2LR0FHLaUP81l3lp84xpBA";
                if (option.label.includes("PowerPoint")) iconUrl = "https://lh3.googleusercontent.com/aida-public/AB6AXuBkZSo6HtfjFyvqzZU7FFrI0udlkwoB_hbWz0-noFEHRyyEJNAuwVc6kP4yl7d4gzZ2XNvmPEle_O9_DHm-8UgQJhsBxWLo5MOlgX5UopuK3XSkTLzLcVga874_nh3qcVSqI3FOQyLJJUJjHakcl5_9TYQB9QcXAu7wmqqwN85x4oivHQiWNljb0-Lsr9I5UR0mGA-TNQlLFbNe2gsKHfZ67ysZ368BOmw3GwcHzCiOtv1GctQGpQSyp_EqTWeP13BGHa4AVvBO9Yc";

                return (
                  <label
                    key={option.id}
                    className={`flex items-center p-4 border rounded-xl cursor-pointer transition-all ${
                      selected ? "border-accent-electric bg-accent-electric/5" : "border-[#E2E8F0] hover:border-[#CBD5E1]"
                    }`}
                  >
                    <input
                      type="checkbox"
                      className="w-4 h-4 text-accent-electric rounded border-gray-300 focus:ring-accent-electric"
                      checked={selected}
                      onChange={() => toggleOption(option.id)}
                    />
                    <div className="ml-4 w-8 h-8 flex-shrink-0 flex items-center justify-center">
                      <Image src={iconUrl} alt={option.label} width={24} height={24} className="object-contain" unoptimized />
                    </div>
                    <div className="ml-3 flex-grow flex flex-col">
                      <span className="font-bold text-on-surface text-[14px]">{option.label}</span>
                      <span className="text-[11px] text-on-surface-variant">อัปเดตอัตโนมัติตลอดการใช้งาน</span>
                    </div>
                    <div className="font-bold text-on-surface text-[14px]">
                      {formatBaht(option.price)}
                    </div>
                  </label>
                );
              })}
            </div>
          </fieldset>
        )}

        {/* Quantity */}
        <div className="flex items-center gap-4 py-4">
          <div className="flex-grow flex flex-col">
            <span className="text-[13px] text-on-surface-variant">จำนวนที่ต้องการซื้อ</span>
            <span className="text-[11px] text-on-surface-variant/70">(1 PC / 1 User)</span>
          </div>
          <div className="flex items-center border border-[#E2E8F0] rounded-lg overflow-hidden h-10 w-32">
            <button
              type="button"
              className="w-10 h-full flex items-center justify-center text-on-surface-variant hover:bg-[#F1F5F9] transition-colors disabled:opacity-50"
              onClick={() => changeQuantity(quantity - 1)}
              disabled={quantity <= 1 || product.stock <= 0}
            >
              <span className="material-symbols-outlined text-[16px]">remove</span>
            </button>
            <input
              type="number"
              className="flex-grow w-full h-full text-center border-none focus:ring-0 text-[14px] font-bold text-on-surface p-0 outline-none"
              value={quantity}
              readOnly
            />
            <button
              type="button"
              className="w-10 h-full flex items-center justify-center text-on-surface-variant hover:bg-[#F1F5F9] transition-colors disabled:opacity-50"
              onClick={() => changeQuantity(quantity + 1)}
              disabled={product.stock <= 0 || quantity >= product.stock}
            >
              <span className="material-symbols-outlined text-[16px]">add</span>
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            className="flex-1 bg-[#2563EB] hover:bg-[#1D4ED8] text-white py-3.5 rounded-xl font-bold text-[14px] transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
            disabled={product.stock <= 0}
            onClick={handleBuyNow}
          >
            <span className="material-symbols-outlined text-[18px]">bolt</span>
            ซื้อเลย
          </button>
          <button
            className="flex-1 bg-white hover:bg-[#F8FAFC] border border-[#2563EB] text-[#2563EB] py-3.5 rounded-xl font-bold text-[14px] transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            disabled={product.stock <= 0 || isAdding}
            onClick={handleAddToCart}
          >
            <span className="material-symbols-outlined text-[18px]">shopping_cart</span>
            {isAdding ? "กำลังเพิ่ม..." : "เพิ่มลงตะกร้า"}
          </button>
        </div>
        
        <div className="text-center text-[12px] text-on-surface-variant pt-2 flex items-center justify-center gap-1.5">
          <span className="material-symbols-outlined text-[14px] text-accent-electric">verified_user</span>
          รับประกันของแท้ | คืนเงิน 100% หากติดตั้งไม่ได้
        </div>
      </section>

      {/* Right Column: Sticky Summary */}
      <aside className="w-full lg:w-[280px] flex-shrink-0">
        <div className="sticky top-32 space-y-4">
          
          {/* Summary Card */}
          <div className="bg-[#F8FAFC] rounded-2xl p-6 border border-[#E2E8F0]">
            <h3 className="font-bold text-[#1E293B] text-[15px] mb-4">สรุปรายการที่เลือก</h3>
            <div className="space-y-3 mb-6">
              {/* Note: Dummy visual data for screenshot exact match if needed, but using actual selectedOptions is better */}
              {selectedOptions.length === 0 ? (
                <div className="text-[13px] text-[#64748B] italic">ยังไม่มีโปรแกรมเสริม</div>
              ) : (
                selectedOptions.map(opt => {
                  let iconUrl = "https://placehold.co/16x16/E2E8F0/1E293B?text=A";
                  if (opt.label.includes("Word")) iconUrl = "https://lh3.googleusercontent.com/aida-public/AB6AXuCRxpEfuq11_vYbapBgipuLc59XKXurRyeZI4Ig01WowvhMcyd6OHXV4iwTSQ6J6w8lwdq9uW7Sj9yc0n2jDuCRmwzVhp7QLJP3bxsfw6eCb-8Mr26hLmO-TEoJ_LSOizV0tpDRxKqgsY89LCK4WqIacLhAV97s7leoH-h8UVMBuoKcWDtssAeg8sHcSzAputpW_I_459wM-C5YYd-1q7jz9nyyGRY5J-rxxUXRVyAfrDWRbRbb6gV7SHAXkdjrBNSLLSqXvJg-_Ok";
                  if (opt.label.includes("Excel")) iconUrl = "https://lh3.googleusercontent.com/aida-public/AB6AXuClJ7vlZFuvja_Xqng18bp6TFUVektyA6-PVQb6W-kRcrr2moYwCcBZIfZfSqXniLPUjzTyWM6ntzNvW81qTUd1MkYvkyqp5_pdlzirzBtGoaoRHk_zFMPtOMcKPcAP_5PtpRTscYtmTETD-31w4OOzGBPEAEPayB3fcISBeZM-S_mrhvuJeYurCHqsJSpgxYhnWtUEKLLNJdPq4Z60eHHNXFdEeQTEH_3eUNXLJspjFhP5WFfv4iJXE2LR0FHLaUP81l3lp84xpBA";
                  if (opt.label.includes("PowerPoint")) iconUrl = "https://lh3.googleusercontent.com/aida-public/AB6AXuBkZSo6HtfjFyvqzZU7FFrI0udlkwoB_hbWz0-noFEHRyyEJNAuwVc6kP4yl7d4gzZ2XNvmPEle_O9_DHm-8UgQJhsBxWLo5MOlgX5UopuK3XSkTLzLcVga874_nh3qcVSqI3FOQyLJJUJjHakcl5_9TYQB9QcXAu7wmqqwN85x4oivHQiWNljb0-Lsr9I5UR0mGA-TNQlLFbNe2gsKHfZ67ysZ368BOmw3GwcHzCiOtv1GctQGpQSyp_EqTWeP13BGHa4AVvBO9Yc";

                  return (
                    <div key={opt.id} className="flex justify-between items-center text-[13px]">
                      <div className="flex items-center gap-2 text-[#475569]">
                        <Image src={iconUrl} alt={opt.label} width={12} height={12} className="object-contain" unoptimized />
                        {opt.label}
                      </div>
                      <span className="text-[#1E293B] font-medium">{formatBaht(opt.price)}</span>
                    </div>
                  );
                })
              )}
            </div>
            
            <hr className="border-[#E2E8F0] mb-4" />
            
            <div className="flex justify-between items-end mb-1">
              <span className="font-bold text-[#1E293B] text-[14px]">ยอดทั้งหมด</span>
              <span className="font-bold text-[#2563EB] text-[22px] leading-none">{formatBaht(total)}</span>
            </div>
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
  );
}
