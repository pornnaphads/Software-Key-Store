"use client";

import React, { useState } from "react";

export default function ContactPage() {
  const [formSubmitted, setFormSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitted(true);
    alert("ขอบคุณสำหรับข้อความ ทีมงานจะติดต่อกลับโดยเร็วที่สุด");
  };

  return (
    <main className="flex-grow pt-32 pb-section-gap relative overflow-hidden w-full">
      <div className="hero-glow absolute inset-0 -z-10"></div>
      <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
        {/* Header Section */}
        <header className="text-center mb-16 space-y-4">
          <h1 className="font-display-lg text-display-lg text-primary tracking-tight font-bold">
            ติดต่อเรา
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-2xl mx-auto text-sm md:text-base">
            หากคุณมีคำถามเกี่ยวกับสินค้า การสั่งซื้อ หรือต้องการความช่วยเหลือด้านเทคนิค ทีมงานของเราพร้อมดูแลคุณทุกช่วงเวลา
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
          {/* Contact Info Cards (Left Side) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="glass-panel p-6 rounded-xl flex items-start gap-4 hover:shadow-lg transition-all duration-300">
              <div className="bg-primary/10 p-3 rounded-lg text-primary flex items-center justify-center">
                <span className="material-symbols-outlined text-xl">mail</span>
              </div>
              <div>
                <h3 className="font-title-md text-title-md font-bold text-on-surface text-sm">อีเมล</h3>
                <p className="font-body-md text-body-md text-on-surface-variant text-xs mt-1">support@softkeystore.com</p>
              </div>
            </div>

            <div className="glass-panel p-6 rounded-xl flex items-start gap-4 hover:shadow-lg transition-all duration-300">
              <div className="bg-primary/10 p-3 rounded-lg text-primary flex items-center justify-center">
                <span className="material-symbols-outlined text-xl">call</span>
              </div>
              <div>
                <h3 className="font-title-md text-title-md font-bold text-on-surface text-sm">เบอร์โทรศัพท์</h3>
                <p className="font-body-md text-body-md text-on-surface-variant text-xs mt-1">+66 2 123 4567</p>
              </div>
            </div>

            <div className="glass-panel p-6 rounded-xl flex items-start gap-4 hover:shadow-lg transition-all duration-300">
              <div className="bg-primary/10 p-3 rounded-lg text-primary flex items-center justify-center">
                <span className="material-symbols-outlined text-xl">schedule</span>
              </div>
              <div>
                <h3 className="font-title-md text-title-md font-bold text-on-surface text-sm">เวลาทำการ</h3>
                <p className="font-body-md text-body-md text-on-surface-variant text-xs mt-1">
                  เปิดให้บริการ 24 ชั่วโมง ทุกวัน (24/7 Support)
                </p>
              </div>
            </div>

            {/* Map Placeholder / Image */}
            <div className="glass-panel rounded-xl overflow-hidden h-64 relative group border border-outline-variant/30">
              <img
                className="w-full h-full object-cover grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBI8Eodboh1r667u4AeC_mkYrBNBRBeS_HYF3xsCFqVCUwabgf9JA_e7ge3CvMlucUmpnuQKESm9EZDfOMqyhyHd2CF2FAaneMTKOfthxt-_FrIyvtHR6HxN-mLPzrPiG5YCUcl5kIM4KFBaKWSe8r27YHvx3sPSaxogA_7gnsvuFEj8GTIGc-Q1bFeBHBeovC8VUTQTz6j0Y3OMDFZBUFGICSvx4KXCuhpj4KGWji4YmPW7kX_1-pQW2gzu2BzKW85zmUZo5Bm1uw"
                alt="SoftKeyStore Location Map"
              />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="bg-primary text-white p-3 rounded-full shadow-lg animate-bounce flex items-center justify-center">
                  <span className="material-symbols-outlined">location_on</span>
                </div>
              </div>
              <div className="absolute bottom-4 left-4 bg-white/90 px-3 py-1 rounded text-[10px] font-bold uppercase tracking-wider text-primary border border-primary/20">
                Location Hub
              </div>
            </div>
          </div>

          {/* Contact Form (Right Side) */}
          <div className="lg:col-span-8">
            <div className="glass-panel p-8 rounded-2xl border border-outline-variant/40 shadow-sm">
              <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider block text-xs font-bold">
                      ชื่อ-นามสกุล
                    </label>
                    <input
                      className="w-full bg-surface-container-low border border-outline-variant rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                      placeholder="ระบุชื่อของคุณ"
                      required
                      type="text"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider block text-xs font-bold">
                      อีเมล
                    </label>
                    <input
                      className="w-full bg-surface-container-low border border-outline-variant rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                      placeholder="example@email.com"
                      required
                      type="email"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider block text-xs font-bold">
                    หัวข้อ
                  </label>
                  <select
                    className="w-full bg-surface-container-low border border-outline-variant rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm appearance-none"
                    required
                    defaultValue=""
                  >
                    <option disabled value="">
                      เลือกหัวข้อการติดต่อ
                    </option>
                    <option value="support">สอบถามการใช้งานทั่วไป</option>
                    <option value="billing">แจ้งปัญหาการชำระเงิน</option>
                    <option value="technical">ปัญหาด้านเทคนิค</option>
                    <option value="business">ความร่วมมือทางธุรกิจ</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider block text-xs font-bold">
                    ข้อความ
                  </label>
                  <textarea
                    className="w-full bg-surface-container-low border border-outline-variant rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none text-sm"
                    placeholder="พิมพ์ข้อความที่คุณต้องการติดต่อเราที่นี่..."
                    required
                    rows={6}
                  ></textarea>
                </div>
                <button
                  className="w-full md:w-auto px-12 py-4 bg-primary text-on-primary font-title-md text-title-md rounded-xl font-bold shadow-lg hover:shadow-xl hover:bg-blue-700 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  type="submit"
                >
                  <span className="material-symbols-outlined text-sm">send</span>
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
