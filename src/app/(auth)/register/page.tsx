"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError("");
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();

    const { name, email, password, confirmPassword } = formData;

    if (!name || !email || !password || !confirmPassword) {
      setError("กรุณากรอกข้อมูลให้ครบทุกช่อง");
      return;
    }

    if (!termsAccepted) {
      setError("กรุณายอมรับข้อกำหนดและเงื่อนไข");
      return;
    }

    if (password !== confirmPassword) {
      setError("รหัสผ่านและยืนยันรหัสผ่านไม่ตรงกัน");
      return;
    }

    if (password.length < 6) {
      setError("รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร");
      return;
    }

    // Get existing users from localStorage
    const existingUsers = JSON.parse(localStorage.getItem("mock_users") || "[]");

    // Check if email already exists
    const emailExists = existingUsers.some((user: any) => user.email === email);
    if (emailExists) {
      setError("อีเมลนี้ถูกใช้งานในระบบแล้ว");
      return;
    }

    // Add new user
    const newUser = { name, email, password };
    existingUsers.push(newUser);
    localStorage.setItem("mock_users", JSON.stringify(existingUsers));

    setSuccess("สมัครสมาชิกสำเร็จ! กำลังนำคุณไปยังหน้าเข้าสู่ระบบ...");

    // Redirect to login page after 2 seconds
    setTimeout(() => {
      router.push("/login");
    }, 2000);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f8f9fa] text-[#191c1d] font-body-md antialiased overflow-x-hidden">
      {/* Top Navigation */}
      <header className="fixed top-0 w-full z-50 flex justify-between items-center px-margin-desktop py-4 max-w-container-max mx-auto left-0 right-0 bg-[#f8f9fa]/80 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-accent-electric/10 text-accent-electric">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: '"FILL" 1' }}>
              vpn_key
            </span>
          </div>
          <span className="font-display-lg text-title-md font-bold text-accent-electric">SoftKeyStore</span>
        </div>
        <Link className="flex items-center gap-2 font-title-md text-on-surface-variant hover:text-accent-electric transition-colors" href="/">
          <span className="material-symbols-outlined">arrow_back</span>
          <span>กลับไปหน้าแรก</span>
        </Link>
      </header>

      {/* Main Container */}
      <main className="flex-grow flex items-center justify-center pt-24 pb-12 px-margin-mobile md:px-margin-desktop min-h-[calc(100vh-64px)] bg-[#f8f9fa]">
        <div className="max-w-container-max w-full grid grid-cols-1 md:grid-cols-2 gap-0 overflow-hidden rounded-xl border border-outline-variant shadow-lg bg-surface-container-lowest">

          {/* Left Panel: Branding & Marketing */}
          <div className="bg-cyber-light relative p-12 flex flex-col justify-center items-center text-center overflow-hidden border-r border-outline-variant bg-gradient-to-br from-[#f0f4ff] to-white">
            <div className="absolute inset-0 hero-glow pointer-events-none bg-radial from-[rgba(0,98,255,0.08)] to-transparent"></div>
            <div className="relative z-10 space-y-6">
              <h1 className="font-display-lg text-headline-lg text-deep-navy">
                สมัครสมาชิกง่ายๆ<br />เพื่อรับสิทธิประโยชน์มากมาย
              </h1>
              <p className="text-on-surface-variant font-title-md">
                ปลอดภัย มั่นใจ 100% | Support 24 ชั่วโมง
              </p>

              {/* Floating Product Mockups */}
              <div className="relative mt-12 mb-12 h-64 w-full flex items-center justify-center">
                {/* Photoshop Box */}
                <div className="absolute -left-4 top-10 transform -rotate-12 transition-transform hover:scale-105 duration-500 z-10">
                  <div className="w-24 h-32 glass-panel p-4 flex flex-col justify-between items-center rounded-lg shadow-sm bg-white/70 backdrop-blur border border-outline-variant/50">
                    <span className="material-symbols-outlined text-primary text-4xl">photo_filter</span>
                    <span className="font-label-sm text-xs text-on-surface">Photoshop</span>
                  </div>
                </div>

                {/* Windows 11 Box (Center) */}
                <div className="absolute z-20 top-0 transform scale-110 shadow-xl transition-transform hover:scale-115 duration-500">
                  <div className="w-40 h-56 bg-white border border-outline-variant rounded-lg p-6 flex flex-col justify-center gap-4">
                    <span className="material-symbols-outlined text-accent-electric text-6xl" style={{ fontVariationSettings: '"FILL" 1' }}>
                      window
                    </span>
                    <div className="text-left">
                      <p className="font-bold text-lg text-on-surface">Windows 11</p>
                      <p className="text-on-surface-variant text-sm">Pro Edition</p>
                    </div>
                  </div>
                </div>

                {/* Premiere Box */}
                <div className="absolute -right-4 bottom-4 transform rotate-12 transition-transform hover:scale-105 duration-500 z-10">
                  <div className="w-24 h-32 glass-panel p-4 flex flex-col justify-between items-center rounded-lg shadow-sm bg-white/70 backdrop-blur border border-outline-variant/50">
                    <span className="material-symbols-outlined text-secondary text-4xl">video_settings</span>
                    <span className="font-label-sm text-xs text-on-surface">Premiere</span>
                  </div>
                </div>
              </div>

              {/* Trust Indicators */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12">
                <div className="flex flex-col items-center gap-2">
                  <span className="material-symbols-outlined text-accent-electric">verified_user</span>
                  <span className="text-xs text-on-surface-variant">ของแท้ 100%</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <span className="material-symbols-outlined text-accent-electric">bolt</span>
                  <span className="text-xs text-on-surface-variant">ส่งคีย์ทันที</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <span className="material-symbols-outlined text-accent-electric">headset_mic</span>
                  <span className="text-xs text-on-surface-variant">บริการ 24 ชม.</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <span className="material-symbols-outlined text-accent-electric">currency_exchange</span>
                  <span className="text-xs text-on-surface-variant">คืนเงินง่าย</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel: Registration Form */}
          <div className="bg-white p-8 md:p-16">
            <div className="max-w-sm mx-auto">
              <div className="mb-10 text-center md:text-left">
                <h2 className="font-display-lg text-headline-lg text-on-surface mb-2">สมัครสมาชิก</h2>
                <p className="text-on-surface-variant font-body-md">สร้างบัญชีเพื่อสั่งซื้อและจัดการสินค้าของคุณ</p>
              </div>

              {/* Success/Error alerts */}
              {error && (
                <div className="mb-6 p-4 bg-error-container text-error text-sm rounded-lg border border-error/20 flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">error</span>
                  <span>{error}</span>
                </div>
              )}
              {success && (
                <div className="mb-6 p-4 bg-green-50 text-green-700 text-sm rounded-lg border border-green-200 flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">check_circle</span>
                  <span>{success}</span>
                </div>
              )}

              <form onSubmit={handleRegister} className="space-y-6">
                {/* Full Name */}
                <div className="space-y-2">
                  <label className="block text-on-surface font-title-md">ชื่อ-นามสกุล</label>
                  <div className="relative group">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-accent-electric transition-colors">
                      person
                    </span>
                    <input
                      name="name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full pl-12 pr-4 py-4 bg-surface-container-lowest border border-outline-variant rounded-xl focus:ring-2 focus:ring-accent-electric focus:border-accent-electric transition-all text-on-surface placeholder:text-outline-variant outline-none"
                      placeholder="กรอกชื่อ-นามสกุล"
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <label className="block text-on-surface font-title-md">อีเมล</label>
                  <div className="relative group">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-accent-electric transition-colors">
                      mail
                    </span>
                    <input
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full pl-12 pr-4 py-4 bg-surface-container-lowest border border-outline-variant rounded-xl focus:ring-2 focus:ring-accent-electric focus:border-accent-electric transition-all text-on-surface placeholder:text-outline-variant outline-none"
                      placeholder="example@domain.com"
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <label className="block text-on-surface font-title-md">รหัสผ่าน</label>
                  <div className="relative group">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-accent-electric transition-colors">
                      lock
                    </span>
                    <input
                      name="password"
                      type={showPassword ? "text" : "password"}
                      required
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full pl-12 pr-12 py-4 bg-surface-container-lowest border border-outline-variant rounded-xl focus:ring-2 focus:ring-accent-electric focus:border-accent-electric transition-all text-on-surface placeholder:text-outline-variant outline-none"
                      placeholder="กรอกรหัสผ่าน"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface outline-none"
                    >
                      <span className="material-symbols-outlined">{showPassword ? "visibility_off" : "visibility"}</span>
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div className="space-y-2">
                  <label className="block text-on-surface font-title-md">ยืนยันรหัสผ่าน</label>
                  <div className="relative group">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-accent-electric transition-colors">
                      lock_reset
                    </span>
                    <input
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      required
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="w-full pl-12 pr-12 py-4 bg-surface-container-lowest border border-outline-variant rounded-xl focus:ring-2 focus:ring-accent-electric focus:border-accent-electric transition-all text-on-surface placeholder:text-outline-variant outline-none"
                      placeholder="ยืนยันรหัสผ่าน"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface outline-none"
                    >
                      <span className="material-symbols-outlined">{showConfirmPassword ? "visibility_off" : "visibility"}</span>
                    </button>
                  </div>
                </div>

                {/* Terms checkbox */}
                <div className="flex items-start gap-3">
                  <input
                    id="terms"
                    type="checkbox"
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                    className="mt-1 rounded bg-surface-container-lowest border-outline-variant text-accent-electric focus:ring-accent-electric"
                  />
                  <label className="text-on-surface-variant text-sm cursor-pointer select-none" htmlFor="terms">
                    ฉันยอมรับ <Link className="text-accent-electric hover:underline" href="#">ข้อกำหนดและเงื่อนไข</Link> และ <Link className="text-accent-electric hover:underline" href="#">นโยบายความเป็นส่วนตัว</Link>
                  </label>
                </div>

                {/* Actions */}
                <div className="space-y-4 pt-2">
                  <button
                    type="submit"
                    className="w-full py-4 bg-accent-electric hover:bg-deep-navy text-white rounded-xl font-headline-lg-mobile transition-all active:scale-95 shadow-glow cursor-pointer"
                  >
                    สมัครสมาชิก
                  </button>

                  <div className="relative flex items-center py-4">
                    <div className="flex-grow border-t border-outline-variant"></div>
                    <span className="flex-shrink mx-4 text-on-surface-variant font-label-sm">หรือ</span>
                    <div className="flex-grow border-t border-outline-variant"></div>
                  </div>

                  <button
                    type="button"
                    className="w-full py-4 border border-outline-variant rounded-xl flex items-center justify-center gap-3 hover:bg-surface-container transition-colors text-on-surface font-title-md cursor-pointer"
                  >
                    <img
                      alt="Google Logo"
                      className="w-5 h-5"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuADRXnjycmZDXl_pcBOJIGJB6y0pMiPRQpUXMlMrFBWgbhtQHy4MiN5BM-0AAhloFTpDHRTukDn-tWoCDwlJ5gyqAPuUNxJfHjNXIn-J39NSz0M19_0YarjbiuMHzh2Xd35Hd04GQpG_acld-Wvb_oMn1iuOgWxlXZh7Qz7-d-uwIzAWpPyHBOcHGMU_3v573ZnaiI3ZoRXkaTIbkRYJzMvce8aOVCrQAXuZ36txrS-GCeylwNae-JnuyZnACF8c0gsrZZ0NAU713M"
                    />
                    <span>สมัครด้วย Google</span>
                  </button>
                </div>
              </form>

              <div className="mt-8 text-center">
                <p className="text-on-surface-variant">
                  มีบัญชีอยู่แล้ว? <Link className="text-accent-electric font-title-md hover:underline" href="/login">เข้าสู่ระบบ</Link>
                </p>
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-section-gap px-margin-desktop flex flex-col md:flex-row justify-between items-center max-w-container-max mx-auto border-t border-outline-variant bg-white">
        <div className="mb-6 md:mb-0 text-center md:text-left">
          <span className="font-title-md text-title-md text-accent-electric block mb-2 font-bold">SoftKeyStore</span>
          <p className="font-body-md text-body-md text-on-surface-variant">© 2024 SoftKeyStore. All rights reserved.</p>
        </div>
        <div className="flex flex-wrap justify-center gap-8">
          <Link className="font-body-md text-body-md text-on-surface-variant hover:text-accent-electric transition-colors" href="#">Terms of Service</Link>
          <Link className="font-body-md text-body-md text-on-surface-variant hover:text-accent-electric transition-colors" href="#">Privacy Policy</Link>
          <Link className="font-body-md text-body-md text-on-surface-variant hover:text-accent-electric transition-colors" href="#">Refund Policy</Link>
          <Link className="font-body-md text-body-md text-on-surface-variant hover:text-accent-electric transition-colors" href="#">Support</Link>
        </div>
      </footer>
    </div>
  );
}
