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
              เลือกสินค้าที่คุณต้องการแล้วกด "เพิ่มลงตะกร้า" <br /> เพื่อเตรียมชำระเงิน
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
              เลือกช่องทางการชำระเงินที่สะดวก <br /> ไม่ว่าจะเป็น QR Code
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
          <div className="w-full md:w-[50%] bg-[#f8fafc] aspect-[16/10] rounded-xl flex flex-col items-center justify-center border border-[#E2E8F0] p-6">
            <img
              alt="ช่องทางชำระเงิน พร้อมเพย์"
              className="w-auto h-[60%] object-contain mb-3"
              src="/assets/softkeystore/payments/promptpay-qr.png"
            />
            <div className="flex items-center gap-2">
              <img
                alt="PromptPay Logo"
                className="h-5 w-auto object-contain"
                src="/assets/softkeystore/payments/promptpay.png"
              />
              <span className="text-xs font-semibold text-[#3B4268]">Thai QR Payment</span>
            </div>
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


      </div>
    </main>
  );
}
