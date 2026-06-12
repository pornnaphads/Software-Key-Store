"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError("");
  };

  const handleGoogleLogin = () => {
    // Set a mock user cookie
    document.cookie = "mock_user=Woraphob; path=/; max-age=604800"; // 7 days
    setSuccess("เข้าสู่ระบบด้วย Google สำเร็จ!");

    // Redirect to home and reload
    router.push("/");
    setTimeout(() => {
      window.location.reload();
    }, 150);
  };

  const handleCredentialsLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const { email, password } = formData;

    if (!email || !password) {
      setError("กรุณากรอกอีเมลและรหัสผ่าน");
      return;
    }

    // Get registered users from localStorage
    const registeredUsers = JSON.parse(localStorage.getItem("mock_users") || "[]");

    // Check credentials
    const user = registeredUsers.find(
      (u: any) => u.email === email && u.password === password
    );

    if (user) {
      document.cookie = `mock_user=${encodeURIComponent(user.name)}; path=/; max-age=604800`; // 7 days
      setSuccess("เข้าสู่ระบบสำเร็จ! กำลังไปหน้าแรก...");
      router.push("/");
      setTimeout(() => {
        window.location.reload();
      }, 150);
    } else {
      setError("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafb] text-[#191c1d] font-body-md antialiased">
      {/* TopAppBar */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-outline-variant">
        <div className="flex justify-between items-center w-full px-margin-desktop h-16 max-w-container-max mx-auto">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-accent-electric text-3xl" style={{ fontVariationSettings: '"FILL" 1' }}>
              shopping_bag
            </span>
            <h1 className="text-title-md font-title-md font-bold text-accent-electric">SoftKeyStore</h1>
          </div>
          <Link className="flex items-center gap-2 text-on-surface-variant hover:text-accent-electric transition-colors group" href="/">
            <span className="material-symbols-outlined text-sm group-hover:-translate-x-1 transition-transform">
              arrow_back
            </span>
            <span className="font-label-sm text-label-sm">Back to Home</span>
          </Link>
        </div>
      </header>

      {/* Main Content: Centered Layout */}
      <main className="flex-grow flex items-center justify-center pt-24 pb-12 px-margin-mobile relative bg-[#f8fafb]">
        {/* Background Atmospheric Glows for premium feel */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent-electric opacity-5 blur-[120px] rounded-full pointer-events-none"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-accent-electric opacity-5 blur-[150px] rounded-full pointer-events-none"></div>

        {/* Login Card */}
        <div className="w-full max-w-md p-8 bg-white border border-outline-variant/50 rounded-2xl shadow-glow relative z-10">
          <div className="space-y-8">
            {/* Heading */}
            <div className="text-center space-y-2">
              <h3 className="font-headline-lg text-headline-lg text-deep-navy font-bold">เข้าสู่ระบบ</h3>
            </div>

            {/* Tabs */}
            <div className="flex p-1 bg-surface-container-low rounded-lg">
              <button type="button" className="flex-1 py-2 px-4 rounded-md bg-accent-electric text-white font-medium shadow-sm transition-all cursor-default">
                เข้าสู่ระบบ
              </button>
              <Link href="/register" className="flex-1 py-2 px-4 rounded-md text-on-surface-variant font-medium hover:text-accent-electric transition-all text-center">
                สมัครสมาชิก
              </Link>
            </div>

            {/* Success/Error Alerts */}
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

            {/* Form */}
            <form onSubmit={handleCredentialsLogin} className="space-y-6">
              <div className="space-y-2">
                <label className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">อีเมล</label>
                <div className="relative group">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-on-surface-variant">
                    mail
                  </span>
                  <input
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full pl-12 pr-4 py-3 bg-surface-dim border border-outline-variant rounded-lg focus:ring-2 focus:ring-accent-electric focus:border-accent-electric transition-all text-on-surface placeholder:text-outline outline-none"
                    placeholder="example@domain.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">รหัสผ่าน</label>
                <div className="relative group">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-on-surface-variant">
                    lock
                  </span>
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full pl-12 pr-12 py-3 bg-surface-dim border border-outline-variant rounded-lg focus:ring-2 focus:ring-accent-electric focus:border-accent-electric transition-all text-on-surface placeholder:text-outline outline-none"
                    placeholder="กรอกรหัสผ่าน"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-on-surface-variant hover:text-accent-electric outline-none"
                  >
                    {showPassword ? "visibility_off" : "visibility"}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Link className="text-body-md text-accent-electric hover:underline font-medium" href="#">
                  ลืมรหัสผ่าน?
                </Link>
              </div>

              <button
                type="submit"
                className="w-full py-4 bg-accent-electric text-white font-bold rounded-lg shadow-lg hover:brightness-110 active:scale-[0.98] transition-all cursor-pointer"
              >
                เข้าสู่ระบบ
              </button>
            </form>

            {/* Divider */}
            <div className="relative flex items-center gap-4">
              <div className="flex-grow h-px bg-outline-variant"></div>
              <span className="text-on-surface-variant text-label-sm font-medium">หรือ</span>
              <div className="flex-grow h-px bg-outline-variant"></div>
            </div>

            {/* Google Sign In */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              className="w-full py-3 flex items-center justify-center gap-3 border border-outline-variant rounded-lg hover:bg-surface-container-low transition-all group cursor-pointer"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"></path>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
              </svg>
              <span className="text-on-surface font-medium">เข้าสู่ระบบด้วย Google</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
