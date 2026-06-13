"use client";

import { useState } from "react";
import type { ProductReview } from "@/types/commerce";

export function ProductTabs({ reviews = [] }: { reviews?: ProductReview[] }) {
  const [activeTab, setActiveTab] = useState("details");

  return (
    <div className="w-full bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden shadow-sm">
      {/* Tab Headers */}
      <div className="flex border-b border-[#E2E8F0] bg-[#F8FAFC] px-4 md:px-8">
        <button
          onClick={() => setActiveTab("details")}
          className={`px-6 py-4 text-[14px] font-bold border-b-2 transition-colors ${
            activeTab === "details"
              ? "border-[#2563EB] text-[#2563EB]"
              : "border-transparent text-[#64748B] hover:text-[#1E293B]"
          }`}
        >
          รายละเอียดสินค้า
        </button>
        <button
          onClick={() => setActiveTab("how-to")}
          className={`px-6 py-4 text-[14px] font-bold border-b-2 transition-colors ${
            activeTab === "how-to"
              ? "border-[#2563EB] text-[#2563EB]"
              : "border-transparent text-[#64748B] hover:text-[#1E293B]"
          }`}
        >
          วิธีใช้งาน
        </button>
        <button
          onClick={() => setActiveTab("reviews")}
          className={`px-6 py-4 text-[14px] font-bold border-b-2 transition-colors ${
            activeTab === "reviews"
              ? "border-[#2563EB] text-[#2563EB]"
              : "border-transparent text-[#64748B] hover:text-[#1E293B]"
          }`}
        >
          รีวิว (120)
        </button>
      </div>

      {/* Tab Content */}
      <div className="p-8">
        {activeTab === "details" && (
          <div className="space-y-6">
            <h2 className="text-[20px] font-bold text-[#1E293B]">Product Overview</h2>
            <p className="text-[14px] text-[#475569] leading-relaxed max-w-4xl">
              Microsoft Office 2021 Professional Plus เป็นโซลูชันที่ครอบคลุมสำหรับมืออาชีพและธุรกิจขนาดเล็กที่ต้องการเครื่องมือเพื่อช่วยจัดจัดการงานเอกสารและตารางงาน โดดเด่นด้วยประสิทธิภาพที่เพิ่มสูงขึ้น การเข้าถึงคุณสมบัติใหม่สุดพิเศษ รองรับ Windows 11
            </p>
            
            <div className="flex flex-col md:flex-row gap-8 pt-4">
              <div className="flex-1">
                <h3 className="font-bold text-[#2563EB] text-[14px] mb-4">ทำไมต้องเลือก Office 2021?</h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <span className="material-symbols-outlined text-[#2563EB] text-[18px]">check_circle</span>
                    <span className="text-[13px] text-[#475569]">จ่ายครั้งเดียว ใช้งานได้ตลอดชีพ</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="material-symbols-outlined text-[#2563EB] text-[18px]">check_circle</span>
                    <span className="text-[13px] text-[#475569]">ไม่มีรายเดือน (Subscription Free)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="material-symbols-outlined text-[#2563EB] text-[18px]">check_circle</span>
                    <span className="text-[13px] text-[#475569]">อัปเดตความปลอดภัยฟรีอย่างต่อเนื่อง</span>
                  </li>
                </ul>
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-[#2563EB] text-[14px] mb-4">สิ่งที่รวมอยู่ในแพ็กเกจ:</h3>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-[#F1F5F9] text-[#475569] text-[11px] rounded-full border border-[#E2E8F0]">Word</span>
                  <span className="px-3 py-1 bg-[#F1F5F9] text-[#475569] text-[11px] rounded-full border border-[#E2E8F0]">Excel</span>
                  <span className="px-3 py-1 bg-[#F1F5F9] text-[#475569] text-[11px] rounded-full border border-[#E2E8F0]">PowerPoint</span>
                  <span className="px-3 py-1 bg-[#F1F5F9] text-[#475569] text-[11px] rounded-full border border-[#E2E8F0]">Outlook</span>
                  <span className="px-3 py-1 bg-[#F1F5F9] text-[#475569] text-[11px] rounded-full border border-[#E2E8F0]">Publisher</span>
                  <span className="px-3 py-1 bg-[#F1F5F9] text-[#475569] text-[11px] rounded-full border border-[#E2E8F0]">Access</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "how-to" && (
          <div className="space-y-4">
            <h2 className="text-[18px] font-bold text-[#1E293B]">ขั้นตอนการติดตั้ง (How to Install)</h2>
            <ol className="list-decimal list-inside text-[14px] text-[#475569] space-y-2">
              <li>เข้าสู่ระบบบัญชี Microsoft ของคุณที่ setup.office.com</li>
              <li>กรอก Product Key ที่คุณได้รับจากเราทางอีเมล</li>
              <li>ดาวน์โหลดซอฟต์แวร์และติดตั้งลงบนเครื่องของคุณ</li>
              <li>เปิดโปรแกรมและเริ่มใช้งานได้ทันที</li>
            </ol>
          </div>
        )}

        {activeTab === "reviews" && (
          <div className="space-y-4">
            <div className="flex items-center gap-4 border-b border-[#E2E8F0] pb-4 mb-4">
              <div className="text-[36px] font-bold text-[#1E293B]">5.0</div>
              <div>
                <div className="flex text-amber-400 text-[18px]">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span key={star} className="material-symbols-outlined" style={{ fontVariationSettings: '"FILL" 1' }}>star</span>
                  ))}
                </div>
                <div className="text-[13px] text-[#64748B]">จาก 120 รีวิว</div>
              </div>
            </div>
            {/* Dummy Review */}
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-[#E2E8F0] flex items-center justify-center font-bold text-[#64748B]">S</div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-[14px] text-[#1E293B]">Somchai K.</span>
                  <span className="text-[11px] text-[#10B981] bg-[#D1FAE5] px-2 py-0.5 rounded-full flex items-center gap-1">
                    <span className="material-symbols-outlined text-[12px]">check_circle</span> Verified Buyer
                  </span>
                </div>
                <div className="flex text-amber-400 text-[14px] mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span key={star} className="material-symbols-outlined" style={{ fontVariationSettings: '"FILL" 1' }}>star</span>
                  ))}
                </div>
                <p className="text-[13px] text-[#475569]">ได้รับคีย์เร็วมากครับ ลงทะเบียนกับเว็บ Microsoft ผ่าน ใช้งานได้ถาวรจริง แอดมินตอบคำถามเคลียร์ดีมาก</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
