"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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

    const { firstName, lastName, email, password, confirmPassword } = formData;

    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      setError("กรุณากรอกข้อมูลให้ครบทุกช่อง");
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
    const name = `${firstName} ${lastName}`.trim();
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
      <main className="flex-grow flex items-center justify-center pt-24 pb-12 px-margin-mobile relative bg-[#f8f9fa]">
        {/* Background Atmospheric Glows for premium feel */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent-electric opacity-5 blur-[120px] rounded-full pointer-events-none"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-accent-electric opacity-5 blur-[150px] rounded-full pointer-events-none"></div>

        {/* Registration Card */}
        <div className="w-full max-w-md p-8 bg-white border border-outline-variant/50 rounded-2xl shadow-glow relative z-10">
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="font-display-lg text-headline-lg text-on-surface mb-2 font-bold">สมัครสมาชิก</h2>
            </div>

            {/* Success/Error alerts */}
            {error && (
              <div className="p-4 bg-error-container text-error text-sm rounded-lg border border-error/20 flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">error</span>
                <span>{error}</span>
              </div>
            )}
            {success && (
              <div className="p-4 bg-green-50 text-green-700 text-sm rounded-lg border border-green-200 flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">check_circle</span>
                <span>{success}</span>
              </div>
            )}

            <form onSubmit={handleRegister} className="space-y-6">
              {/* First Name & Last Name (Side by Side) */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-on-surface font-title-md font-bold text-sm">ชื่อ</label>
                  <div className="relative group">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-accent-electric transition-colors">
                      person
                    </span>
                    <input
                      name="firstName"
                      type="text"
                      required
                      value={formData.firstName}
                      onChange={handleChange}
                      className="w-full pl-12 pr-4 py-4 bg-surface-container-lowest border border-outline-variant rounded-xl focus:ring-2 focus:ring-accent-electric focus:border-accent-electric transition-all text-on-surface placeholder:text-outline-variant outline-none"
                      placeholder="ชื่อ"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-on-surface font-title-md font-bold text-sm">นามสกุล</label>
                  <div className="relative group">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-accent-electric transition-colors">
                      person
                    </span>
                    <input
                      name="lastName"
                      type="text"
                      required
                      value={formData.lastName}
                      onChange={handleChange}
                      className="w-full pl-12 pr-4 py-4 bg-surface-container-lowest border border-outline-variant rounded-xl focus:ring-2 focus:ring-accent-electric focus:border-accent-electric transition-all text-on-surface placeholder:text-outline-variant outline-none"
                      placeholder="นามสกุล"
                    />
                  </div>
                </div>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label className="block text-on-surface font-title-md font-bold text-sm">อีเมล</label>
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
                <label className="block text-on-surface font-title-md font-bold text-sm">รหัสผ่าน</label>
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
                <label className="block text-on-surface font-title-md font-bold text-sm">ยืนยันรหัสผ่าน</label>
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

              {/* Actions */}
              <div className="space-y-4 pt-2">
                <button
                  type="submit"
                  className="w-full py-4 bg-accent-electric hover:bg-deep-navy text-white rounded-xl font-headline-lg-mobile transition-all active:scale-95 shadow-glow cursor-pointer"
                >
                  สมัครสมาชิก
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
      </main>
    </div>
  );
}
