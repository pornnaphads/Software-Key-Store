"use client";

import { useState } from "react";
import Image from "next/image";
import type { ProductDetail } from "@/types/commerce";
import { getProductAsset } from "@/lib/product-assets";

export function ProductGallery({ product }: { product: ProductDetail }) {
  const [activeImage, setActiveImage] = useState(0);

  // Use dummy images for the gallery if product has only one
  const images = [
    getProductAsset(product.image),
    "https://placehold.co/600x400/E2E8F0/1E293B?text=View+2",
    "https://placehold.co/600x400/E2E8F0/1E293B?text=View+3",
  ];

  return (
    <div className="flex flex-col gap-4">
      {/* Main Image */}
      <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl p-8 flex items-center justify-center aspect-square relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-tr from-blue-50 to-transparent pointer-events-none"></div>
        <img
          src={images[activeImage]}
          alt={product.name}
          className="w-full h-full object-contain mix-blend-multiply relative z-10 drop-shadow-xl"
        />
      </div>

      {/* Feature Badges below gallery (matching screenshot exactly) */}
      <div className="grid grid-cols-3 gap-4">
        <div className="border border-[#E2E8F0] rounded-xl p-4 flex flex-col items-center justify-center text-center bg-white aspect-square hover:border-[#CBD5E1] transition-colors">
          <span className="font-bold text-[#1E293B] text-[12px] mb-1">ของแท้ 100%</span>
          <span className="text-[#64748B] text-[10px] leading-relaxed max-w-[80%]">การันตีคืนเงิน 100% หากใช้ไม่ได้</span>
        </div>
        <div className="border border-[#E2E8F0] rounded-xl p-4 flex flex-col items-center justify-center text-center bg-white aspect-square hover:border-[#CBD5E1] transition-colors">
          <span className="material-symbols-outlined text-[#2563EB] text-[24px] mb-2">bolt</span>
          <span className="font-bold text-[#1E293B] text-[12px] mb-1">รับรหัสทันที</span>
          <span className="text-[#64748B] text-[10px] leading-relaxed max-w-[80%]">จัดส่งออโต้ 24/7</span>
        </div>
        <div className="border border-[#E2E8F0] rounded-xl p-4 flex flex-col items-center justify-center text-center bg-white aspect-square hover:border-[#CBD5E1] transition-colors">
          <span className="font-bold text-[#1E293B] text-[12px] mb-1">ซัพพอร์ต 24/7</span>
          <span className="text-[#64748B] text-[10px] leading-relaxed max-w-[80%]">พร้อมดูแลทุกปัญหา</span>
        </div>
      </div>
    </div>
  );
}
