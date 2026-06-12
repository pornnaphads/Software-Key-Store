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

      {/* Main Content: Split Screen */}
      <main className="flex-grow flex items-stretch pt-16 min-h-[calc(100vh-64px)]">
        <div className="flex flex-col md:flex-row w-full">
          {/* Left Side: Brand Experience */}
          <section className="hidden md:flex flex-1 hero-gradient relative overflow-hidden flex-col justify-between p-12 bg-radial from-[#f0f7ff] to-white">
            {/* Background Atmospheric Glows */}
            <div className="absolute -top-24 -left-24 w-96 h-96 bg-accent-electric opacity-5 blur-[120px] rounded-full"></div>
            <div className="absolute -bottom-48 -right-48 w-[500px] h-[500px] bg-accent-electric opacity-5 blur-[150px] rounded-full"></div>

            {/* Branding & Copy */}
            <div className="relative z-10 space-y-4 max-w-lg">
              <h2 className="font-display-lg text-display-lg leading-tight text-deep-navy">
                แหล่งรวม <span className="text-accent-electric">Software License</span> แท้<br />
                <span className="text-deep-navy">ซื้อง่าย ส่งคีย์ทันที</span>
              </h2>
              <p className="font-title-md text-title-md text-on-surface-variant">
                ปลอดภัย มั่นใจ 100% | Support 24 ชั่วโมง
              </p>
            </div>

            {/* Product Showcase (Floating Cards) */}
            <div className="relative flex-grow flex items-center justify-center my-8">
              <div className="relative w-full max-w-md h-80">
                {/* Adobe Box */}
                <div className="absolute top-0 right-0 w-48 h-64 glass-panel rounded-xl rotate-12 -translate-x-8 -translate-y-4 shadow-2xl transition-transform hover:scale-105 duration-500 overflow-hidden bg-white/75 backdrop-blur border border-outline-variant">
                  <div className="bg-white h-2/3 flex items-center justify-center p-4">
                    <img
                      alt="Adobe Creative Cloud"
                      className="w-24 h-24 object-contain"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuAzkM0DQFAtUBgOEFrSxYnCMDjNdk6CwFEQynT9OoOxcYCvk_qLinQzfR-0SxjFflOoK25Bue_dRriQVY7jlAw3rzVEdEG4TsUIGGSNsGWvdFoJH4fe_cOMdtjUHVWOQLqMt8VIhSXLePsOMT547MT4X0zhnin8KGo3GvcNR4-g20MgAOBLUvguw_ytfkiPmA0EUrB2nAd4JlEXZ3MK6byNoav8zhqsb5YIfCthhLOlqISFU6YC8XP2kmVu314YlQ5DSPWm382ZgEY"
                    />
                  </div>
                  <div className="p-4 bg-surface-container-low h-1/3">
                    <p className="font-label-sm text-label-sm text-deep-navy">Adobe Suite</p>
                    <p className="text-[10px] text-on-surface-variant">Creative Cloud All Apps</p>
                  </div>
                </div>

                {/* Windows 11 Box (Center) */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-56 h-72 glass-panel rounded-xl z-20 shadow-glow border-accent-electric/20 scale-110 transition-all hover:scale-115 duration-500 overflow-hidden bg-white/75 backdrop-blur border border-outline-variant">
                  <div className="bg-white h-2/3 flex items-center justify-center p-4">
                    <img
                      alt="Windows 11 Pro"
                      className="w-32 h-32 object-contain"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuBhAuKjTqwY2OOrKWTaR6PVoPQe-ezow1zWrmUdE8sSOwd7mig0w2w9Um_b3yRMNqCbNuNI-dmENnzsoiSGetUvBytB9kv77KB3EVw7Pe9gGmm6QtLE3OxRo03neJgFrSBDOkoLTmdQ0qw8lqyKYhLN_pTb4ZI4JYSdF2ydiq1FXtBH_EM9FWlJN1gUIwSKlY-gh8ynaB-PNcOaogwsx0Na4Qi-O-JCD-4tY4AhmA-2Mu01m57WjzqrffJYjnz4FnhpS8BTK6SdHfc"
                    />
                  </div>
                  <div className="p-5 bg-white h-1/3">
                    <p className="font-title-md text-title-md text-deep-navy">Windows 11 Pro</p>
                    <p className="font-label-sm text-label-sm text-accent-electric">Genuine License</p>
                  </div>
                </div>

                {/* Office 365 Box */}
                <div className="absolute bottom-0 left-0 w-48 h-64 glass-panel rounded-xl -rotate-12 translate-x-8 translate-y-4 shadow-2xl transition-transform hover:scale-105 duration-500 overflow-hidden bg-white/75 backdrop-blur border border-outline-variant">
                  <div className="bg-white h-2/3 flex items-center justify-center p-4">
                    <img
                      alt="Microsoft 365"
                      className="w-24 h-24 object-contain"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuDBvAyvk3IPV6j3catMtIZ9AVclDsss65HhPPTZug2qyzHlP8ln4GotH4ar97sepwK6NEfS4A8QcrODV0ge4bMKP3HKVmE04fSLuwGZv4a268G0FH7wEW618ov7NWAOEMo6jX-RdBVXXPyDNMjMhdIysPjj3xitkENW7-Bf9zvE42vxtLy3UBBylWe1aJ5dcJ20BoYTpZ5mtzZxVHTyysPoCXO1Ypc1WL61GyP2e_th-cCM8rdd7KIEoYb8WPJy3odgr6Qgv04VfBU"
                    />
                  </div>
                  <div className="p-4 bg-surface-container-low h-1/3">
                    <p className="font-label-sm text-label-sm text-deep-navy">Microsoft 365</p>
                    <p className="text-[10px] text-on-surface-variant">Personal Annual Subscription</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-4 gap-4 p-6 glass-panel rounded-2xl relative z-10 bg-white/90 border border-outline-variant/30">
              <div className="flex flex-col items-center text-center space-y-2">
                <span className="material-symbols-outlined text-accent-electric" style={{ fontVariationSettings: '"FILL" 1' }}>verified_user</span>
                <p className="font-label-sm text-[10px] text-deep-navy leading-tight">ของแท้ 100%<br /><span className="text-on-surface-variant font-normal">ใช้งานได้แน่นอน</span></p>
              </div>
              <div className="flex flex-col items-center text-center space-y-2">
                <span className="material-symbols-outlined text-accent-electric" style={{ fontVariationSettings: '"FILL" 1' }}>bolt</span>
                <p className="font-label-sm text-[10px] text-deep-navy leading-tight">จัดส่งคีย์ทันที<br /><span className="text-on-surface-variant font-normal">ภายในไม่กี่นาที</span></p>
              </div>
              <div className="flex flex-col items-center text-center space-y-2">
                <span className="material-symbols-outlined text-accent-electric" style={{ fontVariationSettings: '"FILL" 1' }}>support_agent</span>
                <p className="font-label-sm text-[10px] text-deep-navy leading-tight">บริการช่วยเหลือ<br /><span className="text-on-surface-variant font-normal">ตลอด 24 ชั่วโมง</span></p>
              </div>
              <div className="flex flex-col items-center text-center space-y-2">
                <span className="material-symbols-outlined text-accent-electric" style={{ fontVariationSettings: '"FILL" 1' }}>currency_exchange</span>
                <p className="font-label-sm text-[10px] text-deep-navy leading-tight">คืนเงินง่าย<br /><span className="text-on-surface-variant font-normal">ภายใน 7 วัน</span></p>
              </div>
            </div>
          </section>

          {/* Right Side: Login Form */}
          <section className="flex-1 bg-white flex items-center justify-center p-margin-mobile md:p-12">
            <div className="w-full max-w-md space-y-8">
              {/* Heading */}
              <div className="text-center space-y-2">
                <h3 className="font-headline-lg text-headline-lg text-deep-navy">เข้าสู่ระบบ</h3>
                <p className="text-on-surface-variant text-body-md">ยินดีต้อนรับกลับมา! กรุณาเข้าสู่ระบบเพื่อใช้งาน</p>
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
          </section>
        </div>
      </main>

      {/* Footer (Simplified for Login) */}
      <footer className="bg-white border-t border-outline-variant">
        <div className="flex flex-col md:flex-row justify-between items-center py-gutter px-margin-desktop w-full max-w-container-max mx-auto">
          <p className="text-on-surface-variant text-label-sm font-label-sm opacity-80">© 2024 SoftKeyStore. All rights reserved.</p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <Link className="text-label-sm font-label-sm text-on-surface-variant hover:text-accent-electric transition-colors" href="#">Privacy Policy</Link>
            <Link className="text-label-sm font-label-sm text-on-surface-variant hover:text-accent-electric transition-colors" href="#">Terms of Service</Link>
            <Link className="text-label-sm font-label-sm text-on-surface-variant hover:text-accent-electric transition-colors" href="#">Support</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
