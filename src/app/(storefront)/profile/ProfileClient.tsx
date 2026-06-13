"use client";

import React, { useEffect, useState } from "react";
import { signOut } from "next-auth/react";

interface Order {
  id: string;
  productName: string;
  subtitle: string;
  price: string;
  date: string;
  time: string;
  expiryDate: string;
  expiryTime: string;
  status: string;
  key: string;
  keyDisplay: string;
  reviewed: boolean;
  rating: number;
  image: string;
}

interface ProfileClientProps {
  userId: string;
  userName: string;
  userEmail: string;
  userRole: string;
}

type Tab = "profile" | "orders";

export function ProfileClient({
  userId,
  userName,
  userEmail,
  userRole,
}: ProfileClientProps) {
  const [tab, setTab] = useState<Tab>("profile");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeOrderForReview, setActiveOrderForReview] = useState<string | null>(null);
  const [reviewInput, setReviewInput] = useState("");
  const [copyMessage, setCopyMessage] = useState<string | null>(null);

  // ดึง orders จาก DB ตาม session userId (ไม่ใช้ mock)
  useEffect(() => {
    setLoadingOrders(true);
    fetch("/api/orders")
      .then((r) => r.json())
      .then((data) => setOrders(data.orders ?? []))
      .catch(() => setOrders([]))
      .finally(() => setLoadingOrders(false));
  }, [userId]);

  const filteredOrders = searchQuery
    ? orders.filter((o) =>
        o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.productName.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : orders;

  const handleSignOut = () => {
    document.cookie = "mock_user=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
    signOut({ callbackUrl: "/" });
  };

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key).then(() => {
      setCopyMessage("คัดลอกสำเร็จ!");
      setTimeout(() => setCopyMessage(null), 2000);
    });
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewInput.trim()) return;
    setOrders((prev) =>
      prev.map((o) =>
        o.id === activeOrderForReview ? { ...o, reviewed: true } : o,
      ),
    );
    setActiveOrderForReview(null);
    setReviewInput("");
  };

  const avatarInitial = userName.slice(0, 1).toUpperCase();
  const isAdmin = userRole === "ADMIN";

  return (
    <div className="bg-[#fdfbff] text-[#1b1b1f] font-body-md antialiased min-h-screen">
      <main className="max-w-container-max mx-auto px-margin-desktop pt-32 pb-section-gap flex flex-col lg:flex-row gap-gutter">

        {/* ── Sidebar ── */}
        <aside className="w-full lg:w-72 flex-shrink-0 space-y-5">

          {/* Avatar + ชื่อ */}
          <div className="glass-panel p-6 rounded-2xl bg-white shadow-sm border border-outline-variant/30 flex flex-col items-center gap-3 text-center">
            <div className="w-16 h-16 rounded-full bg-accent-electric flex items-center justify-center text-white text-2xl font-bold shadow-md">
              {avatarInitial}
            </div>
            <div>
              <p className="font-bold text-on-surface text-base">{userName}</p>
              <p className="text-xs text-on-surface-variant mt-0.5">{userEmail}</p>
              <span className={`inline-block mt-2 text-[11px] font-semibold px-2 py-0.5 rounded-full ${isAdmin ? "bg-red-100 text-red-600" : "bg-blue-100 text-blue-600"}`}>
                {isAdmin ? "ผู้ดูแลระบบ" : "สมาชิก"}
              </span>
            </div>
          </div>

          {/* Navigation */}
          <div className="glass-panel p-2 rounded-xl bg-white shadow-sm border border-outline-variant/30">
            <nav className="flex flex-col gap-1">
              <button
                type="button"
                onClick={() => setTab("profile")}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-left outline-none transition-all ${
                  tab === "profile"
                    ? "bg-accent-electric/10 text-accent-electric border-r-4 border-accent-electric"
                    : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low"
                }`}
              >
                <span className="material-symbols-outlined">person</span>
                <span>ข้อมูลส่วนตัว</span>
              </button>
              <button
                type="button"
                onClick={() => setTab("orders")}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-left outline-none transition-all ${
                  tab === "orders"
                    ? "bg-accent-electric/10 text-accent-electric border-r-4 border-accent-electric"
                    : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low"
                }`}
              >
                <span className="material-symbols-outlined">history</span>
                <span>ประวัติการสั่งซื้อ</span>
                {orders.length > 0 && (
                  <span className="ml-auto bg-accent-electric text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                    {orders.length}
                  </span>
                )}
              </button>
              <hr className="my-1 border-outline-variant opacity-30" />
              <button
                onClick={handleSignOut}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-error hover:bg-error-container transition-all text-left outline-none cursor-pointer w-full"
              >
                <span className="material-symbols-outlined">logout</span>
                <span>ออกจากระบบ</span>
              </button>
            </nav>
          </div>

          {/* Trust badge */}
          <div className="glass-panel p-5 rounded-xl bg-white shadow-sm border border-outline-variant/30 relative overflow-hidden group">
            <div className="absolute -right-3 -bottom-3 opacity-10 group-hover:scale-110 transition-transform duration-700">
              <span className="material-symbols-outlined text-accent-electric text-[80px]" style={{ fontVariationSettings: '"FILL" 1' }}>
                verified
              </span>
            </div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-full bg-accent-electric flex items-center justify-center">
                <span className="material-symbols-outlined text-white text-sm" style={{ fontVariationSettings: '"FILL" 1' }}>check_circle</span>
              </div>
              <h4 className="font-bold text-on-surface text-sm">ของแท้ 100%</h4>
            </div>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              ทุกซอฟต์แวร์ที่เราจัดจำหน่ายเป็นลิขสิทธิ์แท้พร้อมรับประกัน
            </p>
          </div>
        </aside>

        {/* ── Main Content ── */}
        <div className="flex-grow space-y-6">

          {/* ── แท็บ: ข้อมูลส่วนตัว ── */}
          {tab === "profile" && (
            <section className="glass-panel p-8 rounded-2xl bg-white shadow-sm border border-outline-variant/30 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-56 h-56 bg-accent-electric/5 blur-[80px] -z-10" />
              <h2 className="text-xl font-bold text-on-surface mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-accent-electric">person</span>
                ข้อมูลส่วนตัว
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* ชื่อ */}
                <div className="space-y-1.5">
                  <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wide">ชื่อ-นามสกุล</p>
                  <div className="flex items-center gap-2 px-4 py-3 bg-surface-container-low rounded-xl border border-outline-variant/30">
                    <span className="material-symbols-outlined text-sm text-on-surface-variant">badge</span>
                    <span className="text-sm font-medium text-on-surface">{userName}</span>
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                  <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wide">อีเมล</p>
                  <div className="flex items-center gap-2 px-4 py-3 bg-surface-container-low rounded-xl border border-outline-variant/30">
                    <span className="material-symbols-outlined text-sm text-on-surface-variant">mail</span>
                    <span className="text-sm font-medium text-on-surface">{userEmail}</span>
                  </div>
                </div>

                {/* Role */}
                <div className="space-y-1.5">
                  <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wide">ประเภทบัญชี</p>
                  <div className="flex items-center gap-2 px-4 py-3 bg-surface-container-low rounded-xl border border-outline-variant/30">
                    <span className="material-symbols-outlined text-sm text-on-surface-variant">
                      {isAdmin ? "admin_panel_settings" : "person"}
                    </span>
                    <span className={`text-sm font-medium ${isAdmin ? "text-red-600" : "text-accent-electric"}`}>
                      {isAdmin ? "ผู้ดูแลระบบ (Admin)" : "ผู้ใช้งานทั่วไป (Customer)"}
                    </span>
                  </div>
                </div>

                {/* รหัสสมาชิก */}
                <div className="space-y-1.5">
                  <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wide">รหัสสมาชิก</p>
                  <div className="flex items-center gap-2 px-4 py-3 bg-surface-container-low rounded-xl border border-outline-variant/30">
                    <span className="material-symbols-outlined text-sm text-on-surface-variant">tag</span>
                    <span className="text-sm font-medium text-on-surface font-mono">#{userId.padStart(6, "0")}</span>
                  </div>
                </div>
              </div>

              {/* สถิติ */}
              <div className="mt-8 pt-6 border-t border-outline-variant/30 grid grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-accent-electric">{orders.length}</p>
                  <p className="text-xs text-on-surface-variant mt-1">คำสั่งซื้อทั้งหมด</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-accent-electric">
                    {orders.filter((o) => o.status === "สำเร็จ").length}
                  </p>
                  <p className="text-xs text-on-surface-variant mt-1">สำเร็จ</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-accent-electric">
                    {orders.filter((o) => o.status === "รอดำเนินการ").length}
                  </p>
                  <p className="text-xs text-on-surface-variant mt-1">รอดำเนินการ</p>
                </div>
              </div>
            </section>
          )}

          {/* ── แท็บ: ประวัติการสั่งซื้อ ── */}
          {tab === "orders" && (
            <section className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h2 className="text-xl font-bold text-on-surface flex items-center gap-2">
                  <span className="material-symbols-outlined text-accent-electric">history</span>
                  ประวัติการสั่งซื้อ
                </h2>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm">search</span>
                  <input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 pr-4 py-2 bg-white border border-outline-variant rounded-xl text-sm focus:ring-1 focus:ring-accent-electric outline-none w-full sm:w-56 text-on-surface"
                    placeholder="ค้นหาคำสั่งซื้อ..."
                    type="text"
                  />
                </div>
              </div>

              {loadingOrders ? (
                <div className="text-center py-16">
                  <span className="ui-spinner" />
                  <p className="mt-3 text-sm text-on-surface-variant">กำลังโหลดประวัติ...</p>
                </div>
              ) : filteredOrders.length === 0 ? (
                <div className="text-center py-16 border border-dashed border-outline-variant rounded-2xl">
                  <span className="material-symbols-outlined text-4xl text-on-surface-variant/40 mb-3">receipt_long</span>
                  <p className="font-medium text-on-surface-variant">
                    {searchQuery ? "ไม่พบคำสั่งซื้อที่ค้นหา" : "ยังไม่มีประวัติการสั่งซื้อ"}
                  </p>
                  {!searchQuery && (
                    <p className="text-sm text-on-surface-variant/60 mt-1">
                      เมื่อคุณชำระเงินสำเร็จ คำสั่งซื้อจะปรากฏที่นี่
                    </p>
                  )}
                </div>
              ) : (
                <div className="overflow-x-auto rounded-2xl glass-panel bg-white shadow-sm border border-outline-variant/30">
                  <table className="w-full text-left border-collapse min-w-[700px]">
                    <thead>
                      <tr className="border-b border-outline-variant/30">
                        <th className="px-5 py-4 font-bold text-on-surface-variant text-[12px] whitespace-nowrap">คำสั่งซื้อ</th>
                        <th className="px-5 py-4 font-bold text-on-surface-variant text-[12px] whitespace-nowrap">สินค้า</th>
                        <th className="px-5 py-4 font-bold text-on-surface-variant text-[12px] whitespace-nowrap uppercase">License Key</th>
                        <th className="px-5 py-4 font-bold text-on-surface-variant text-[12px] whitespace-nowrap">ราคา</th>
                        <th className="px-5 py-4 font-bold text-on-surface-variant text-[12px] whitespace-nowrap">วันที่ซื้อ</th>
                        <th className="px-5 py-4 font-bold text-on-surface-variant text-[12px] whitespace-nowrap">สถานะ</th>
                        <th className="px-5 py-4 font-bold text-on-surface-variant text-[12px] whitespace-nowrap">รีวิว</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant/20">
                      {filteredOrders.map((order) => (
                        <tr key={order.id} className="hover:bg-surface-container-low/50 transition-colors">
                          <td className="px-5 py-5 align-top">
                            <span className="font-bold text-accent-electric text-[13px]">{order.id}</span>
                          </td>
                          <td className="px-5 py-5 align-top">
                            <div className="flex items-start gap-3">
                              <div className="w-9 h-9 border border-outline-variant/30 rounded-lg flex items-center justify-center p-1 overflow-hidden flex-shrink-0 bg-white">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img alt={order.productName} className="w-full h-full object-contain" src={order.image} />
                              </div>
                              <div>
                                <p className="font-medium text-[13px] text-on-surface">{order.productName}</p>
                                <p className="text-[11px] text-on-surface-variant">{order.subtitle}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-5 align-top">
                            <div className="flex items-start gap-2">
                              <div className="bg-surface-container px-2.5 py-1.5 rounded-lg text-[11px] text-on-surface-variant font-mono whitespace-pre-wrap leading-relaxed">
                                {order.keyDisplay}
                              </div>
                              <button
                                onClick={() => handleCopyKey(order.key)}
                                className="text-accent-electric hover:scale-110 transition-transform outline-none cursor-pointer pt-1.5"
                                title="คัดลอก"
                              >
                                <span className="material-symbols-outlined text-[16px]">content_copy</span>
                              </button>
                            </div>
                          </td>
                          <td className="px-5 py-5 align-top">
                            <span className="text-[13px] font-semibold text-on-surface">{order.price}</span>
                          </td>
                          <td className="px-5 py-5 align-top">
                            <p className="text-[12px] text-on-surface font-medium">{order.date}</p>
                            <p className="text-[11px] text-on-surface-variant">{order.time}</p>
                          </td>
                          <td className="px-5 py-5 align-top">
                            <span className={`inline-block text-[11px] font-bold px-2 py-0.5 rounded-full ${
                              order.status === "สำเร็จ"
                                ? "bg-green-100 text-green-700"
                                : order.status === "รอดำเนินการ"
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-red-100 text-red-700"
                            }`}>
                              {order.status}
                            </span>
                          </td>
                          <td className="px-5 py-5 align-top">
                            <div className="flex gap-0.5">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <span
                                  key={star}
                                  className="material-symbols-outlined text-[16px] text-amber-400 cursor-pointer hover:scale-110 transition-transform"
                                  style={{ fontVariationSettings: star <= order.rating ? '"FILL" 1' : '"FILL" 0' }}
                                  onClick={() => { setActiveOrderForReview(order.id); setReviewInput(""); }}
                                >
                                  star
                                </span>
                              ))}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          )}

          {/* Feature strip */}
          <section className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { icon: "verified_user", label: "ของแท้ 100%", sub: "สินค้าลิขสิทธิ์แท้ทุกรายการ" },
              { icon: "bolt", label: "จัดส่งคีย์ทันที", sub: "ภายในไม่กี่วินาที" },
              { icon: "support_agent", label: "บริการ 24 ชม.", sub: "ทีมงานพร้อมดูแล" },
              { icon: "lock", label: "ชำระเงินปลอดภัย", sub: "ระบบป้องกัน 100%" },
            ].map((f) => (
              <div key={f.icon} className="glass-panel p-5 rounded-2xl flex flex-col items-center text-center glow-hover transition-all bg-white shadow-sm border border-outline-variant/30">
                <span className="material-symbols-outlined text-accent-electric text-3xl mb-3" style={{ fontVariationSettings: '"FILL" 1' }}>{f.icon}</span>
                <h3 className="font-bold text-on-surface text-sm">{f.label}</h3>
                <p className="text-[11px] text-on-surface-variant mt-1">{f.sub}</p>
              </div>
            ))}
          </section>
        </div>
      </main>

      {/* Copy toast */}
      {copyMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-deep-navy text-white text-sm font-medium px-4 py-2.5 rounded-xl shadow-lg animate-fade-in">
          {copyMessage}
        </div>
      )}

      {/* Review Modal */}
      {activeOrderForReview && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl border border-outline-variant/30">
            <h3 className="text-lg font-bold text-deep-navy mb-2">✍️ เขียนรีวิวสินค้า</h3>
            <p className="text-on-surface-variant text-sm mb-5">กรุณากรอกความคิดเห็นเพื่อปรับปรุงบริการ</p>
            <form onSubmit={handleSubmitReview}>
              <textarea
                className="w-full p-4 border border-outline-variant rounded-xl focus:ring-2 focus:ring-accent-electric focus:border-accent-electric outline-none text-sm placeholder:text-outline-variant bg-[#f8fafb] mb-5"
                rows={4}
                placeholder="เขียนรีวิวสินค้า..."
                value={reviewInput}
                onChange={(e) => setReviewInput(e.target.value)}
                required
              />
              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setActiveOrderForReview(null)}
                  className="px-5 py-2.5 border border-outline-variant rounded-xl text-on-surface-variant hover:bg-surface-container transition-all cursor-pointer font-bold text-sm"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-accent-electric text-white rounded-xl shadow-md hover:brightness-110 transition-all cursor-pointer font-bold text-sm"
                >
                  ส่งรีวิว
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
