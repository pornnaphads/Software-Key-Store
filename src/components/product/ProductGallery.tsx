"use client";

import { useState } from "react";
import Image from "next/image";
import type { ProductDetail } from "@/types/commerce";

export function ProductGallery({ product }: { product: ProductDetail }) {
  const [activeImage, setActiveImage] = useState(0);

  // Use dummy images for the gallery if product has only one
  const images = [
    product.image || "https://placehold.co/600x400?text=Product",
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

      {/* Thumbnails */}
      <div className="grid grid-cols-3 gap-4">
        {images.map((img, idx) => (
          <button
            key={idx}
            onClick={() => setActiveImage(idx)}
            className={`bg-[#F8FAFC] border rounded-xl p-4 aspect-square flex items-center justify-center transition-all ${
              activeImage === idx
                ? "border-[#2563EB] ring-1 ring-[#2563EB]"
                : "border-[#E2E8F0] hover:border-[#CBD5E1]"
            }`}
          >
            <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-contain mix-blend-multiply" />
          </button>
        ))}
      </div>
      
      {/* Feature Badges below gallery (matching screenshot) */}
      <div className="grid grid-cols-3 gap-3 mt-4">
        <div className="border border-[#E2E8F0] rounded-lg p-3 flex flex-col items-center justify-center text-center bg-white">
          <span className="font-bold text-[#1E293B] text-[11px] mb-0.5">ของแท้ 100%</span>
          <span className="text-[#64748B] text-[9px]">การันตีคืนเงิน 100% หากใช้ไม่ได้</span>
        </div>
        <div className="border border-[#E2E8F0] rounded-lg p-3 flex flex-col items-center justify-center text-center bg-white">
          <span className="material-symbols-outlined text-[#2563EB] text-[18px] mb-1">bolt</span>
          <span className="font-bold text-[#1E293B] text-[11px] mb-0.5">รับรหัสทันที</span>
          <span className="text-[#64748B] text-[9px]">จัดส่งออโต้ 24/7</span>
        </div>
        <div className="border border-[#E2E8F0] rounded-lg p-3 flex flex-col items-center justify-center text-center bg-white">
          <span className="font-bold text-[#1E293B] text-[11px] mb-0.5">ซัพพอร์ต 24/7</span>
          <span className="text-[#64748B] text-[9px]">พร้อมดูแลทุกปัญหา</span>
        </div>
      </div>
    </div>
  );
}
