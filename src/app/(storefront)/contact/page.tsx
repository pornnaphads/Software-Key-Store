"use client";

import React, { useState } from "react";

export default function ContactPage() {
  const [formSubmitted, setFormSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitted(true);
    alert("ส่งข้อความสำเร็จ! ทีมงานจะติดต่อกลับโดยเร็วที่สุดครับ");
  };

  return (
    <main className="pt-20 pb-24 bg-[#F8FAFC] font-sans min-h-screen">
      <div className="max-w-[1000px] mx-auto px-6">
        
        {/* Header Section */}
        <header className="text-center mb-16">
          <h1 className="text-[2rem] md:text-[2.5rem] font-bold text-[#2563EB] tracking-tight mb-4">
            ติดต่อเรา
          </h1>
          <p className="text-[#64748B] max-w-2xl mx-auto text-[13px] md:text-[14px] leading-relaxed">
            หากคุณมีคำถามเกี่ยวกับสินค้า การสั่งซื้อ หรือต้องการความช่วยเหลือด้านเทคนิค ทีมงานของเราพร้อม<br className="hidden md:block" />ดูแลคุณทุกช่วงเวลา
          </p>
        </header>

        <div className="flex flex-col md:flex-row gap-6 items-start">
          
          {/* Left Side: Contact Info */}
          <div className="w-full md:w-[35%] flex flex-col gap-4">
            <div className="bg-white p-6 rounded-xl border border-[#E2E8F0] flex items-center gap-5">
              <div className="w-12 h-12 rounded-lg bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[24px]">mail</span>
              </div>
              <div>
                <h3 className="text-[#1E293B] font-bold text-[14px] mb-0.5">อีเมล</h3>
                <p className="text-[#64748B] text-[13px]">support@softkeystore.com</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-[#E2E8F0] flex items-center gap-5">
              <div className="w-12 h-12 rounded-lg bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[24px]">call</span>
              </div>
              <div>
                <h3 className="text-[#1E293B] font-bold text-[14px] mb-0.5">เบอร์โทรศัพท์</h3>
                <p className="text-[#64748B] text-[13px]">+66 2 123 4567</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-[#E2E8F0] flex items-center gap-5">
              <div className="w-12 h-12 rounded-lg bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[24px]">schedule</span>
              </div>
              <div>
                <h3 className="text-[#1E293B] font-bold text-[14px] mb-0.5">เวลาทำการ</h3>
                <p className="text-[#64748B] text-[13px] leading-relaxed">เปิดให้บริการ 24 ชั่วโมง ทุกวัน (24/7 Support)</p>
              </div>
            </div>
          </div>

          {/* Right Side: Form */}
          <div className="w-full md:w-[65%]">
            <div className="bg-white p-8 rounded-2xl border border-[#E2E8F0]">
              <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Name Input */}
                  <div className="space-y-2">
                    <label className="text-[#475569] text-[11px] font-bold block">ชื่อ - นามสกุล</label>
                    <input
                      className="w-full bg-[#F8FAFC] border border-[#E2E8F0] text-[#1E293B] rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all text-[13px] placeholder:text-[#94A3B8]"
                      placeholder="ระบุชื่อของคุณ"
                      required
                      type="text"
                    />
                  </div>
                  
                  {/* Email Input */}
                  <div className="space-y-2">
                    <label className="text-[#475569] text-[11px] font-bold block">อีเมล</label>
                    <input
                      className="w-full bg-[#F8FAFC] border border-[#E2E8F0] text-[#1E293B] rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all text-[13px] placeholder:text-[#94A3B8]"
                      placeholder="example@email.com"
                      required
                      type="email"
                    />
                  </div>
                </div>

                {/* Subject Dropdown */}
                <div className="space-y-2">
                  <label className="text-[#475569] text-[11px] font-bold block">หัวข้อ</label>
                  <div className="relative">
                    <select
                      className="w-full bg-[#F8FAFC] border border-[#E2E8F0] text-[#1E293B] rounded-lg px-4 py-3 appearance-none focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all text-[13px] cursor-pointer"
                      required
                      defaultValue=""
                    >
                      <option value="" disabled className="text-[#94A3B8]">เลือกหัวข้อการติดต่อ</option>
                      <option value="sales">สอบถามก่อนซื้อสินค้า</option>
                      <option value="technical">ปัญหาการติดตั้งและเปิดใช้งาน</option>
                      <option value="billing">ปัญหาการชำระเงิน/ใบเสร็จ</option>
                      <option value="other">อื่นๆ</option>
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#94A3B8]">
                      <span className="material-symbols-outlined text-[20px]">expand_more</span>
                    </div>
                  </div>
                </div>

                {/* Message Textarea */}
                <div className="space-y-2">
                  <label className="text-[#475569] text-[11px] font-bold block">ข้อความ</label>
                  <textarea
                    className="w-full bg-[#F8FAFC] border border-[#E2E8F0] text-[#1E293B] rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all text-[13px] placeholder:text-[#94A3B8] resize-none"
                    placeholder="พิมพ์ข้อความที่คุณต้องการติดต่อเราที่นี่..."
                    required
                    rows={6}
                  ></textarea>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="bg-[#0052FF] hover:bg-[#0040D2] text-white font-bold py-[10px] px-8 rounded-lg shadow-[0_8px_20px_rgba(0,82,255,0.25)] transition-all flex items-center justify-center gap-2 text-[14px]"
                >
                  <span className="material-symbols-outlined text-[16px]">send</span>
                  ส่งข้อความ
                </button>
              </form>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}
