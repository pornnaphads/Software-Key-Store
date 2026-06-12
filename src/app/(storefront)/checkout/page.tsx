"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

interface CartItem {
  id: number;
  name: string;
  category: string;
  price: number;
  quantity: number;
  image: string | null;
}

export default function CheckoutPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<"qr" | "card">("qr");
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [prioritySupport, setPrioritySupport] = useState(false);

  useEffect(() => {
    const localCart = localStorage.getItem("softkeystore_cart");
    if (localCart) {
      try {
        setCartItems(JSON.parse(localCart));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const getProductImageUrl = (imageKey: string | null) => {
    switch (imageKey) {
      case "windows11_pro":
        return "https://lh3.googleusercontent.com/aida-public/AB6AXuDDWLJ6QSMy1cu6vJUYlJjfoqycHgEmWl6c9ygbiP3GhS36f0UegZOjJxrAYOuh_UDspWBnYnbkQJLUPmJXsiUj999KHZoEuKcIJVtAqHxGaFrDf7rzbVzAFZIMNEHyeivFxHKwCpRgeA4ihNMz51-enReCUMMFvEh_NCE_nfUyKgbER6Mlg4GOrAEjHBPd0rJhMLxRyWb9zJ6NvXMUgix7VlYDqCP61gcONZADVfcBTDPmsOD0D2DnRBeGMxoH0e0kX2Y9CyKmUNc";
      case "windows10_pro":
        return "https://lh3.googleusercontent.com/aida-public/AB6AXuC599x6u026PR1VcBtmiwrarjZfC0F5UkLn5CzBXY_VNbTs3hj6n5qWA0HMIRL7hViRW6o4fhNOq4jehzyt4qkiThtaf47pSq8eXk--POQNM-6gHGf0OtPOmtzoREHV7gwTnLwo-FQ0-ZUr3ys2bF6h2Nbsx_Z9E8KPgLYbxiD91krQgA44b_0PyQJIAb4ZMgWi7k7El9Cu7txUdrlfww9GRnc-GYCqPO5eyEkMVoqrvnsRtSw33pdHSNwOTdFL5hWobKCFnLYBs4g";
      case "office2021_pro":
        return "https://lh3.googleusercontent.com/aida-public/AB6AXuDJD5aOi7vQ97xqdV6lcOz0f7MghOhZ8Bcfpf5Gz6i7VF9VrEvvSkcSBhhq63cslC5IOV_pFsI-wPxX-W-FaoWT_QTaSVAlO6yOpKLgjdM1lvaTaVn15KVBR4lOlxA5UuUOZ6aykYOwDh6KcrhhSwYceLHccZj4GDG1llWYyk6PM6fC_146fZfmsejjC6BmNxXSK_siQx0dV3I1nDV5YITwS57L6wzRklOWzGt85zMdFaSGtT_NWG2jG0-bQ37b73JDP-Mtt6nFedA";
      case "adobe_cc":
        return "https://lh3.googleusercontent.com/aida-public/AB6AXuCvw70axZW-PHlFXlHge1HuTJ3iCE0HRikg3Lr0hZryzTQBfg5NQD8e7jMa1J_XRsYgpUOyKfRBu8R-XDx5KIKhXcDpLmpa5kEiaxPD59Eejuqj6CpSTQ5FHUHfq8ohv_x_JtmlmE-jHwEOUsMmZ6-5tshINj3upg9Cyb42EU9MZukgDhdszfDccZDp7AeQxQV-K17qgPd5mXOPLr23Ke_NXnoJetHfHFRQWbVvrwCGGPz-VWsK4YXjWDWi0yALe56KEBkBoFBck2k";
      case "kaspersky_total":
        return "https://lh3.googleusercontent.com/aida-public/AB6AXuD_HjpGM7H2ru4fG9bb7aXWvXDdPNRgrdVZfXVu5WGdYKwPxRFB5PNS69tKnc8_WLkOjEE5qn_NhEYHnEGMD5WMQdUa7DS3GhZetMDmGORcyPhLXlYwo1ZgLU526HuY1nrmAmmki5V9KiEp1V1WohZcYDLaQSs03bXD85Y4JjOcPNXBelF-GZvJoAPVSRCSXSFUOsb3gjADQT1Q6Gbc2LOVdMz3p-ItnCnL4QF6OKOCgwPEs2mL6BhSuoti2U737-kht_xuypjmk1c";
      default:
        return "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80";
    }
  };

  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const supportPrice = prioritySupport ? 150 : 0;
  const finalTotal = subtotal + supportPrice;

  const handleConfirmPayment = (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      alert("กรุณากรอกอีเมลสำหรับจัดส่งคีย์");
      return;
    }

    alert(`การชำระเงินเรียบร้อยแล้ว! รหัสคีย์ลิขสิทธิ์ซอฟต์แวร์ถูกจัดส่งไปยังอีเมล: ${email} ของคุณเรียบร้อยแล้ว`);
    localStorage.removeItem("softkeystore_cart");
    window.location.href = "/profile";
  };

  return (
    <main className="relative mt-24 mb-16 max-w-[1280px] mx-auto px-4 md:px-10 hero-glow min-h-screen w-full">
      {/* Page Title */}
      <header className="mb-12">
        <h1 className="font-display-lg text-headline-lg text-primary mb-2 font-bold">Checkout</h1>
        <p className="text-on-surface-variant text-sm">Secure your digital license with premium encryption.</p>
      </header>

      <form onSubmit={handleConfirmPayment} className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
        {/* Left Column: Payment & Billing */}
        <div className="lg:col-span-7 space-y-8">
          {/* Payment Method Selection */}
          <section className="glass-panel rounded-xl p-8 border border-outline-variant/30">
            <div className="flex items-center gap-3 mb-8">
              <span className="material-symbols-outlined text-accent-electric text-xl font-bold">payments</span>
              <h2 className="font-title-md text-title-md text-on-surface font-bold text-sm">เลือกวิธีการชำระเงิน</h2>
            </div>

            {/* Payment Tabs */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <button
                type="button"
                onClick={() => setPaymentMethod("qr")}
                className={`flex flex-col items-center justify-center p-4 border rounded-lg transition-all glow-hover cursor-pointer ${
                  paymentMethod === "qr"
                    ? "border-accent-electric bg-accent-electric/5"
                    : "border-outline-variant/30 text-on-surface-variant"
                }`}
              >
                <span className={`material-symbols-outlined text-3xl mb-2 ${paymentMethod === "qr" ? "text-accent-electric" : ""}`}>
                  qr_code_2
                </span>
                <span className="text-xs font-semibold text-on-surface">Thai QR Payment</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod("card")}
                className={`flex flex-col items-center justify-center p-4 border rounded-lg transition-all glow-hover cursor-pointer ${
                  paymentMethod === "card"
                    ? "border-accent-electric bg-accent-electric/5"
                    : "border-outline-variant/30 text-on-surface-variant"
                }`}
              >
                <span className={`material-symbols-outlined text-3xl mb-2 ${paymentMethod === "card" ? "text-accent-electric" : ""}`}>
                  credit_card
                </span>
                <span className="text-xs font-semibold text-on-surface">Credit / Debit Card</span>
              </button>
            </div>

            {/* QR Content */}
            {paymentMethod === "qr" && (
              <div className="flex flex-col items-center justify-center py-6">
                <div className="bg-white p-4 rounded-xl mb-4 border border-outline-variant/20 shadow-sm">
                  <img
                    alt="Thai QR Payment"
                    className="w-48 h-48"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDS-LDcrofKrqa8o-WhKXqvd8dYDwql7-f9fRHBFxhkEbNTfGsITkMtPVVUR3BdHBXInc80_aqztyBMdURp-HAKgWRAgJFktya7dbbbsURHxxO35S4c8h-2QAOJ5pbC5PR7QJQjjnSFgt982D-fmLu3lFRmnBAkeks2t3VKF6XAd4ir6qWJD8fFpVykforX8XA5AdE7TBGweIwHgKPeminBfLU5Wu_1OhOtvp2TXQTtTgvqT-kVkl2e9yASRxLGWRKEw_fANA-Vuf4"
                  />
                </div>
                <div className="flex items-center gap-4">
                  <img
                    alt="PromptPay"
                    className="h-6"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBigu8S8aCkSQAjcPoXKBI1-rqzLpjJ_CXBLqWHduQNcJAsNeKj8xkclfZW84IU9CGHNdpezsA-pTjHam3hoJy3bEpBo_DbDOiPyLbJKAZId3ZXKkXWXWYKHyBW50GvtPhdyhWC3Gv9yitZh7lOgY9Iqtofjsn8nIz6ZyXamf50VXqKTF8Xib_CL8u7lx6dnsD3Rj3KXu4iuIU3HY4smDShCcDaKNWygpZ5j1F3uX6EPe-hbWWM-mQ8A19S3MGLg3-pDpHH-E3BuDs"
                  />
                  <span className="text-[10px] text-on-surface-variant font-label-sm uppercase font-semibold">
                    Scan with any Mobile Banking App
                  </span>
                </div>
              </div>
            )}

            {/* Card Content */}
            {paymentMethod === "card" && (
              <div className="space-y-6">
                <div className="flex gap-4 mb-4">
                  <span className="material-symbols-outlined text-3xl text-primary font-bold">credit_card</span>
                  <span className="text-sm font-semibold text-on-surface-variant flex items-center">We accept Visa & Mastercard</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-label-sm text-on-surface-variant mb-2 uppercase font-bold">Card Number</label>
                    <input
                      className="w-full bg-white border border-outline-variant/40 rounded-lg px-4 py-2.5 text-sm text-on-surface focus:border-accent-electric focus:ring-1 focus:ring-accent-electric outline-none"
                      placeholder="XXXX XXXX XXXX XXXX"
                      type="text"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-label-sm text-on-surface-variant mb-2 uppercase font-bold">Expiry Date</label>
                    <input
                      className="w-full bg-white border border-outline-variant/40 rounded-lg px-4 py-2.5 text-sm text-on-surface focus:border-accent-electric focus:ring-1 focus:ring-accent-electric outline-none"
                      placeholder="MM / YY"
                      type="text"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-label-sm text-on-surface-variant mb-2 uppercase font-bold">CVV</label>
                    <input
                      className="w-full bg-white border border-outline-variant/40 rounded-lg px-4 py-2.5 text-sm text-on-surface focus:border-accent-electric focus:ring-1 focus:ring-accent-electric outline-none"
                      placeholder="***"
                      type="password"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-label-sm text-on-surface-variant mb-2 uppercase font-bold">Cardholder Name</label>
                    <input
                      className="w-full bg-white border border-outline-variant/40 rounded-lg px-4 py-2.5 text-sm text-on-surface focus:border-accent-electric focus:ring-1 focus:ring-accent-electric outline-none"
                      placeholder="Full Name as on card"
                      type="text"
                    />
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* Billing Address */}
          <section className="glass-panel rounded-xl p-8 border border-outline-variant/30">
            <div className="flex items-center gap-3 mb-6">
              <span className="material-symbols-outlined text-accent-electric text-xl font-bold">contact_mail</span>
              <h2 className="font-title-md text-title-md text-on-surface font-bold text-sm">ข้อมูลติดต่อและที่อยู่ใบเสร็จ</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-[10px] font-label-sm text-on-surface-variant mb-2 uppercase font-bold">
                  Email Address (License will be sent here)
                </label>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white border border-outline-variant/40 rounded-lg px-4 py-2.5 text-sm text-on-surface focus:border-accent-electric focus:ring-1 focus:ring-accent-electric outline-none"
                  placeholder="you@example.com"
                  required
                  type="email"
                />
              </div>
              <div>
                <label className="block text-[10px] font-label-sm text-on-surface-variant mb-2 uppercase font-bold">First Name</label>
                <input
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full bg-white border border-outline-variant/40 rounded-lg px-4 py-2.5 text-sm text-on-surface focus:border-accent-electric focus:ring-1 focus:ring-accent-electric outline-none"
                  placeholder="John"
                  required
                  type="text"
                />
              </div>
              <div>
                <label className="block text-[10px] font-label-sm text-on-surface-variant mb-2 uppercase font-bold">Last Name</label>
                <input
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full bg-white border border-outline-variant/40 rounded-lg px-4 py-2.5 text-sm text-on-surface focus:border-accent-electric focus:ring-1 focus:ring-accent-electric outline-none"
                  placeholder="Doe"
                  required
                  type="text"
                />
              </div>
            </div>
          </section>
        </div>

        {/* Right Column: Order Summary */}
        <div className="lg:col-span-5">
          <div className="glass-panel rounded-xl p-8 sticky top-24 border border-outline-variant/30">
            <h2 className="font-title-md text-title-md text-on-surface mb-8 pb-4 border-b border-outline-variant/30 font-bold text-sm">
              สรุปรายการสั่งซื้อ
            </h2>

            {cartItems.length === 0 ? (
              <p className="text-on-surface-variant text-sm italic">ไม่มีสินค้าในตะกร้า</p>
            ) : (
              <div className="space-y-6 mb-8 max-h-[300px] overflow-y-auto pr-2">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    <div className="w-16 h-20 bg-surface-container flex-shrink-0 rounded-lg overflow-hidden border border-outline-variant/30">
                      <img
                        alt={item.name}
                        className="w-full h-full object-cover"
                        src={getProductImageUrl(item.image)}
                      />
                    </div>
                    <div className="flex-grow">
                      <h3 className="text-xs text-on-surface font-semibold line-clamp-2">{item.name}</h3>
                      <div className="flex justify-between items-center mt-1">
                        <p className="text-xs text-on-surface-variant">Qty: {item.quantity}</p>
                        <p className="font-label-sm text-primary font-bold text-xs">
                          ฿{(item.price * item.quantity).toLocaleString()}
                        </p>
                      </div>
                      <div className="mt-2">
                        <span className="px-2 py-0.5 bg-primary-container text-primary text-[9px] rounded uppercase font-bold">
                          Lifetime License
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Add-ons checkbox priority support */}
            <div className="mb-8 p-4 bg-surface-container rounded-lg border border-outline-variant/40 border-dashed">
              <label className="flex justify-between items-center text-sm cursor-pointer select-none">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={prioritySupport}
                    onChange={(e) => setPrioritySupport(e.target.checked)}
                    className="rounded border-outline-variant text-accent-electric focus:ring-accent-electric bg-surface-container-low"
                  />
                  <span className="text-on-surface-variant italic text-xs font-semibold">Add priority support?</span>
                </div>
                <span className="text-accent-electric font-semibold text-xs">+ 150.00 ฿</span>
              </label>
            </div>

            {/* Totals */}
            <div className="space-y-3 pt-6 border-t border-outline-variant/30">
              <div className="flex justify-between text-on-surface-variant text-xs font-medium">
                <span>Subtotal</span>
                <span>฿{subtotal.toLocaleString()}</span>
              </div>
              {prioritySupport && (
                <div className="flex justify-between text-on-surface-variant text-xs font-medium">
                  <span>Priority Support</span>
                  <span>฿150.00</span>
                </div>
              )}
              <div className="flex justify-between text-on-surface-variant text-xs font-medium">
                <span>Tax (0%)</span>
                <span>฿0.00</span>
              </div>
              <div className="flex justify-between text-lg font-bold text-primary mt-4 border-t border-outline-variant/30 pt-4">
                <span>Total</span>
                <span>฿{finalTotal.toLocaleString()}</span>
              </div>
            </div>

            {/* Action Button */}
            <button
              type="submit"
              className="w-full mt-10 py-4 bg-accent-electric text-white rounded-xl font-headline-lg text-sm shadow-lg hover:shadow-xl hover:brightness-105 active:scale-[0.98] transition-all flex items-center justify-center gap-3 cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm">lock</span>
              ยืนยันการชำระเงิน
            </button>

            <div className="mt-6 flex items-center justify-center gap-2 text-on-surface-variant text-[10px] font-bold">
              <span className="material-symbols-outlined text-xs">verified_user</span>
              Secure 256-bit SSL Encrypted Transaction
            </div>
          </div>
        </div>
      </form>
    </main>
  );
}
