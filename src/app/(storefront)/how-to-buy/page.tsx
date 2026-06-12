"use client";

import React from "react";
import Link from "next/link";

export default function HowToBuyPage() {
  return (
    <main className="pt-20 pb-24 bg-white font-sans">
      <div className="max-w-[1000px] mx-auto px-6">
        
        {/* Header */}
        <div className="text-center mb-14">
          <h1 className="text-3xl md:text-[2rem] font-bold text-[#324565] mb-4">วิธีสั่งซื้อสินค้า</h1>
          <p className="text-[#64748B] text-[13px] md:text-[14px]">
            ขั้นตอนการสั่งซื้อที่ง่ายและรวดเร็ว รับคีย์เกมและซอฟต์แวร์แท้ใช้ได้ทันทีภายใน 1 นาที
          </p>
        </div>

        {/* 3 Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {/* Step 1 */}
          <div className="border border-[#E2E8F0] rounded-xl p-8 flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-[#E0E7FF] rounded-2xl flex items-center justify-center mb-5">
              <span className="material-symbols-outlined text-[#1E3A8A] text-[28px]">shopping_basket</span>
            </div>
            <div className="text-[#94A3B8] text-[10px] font-bold tracking-[0.15em] uppercase mb-2">Step 01</div>
            <h3 className="text-[1.15rem] font-bold text-[#1E293B] mb-2">เลือกสินค้า</h3>
            <p className="text-[#64748B] text-[12px] leading-relaxed max-w-[200px]">
              เลือกสินค้าที่คุณต้องการแล้วกด "เพิ่มลงตะกร้า" <br/> เพื่อเตรียมชำระเงิน
            </p>
          </div>
          
          {/* Step 2 */}
          <div className="border border-[#E2E8F0] rounded-xl p-8 flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-[#CCFBF1] rounded-2xl flex items-center justify-center mb-5">
              <span className="material-symbols-outlined text-[#0F766E] text-[28px]">payment</span>
            </div>
            <div className="text-[#94A3B8] text-[10px] font-bold tracking-[0.15em] uppercase mb-2">Step 02</div>
            <h3 className="text-[1.15rem] font-bold text-[#1E293B] mb-2">ชำระเงิน</h3>
            <p className="text-[#64748B] text-[12px] leading-relaxed max-w-[200px]">
              เลือกช่องทางการชำระเงินที่สะดวก <br/> ไม่ว่าจะเป็น QR Code
            </p>
          </div>
          
          {/* Step 3 */}
          <div className="border border-[#E2E8F0] rounded-xl p-8 flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-[#F3E8FF] rounded-2xl flex items-center justify-center mb-5">
              <span className="material-symbols-outlined text-[#6B21A8] text-[28px]">vpn_key</span>
            </div>
            <div className="text-[#94A3B8] text-[10px] font-bold tracking-[0.15em] uppercase mb-2">Step 03</div>
            <h3 className="text-[1.15rem] font-bold text-[#1E293B] mb-2">รับรหัสทันที</h3>
            <p className="text-[#64748B] text-[12px] leading-relaxed max-w-[240px]">
              หลังจากชำระเงินสำเร็จ ระบบจะส่งรหัส License Key ให้คุณทางหน้าเว็บและอีเมลทันที
            </p>
          </div>
        </div>

        {/* Guide Box */}
        <div className="border border-[#E2E8F0] rounded-2xl p-6 md:p-10 mb-20 flex flex-col md:flex-row gap-10 items-center">
          <div className="w-full md:w-[50%] bg-[#CBD5E1] aspect-[16/10] rounded-xl flex items-center justify-center text-[#64748B] text-[11px] font-bold uppercase">
             img
          </div>
          <div className="w-full md:w-[50%] pl-0 md:pl-4">
            <h2 className="text-[1.35rem] font-bold text-[#3B4268] mb-8">แนะนำการสั่งซื้อ</h2>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-7 h-7 rounded-full bg-[#E0E7FF] text-[#3B4268] flex items-center justify-center font-bold shrink-0 text-[13px]">1</div>
                <div>
                  <h4 className="font-bold text-[#1E293B] text-[13px]">เลือกสินค้าและตรวจสอบตะกร้า</h4>
                  <p className="text-[#64748B] text-[12px] mt-1">ตรวจดูจำนวนและราคาให้เรียบร้อยก่อนกดยืนยัน</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-7 h-7 rounded-full bg-[#E0E7FF] text-[#3B4268] flex items-center justify-center font-bold shrink-0 text-[13px]">2</div>
                <div>
                  <h4 className="font-bold text-[#1E293B] text-[13px]">ยืนยันตัวตน (ถ้ามี)</h4>
                  <p className="text-[#64748B] text-[12px] mt-1">ล็อกอินเข้าสู่ระบบเพื่อเก็บประวัติการสั่งซื้อของคุณ</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-7 h-7 rounded-full bg-[#E0E7FF] text-[#3B4268] flex items-center justify-center font-bold shrink-0 text-[13px]">3</div>
                <div>
                  <h4 className="font-bold text-[#1E293B] text-[13px]">ชำระเงินและรับคีย์</h4>
                  <p className="text-[#64748B] text-[12px] mt-1">ระบบอัตโนมัติจะตรวจสอบยอดเงินและส่งคีย์ทันที</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Payments Section */}
        <div className="text-center mb-24">
          <h2 className="text-[1.35rem] font-bold text-[#3B4268] mb-8">ช่องทางการชำระเงิน</h2>
          <div className="flex justify-center">
            <div className="border border-[#E2E8F0] rounded-xl flex flex-col items-center justify-center w-[140px] h-[100px]">
              <div className="w-8 h-6 bg-[#E2E8F0] text-[9px] text-[#64748B] flex items-center justify-center mb-3">img</div>
              <span className="text-[#475569] text-[10px] font-semibold tracking-wide">Thai QR Code</span>
            </div>
          </div>
        </div>

        {/* Additional Help */}
        <div className="bg-[#E0E7FF] rounded-[1.25rem] p-8 md:p-10 flex flex-col md:flex-row gap-8 items-center justify-between">
           <div className="flex items-start gap-5">
             <span className="material-symbols-outlined text-[#64748B] text-[2.5rem] leading-none opacity-80">help_outline</span>
             <div>
               <h3 className="text-[1.15rem] font-bold text-[#1E293B] mb-2">มีข้อสงสัยเพิ่มเติม?</h3>
               <p className="text-[#475569] text-[12px] max-w-[420px] leading-relaxed">
                 หากคุณพบปัญหาในการชำระเงิน หรือต้องการสอบถามข้อมูลสินค้าเพิ่มเติม สามารถติดต่อเราได้ตลอด 24 ชั่วโมง
               </p>
             </div>
           </div>
           <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto shrink-0">
             <Link href="/contact" className="bg-[#475569] text-white px-6 py-[10px] rounded-full text-[12px] font-semibold hover:bg-[#334155] transition-colors flex items-center justify-center gap-2 whitespace-nowrap">
               <span className="material-symbols-outlined text-[16px]">chat_bubble</span>
               ติดต่อแอดมิน
             </Link>
             <button className="border border-[#94A3B8] text-[#475569] px-6 py-[10px] rounded-full text-[12px] font-semibold hover:bg-[#CBD5E1] transition-colors whitespace-nowrap">
               อ่านคำถามที่พบบ่อย
             </button>
           </div>
        </div>

      </div>
    </main>
  );
}
