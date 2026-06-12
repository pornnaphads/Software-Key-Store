"use client";

import React from "react";
import Link from "next/link";

export default function HowToBuyPage() {
  return (
    <main className="flex-grow pt-32 pb-section-gap relative overflow-hidden w-full bg-surface-container-lowest">
      <div className="hero-glow absolute inset-0 -z-10"></div>
      <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
        {/* Hero Header */}
        <header className="text-center mb-16 space-y-4">
          <h1 className="font-display-lg text-display-lg text-primary mb-4 font-bold tracking-tight">
            วิธีสั่งซื้อสินค้า
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-2xl mx-auto text-sm md:text-base">
            ขั้นตอนการสั่งซื้อที่ง่ายและรวดเร็ว รับคีย์ซอฟต์แวร์ลิขสิทธิ์แท้ได้ทันทีภายในไม่กี่นาที
          </p>
        </header>

        {/* Steps Bento Grid */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-gutter mb-section-gap relative justify-items-center">
          {/* Step 1 */}
          <div className="glass-panel p-8 rounded-xl glow-hover transition-all duration-300 flex flex-col items-center text-center relative border border-outline-variant w-full">
            <div className="w-20 h-20 bg-primary-container rounded-2xl flex items-center justify-center mb-6 shadow-sm text-primary">
              <span className="material-symbols-outlined text-4xl fill">shopping_basket</span>
            </div>
            <div className="font-label-sm text-label-sm text-primary uppercase mb-2 text-xs font-semibold">Step 01</div>
            <h3 className="font-headline-lg text-headline-lg text-on-surface mb-3 font-bold">เลือกสินค้า</h3>
            <p className="font-body-md text-body-md text-on-surface-variant text-sm">
              เลือกสินค้าที่คุณต้องการแล้วกดปุ่มตะกร้าเพื่อเตรียมชำระเงิน
            </p>
          </div>

          {/* Step 2 */}
          <div className="glass-panel p-8 rounded-xl glow-hover transition-all duration-300 flex flex-col items-center text-center relative border border-outline-variant w-full">
            <div className="w-20 h-20 bg-secondary-container rounded-2xl flex items-center justify-center mb-6 shadow-sm text-secondary">
              <span className="material-symbols-outlined text-4xl fill">payments</span>
            </div>
            <div className="font-label-sm text-label-sm text-primary uppercase mb-2 text-xs font-semibold">Step 02</div>
            <h3 className="font-headline-lg text-headline-lg text-on-surface mb-3 font-bold">ชำระเงิน</h3>
            <p className="font-body-md text-body-md text-on-surface-variant text-sm">
              เลือกช่องทางการชำระเงินที่สะดวกสบาย รวดเร็ว และปลอดภัย 100%
            </p>
          </div>

          {/* Step 3 */}
          <div className="glass-panel p-8 rounded-xl glow-hover transition-all duration-300 flex flex-col items-center text-center relative border border-outline-variant w-full">
            <div className="w-20 h-20 bg-tertiary-container rounded-2xl flex items-center justify-center mb-6 shadow-sm text-tertiary">
              <span className="material-symbols-outlined text-4xl fill">key</span>
            </div>
            <div className="font-label-sm text-label-sm text-primary uppercase mb-2 text-xs font-semibold">Step 03</div>
            <h3 className="font-headline-lg text-headline-lg text-on-surface mb-3 font-bold">รับคีย์ทันที</h3>
            <p className="font-body-md text-body-md text-on-surface-variant text-sm">
              เมื่อชำระเงินสำเร็จ ระบบจะส่งรหัส License Key ให้คุณทางอีเมลและประวัติการสั่งซื้อทันที
            </p>
          </div>
        </section>

        {/* Video & Visual Guide */}
        <section className="mb-section-gap">
          <div className="glass-panel rounded-2xl overflow-hidden p-6 md:p-8 border border-outline-variant">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-gutter items-center">
              <div className="aspect-video rounded-xl bg-surface-container-highest flex items-center justify-center relative overflow-hidden">
                <img
                  className="absolute inset-0 w-full h-full object-cover opacity-60"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuB57TClg2fRDDbNdbwdf7jJukKtC6tyIE39OyfMbyRflpDjckBlvpRTlmD6rVOI0gK9zFS7bmUeBU2iMStTMIaHKn2vTdXm5Wcg2zZb03WrEbwf2FKtP3pvmGvxTDtfZKvnpcVQyalmoL29fWJA24b2RBKjtnfHYp_6GexDXyNKOrika5idHFhEBMWPlu1mDxEXzsA2UWMtpO7WiqgpoGRfsfF8LE20tXMsJiw06dsx7PEyODd6M4dkf8aW_eUMAyKo3zyGjoIZq7s"
                  alt="Video guide setup screenshot"
                />
                <button className="relative z-10 w-16 h-16 bg-primary text-on-primary rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-lg cursor-pointer">
                  <span className="material-symbols-outlined text-3xl fill">play_arrow</span>
                </button>
              </div>
              <div className="p-4 md:p-8">
                <h2 className="font-headline-lg text-headline-lg text-primary mb-6 font-bold">
                  คำแนะนำการสั่งซื้อ
                </h2>
                <ul className="space-y-6">
                  <li className="flex gap-4">
                    <span className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center text-primary font-bold shrink-0 text-sm">
                      1
                    </span>
                    <div>
                      <div className="font-title-md text-title-md text-on-surface font-semibold text-sm">
                        เลือกซอฟต์แวร์ที่ต้องการ
                      </div>
                      <div className="font-body-md text-body-md text-on-surface-variant text-xs mt-0.5">
                        ตรวจสอบรายละเอียดสินค้าและราคาให้ถูกต้องก่อนดำเนินการต่อ
                      </div>
                    </div>
                  </li>
                  <li className="flex gap-4">
                    <span className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center text-primary font-bold shrink-0 text-sm">
                      2
                    </span>
                    <div>
                      <div className="font-title-md text-title-md text-on-surface font-semibold text-sm">
                        กรอกข้อมูลการจัดส่ง
                      </div>
                      <div className="font-body-md text-body-md text-on-surface-variant text-xs mt-0.5">
                        ใส่อีเมลของคุณให้ถูกต้อง เพื่อรับรหัสคีย์และข้อมูลคำแนะนำการเปิดใช้งาน
                      </div>
                    </div>
                  </li>
                  <li className="flex gap-4">
                    <span className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center text-primary font-bold shrink-0 text-sm">
                      3
                    </span>
                    <div>
                      <div className="font-title-md text-title-md text-on-surface font-semibold text-sm">
                        สแกนชำระเงินด้วย QR Code
                      </div>
                      <div className="font-body-md text-body-md text-on-surface-variant text-xs mt-0.5">
                        ระบบจะทำการประมวลผลทันที และคีย์เปิดใช้งานจะถูกส่งไปยังอีเมลภายในไม่กี่นาที
                      </div>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
