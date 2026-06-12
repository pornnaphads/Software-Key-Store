"use client";

import Image from "next/image";
import Link from "next/link";
import { getProductAsset } from "@/lib/product-assets";
import type { CartLine } from "@/features/cart/cart-types";

interface CartItemProps {
  issues?: string[];
  line: CartLine;
  selected: boolean;
  onToggleSelect: () => void;
  onQuantityChange: (quantity: number) => void;
  onRemove: () => void;
}

function formatBaht(value: number): string {
  return `${value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} ฿`;
}

export function CartItem({
  issues = [],
  line,
  selected,
  onToggleSelect,
  onQuantityChange,
  onRemove,
}: CartItemProps) {
  const unavailable = line.stock <= 0 || line.quantity <= 0;

  return (
    <div className={`flex flex-col md:flex-row items-center justify-between p-6 bg-white border border-[#E2E8F0] rounded-2xl gap-6 shadow-sm transition-all ${selected ? 'border-accent-electric ring-1 ring-accent-electric/20' : 'hover:border-[#CBD5E1]'}`}>
      
      {/* Product Info */}
      <div className="flex items-center gap-6 w-full md:w-[50%]">
        <input 
          type="checkbox" 
          checked={selected}
          onChange={onToggleSelect}
          className="w-5 h-5 text-accent-electric rounded border-[#CBD5E1] focus:ring-accent-electric shrink-0 cursor-pointer"
        />
        <Link href={`/product/${line.productId}`} className="shrink-0">
          <div className="w-24 h-24 relative bg-[#0F172A] rounded-xl overflow-hidden border border-[#1E293B] shadow-inner flex items-center justify-center">
            {/* Dark background for product image based on mockup */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#3B82F6]/20"></div>
            <Image
              alt={line.name}
              fill
              sizes="96px"
              src={getProductAsset(line.imageKey) || "https://placehold.co/96x96/0F172A/ffffff?text=App"}
              className="object-contain p-2 relative z-10"
            />
          </div>
        </Link>
        <div className="flex flex-col">
          <Link href={`/product/${line.productId}`} className="font-bold text-[#1E293B] text-[15px] hover:text-accent-electric transition-colors line-clamp-2 leading-tight mb-1">
            {line.name}
          </Link>
          <span className="text-[13px] text-[#64748B] mb-2">{line.category} · Digital License (Retail)</span>
          <span className="font-bold text-accent-electric text-[14px]">{formatBaht(line.unitPrice)}</span>
          
          {line.options.length > 0 && (
            <div className="mt-2 text-[12px] text-[#64748B] bg-[#F8FAFC] px-3 py-1.5 rounded-lg border border-[#E2E8F0] inline-block">
              + {line.options.map(o => o.label).join(", ")}
            </div>
          )}
        </div>
      </div>

      {/* Quantity */}
      <div className="w-full md:w-[20%] flex justify-center">
        <div className="flex items-center border border-[#E2E8F0] rounded-lg h-10 w-[120px] bg-white">
          <button
            aria-label={`ลดจำนวน ${line.name}`}
            disabled={line.quantity <= 1 || line.stock <= 0}
            onClick={() => onQuantityChange(line.quantity - 1)}
            type="button"
            className="w-10 h-full flex items-center justify-center text-[#64748B] hover:bg-[#F8FAFC] transition-colors disabled:opacity-50"
          >
            <span aria-hidden="true" className="material-symbols-outlined text-[16px]">remove</span>
          </button>
          <input
            aria-label="จำนวนสิทธิ์"
            max={line.stock}
            min={line.stock > 0 ? 1 : 0}
            onChange={(event) => onQuantityChange(Number(event.target.value))}
            readOnly
            type="text"
            className="w-10 h-full text-center border-none p-0 text-[14px] font-bold text-[#1E293B] focus:ring-0"
            value={line.quantity}
          />
          <button
            aria-label={`เพิ่มจำนวน ${line.name}`}
            disabled={line.stock <= 0 || line.quantity >= line.stock}
            onClick={() => onQuantityChange(line.quantity + 1)}
            type="button"
            className="w-10 h-full flex items-center justify-center text-[#64748B] hover:bg-[#F8FAFC] transition-colors disabled:opacity-50"
          >
            <span aria-hidden="true" className="material-symbols-outlined text-[16px]">add</span>
          </button>
        </div>
      </div>

      {/* Total & Action */}
      <div className="w-full md:w-[30%] flex items-center justify-between md:justify-end gap-6">
        <div className="font-bold text-[#1E293B] text-[15px] min-w-[100px] text-right">
          {formatBaht(line.unitPrice * line.quantity)}
        </div>
        <button
          aria-label={`นำ ${line.name} ออกจากตะกร้า`}
          onClick={onRemove}
          type="button"
          className="w-10 h-10 flex items-center justify-center text-[#94A3B8] hover:text-[#EF4444] hover:bg-[#FEF2F2] rounded-lg transition-all"
        >
          <span aria-hidden="true" className="material-symbols-outlined text-[20px]">delete</span>
        </button>
      </div>
      
      {/* Issues */}
      {issues.length > 0 && (
        <div className="w-full mt-2 p-3 bg-red-50 text-red-600 rounded-lg text-[13px] flex items-start gap-2">
           <span aria-hidden="true" className="material-symbols-outlined text-[16px]">error</span>
           <div>
             {issues.map(issue => <p key={issue}>{issue}</p>)}
           </div>
        </div>
      )}
    </div>
  );
}
