"use client";

import React, { useEffect, useState } from "react";
import { signOut } from "next-auth/react";
import { useSearchParams, useRouter } from "next/navigation";
import { getAvatarGradient } from "@/lib/avatar";

interface Order {
  id: string;
  productId: number;
  productName: string;
  subtitle: string;
  price: string;
  quantity: number;
  totalPrice: string;
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
  initialTab?: string;
}

type Tab = "profile" | "orders";

export function ProfileClient({
  userId,
  userName,
  userEmail,
  userRole,
  initialTab = "profile",
}: ProfileClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const [tab, setTab] = useState<Tab>(
    tabParam === "orders" ? "orders" : (initialTab as Tab),
  );
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [copyMessage, setCopyMessage] = useState<string | null>(null);
  const [ratingLoading, setRatingLoading] = useState<Record<string, boolean>>({});

  // Profile data state initialized with default values from props
  const nameParts = userName.trim().split(/\s+/);
  const initialFirstName = nameParts[0] || "User";
  const initialLastName = nameParts.slice(1).join(" ") || "";

  const [profile, setProfile] = useState({
    firstName: initialFirstName,
    lastName: initialLastName,
    email: userEmail,
    profilePicture: "",
  });

  // Fetch updated profile data from DB on mount
  useEffect(() => {
    fetch("/api/profile")
      .then((res) => res.json())
      .then((data) => {
        if (data && !data.error) {
          setProfile({
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            profilePicture: data.profilePicture || "",
          });
        }
      })
      .catch((err) => console.error("Error fetching profile:", err));
  }, []);

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

  const handleRateProduct = async (order: Order, rating: number) => {
    if (ratingLoading[order.id]) return;

    const previousRating = order.rating;
    const previousReviewed = order.reviewed;

    // Optimistic update
    setOrders((prev) =>
      prev.map((o) =>
        o.id === order.id ? { ...o, rating, reviewed: true } : o,
      ),
    );
    setRatingLoading((prev) => ({ ...prev, [order.id]: true }));

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: order.productId, rating }),
      });
      if (res.ok) {
        setCopyMessage("บันทึกคะแนนรีวิวแล้ว!");
        setTimeout(() => setCopyMessage(null), 2000);
      } else {
        // Revert on failure
        setOrders((prev) =>
          prev.map((o) =>
            o.id === order.id ? { ...o, rating: previousRating, reviewed: previousReviewed } : o,
          ),
        );
      }
    } catch {
      setOrders((prev) =>
        prev.map((o) =>
          o.id === order.id ? { ...o, rating: previousRating, reviewed: previousReviewed } : o,
        ),
      );
    } finally {
      setRatingLoading((prev) => ({ ...prev, [order.id]: false }));
    }
  };



  const avatarInitial = (profile.firstName || userName).slice(0, 1).toUpperCase();
  const isAdmin = userRole === "ADMIN";

  return (
    <div className="bg-[#fdfbff] text-[#1b1b1f] font-body-md antialiased min-h-screen">
      <main className="max-w-container-max mx-auto px-margin-desktop pt-32 pb-section-gap flex flex-col lg:flex-row gap-gutter">

        {/* ── Sidebar ── */}
        <aside className="w-full lg:w-72 flex-shrink-0 space-y-5">

          {/* Avatar + ชื่อ */}
          <div className="glass-panel p-6 rounded-2xl bg-white shadow-sm border border-outline-variant/30 flex flex-col items-center gap-3 text-center">
            {profile.profilePicture ? (
              <div className="w-16 h-16 rounded-full border border-outline-variant/30 overflow-hidden flex items-center justify-center bg-white shadow-md flex-shrink-0">
                <img src={profile.profilePicture} alt="Profile" className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className={`w-16 h-16 rounded-full ${getAvatarGradient(profile.firstName || userName)} flex items-center justify-center text-white text-2xl font-bold shadow-md select-none`}>
                {avatarInitial}
              </div>
            )}
            <div>
              <p className="font-bold text-on-surface text-base leading-tight">{profile.firstName} {profile.lastName}</p>
              <p className="text-xs text-on-surface-variant mt-1">{profile.email}</p>
              <span className={`inline-block mt-2.5 text-[11px] font-semibold px-2 py-0.5 rounded-full ${isAdmin ? "bg-red-100 text-red-600" : "bg-blue-100 text-blue-600"}`}>
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
              
              <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-outline-variant/30 mb-6">
                <div className="relative group">
                  {profile.profilePicture ? (
                    <div className="w-20 h-20 rounded-full border-2 border-accent-electric/20 overflow-hidden flex items-center justify-center bg-white shadow-md">
                      <img src={profile.profilePicture} alt="Profile" className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className={`w-20 h-20 rounded-full ${getAvatarGradient(profile.firstName || userName)} flex items-center justify-center text-white text-3xl font-bold shadow-md select-none`}>
                      {avatarInitial}
                    </div>
                  )}
                </div>
                <div className="text-center sm:text-left flex-grow">
                  <h2 className="text-xl font-bold text-on-surface flex items-center justify-center sm:justify-start gap-2">
                    <span className="material-symbols-outlined text-accent-electric">person</span>
                    ข้อมูลส่วนตัว
                  </h2>
                  <p className="text-sm text-on-surface-variant mt-1">{profile.firstName} {profile.lastName}</p>
                </div>
                <button
                  type="button"
                  onClick={() => router.push("/profile/edit")}
                  className="flex items-center gap-2 px-4 py-2 bg-accent-electric/10 hover:bg-accent-electric/20 text-accent-electric rounded-xl font-semibold text-sm transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                >
                  <span className="material-symbols-outlined text-sm">edit</span>
                  แก้ไขข้อมูลส่วนตัว
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* ชื่อ-นามสกุล */}
                <div className="space-y-1.5">
                  <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wide">ชื่อ-นามสกุล</p>
                  <div className="flex items-center gap-2 px-4 py-3 bg-surface-container-low rounded-xl border border-outline-variant/30">
                    <span className="material-symbols-outlined text-sm text-on-surface-variant">badge</span>
                    <span className="text-sm font-medium text-on-surface">{profile.firstName} {profile.lastName}</span>
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                  <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wide">อีเมล</p>
                  <div className="flex items-center gap-2 px-4 py-3 bg-surface-container-low rounded-xl border border-outline-variant/30">
                    <span className="material-symbols-outlined text-sm text-on-surface-variant">mail</span>
                    <span className="text-sm font-medium text-on-surface">{profile.email}</span>
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
                    className="pl-12 pr-4 py-2.5 bg-white border border-outline-variant rounded-xl text-sm focus:ring-1 focus:ring-accent-electric outline-none w-full sm:w-64 text-on-surface"
                    placeholder="ค้นหาคำสั่งซื้อ..."
                    type="text"
                  />
                </div>
              </div>

              {loadingOrders ? (
                <div className="text-center py-16">
                  <span className="ui-spinner mx-auto" />
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
                  <table className="w-full text-left border-collapse min-w-[850px]">
                    <thead>
                      <tr className="border-b border-outline-variant/30 bg-surface-container-low/50">
                        <th className="px-5 py-4 font-bold text-on-surface-variant text-[12px] whitespace-nowrap w-[180px]">คำสั่งซื้อ / วันที่</th>
                        <th className="px-5 py-4 font-bold text-on-surface-variant text-[12px] whitespace-nowrap min-w-[220px]">สินค้า</th>
                        <th className="px-5 py-4 font-bold text-on-surface-variant text-[12px] whitespace-nowrap text-right w-[110px]">ราคารวม</th>
                        <th className="px-5 py-4 font-bold text-on-surface-variant text-[12px] whitespace-nowrap text-center w-[90px]">จำนวน</th>
                        <th className="px-5 py-4 font-bold text-on-surface-variant text-[12px] whitespace-nowrap text-center w-[110px]">สถานะ</th>
                        <th className="px-5 py-4 font-bold text-on-surface-variant text-[12px] whitespace-nowrap w-[180px]">รีวิว</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant/20">
                      {filteredOrders.map((order) => (
                        <tr key={order.id} className="hover:bg-surface-container-low/30 transition-colors">
                          {/* คำสั่งซื้อ / วันที่ */}
                          <td className="px-5 py-4 align-middle whitespace-nowrap">
                            <div className="flex flex-col gap-0.5">
                              <span className="font-bold text-accent-electric text-[13px] font-mono tracking-wide whitespace-nowrap">{order.id}</span>
                              <span className="text-[11px] text-on-surface-variant font-medium whitespace-nowrap">{order.date} {order.time}</span>
                            </div>
                          </td>
                          {/* สินค้า */}
                          <td className="px-5 py-4 align-middle">
                            <div className="flex items-center gap-3.5">
                              <div className="w-12 h-12 border border-outline-variant/30 rounded-xl flex items-center justify-center p-1.5 overflow-hidden flex-shrink-0 bg-white shadow-sm transition-transform duration-300 hover:scale-105">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img alt={order.productName} className="w-full h-full object-contain" src={order.image} />
                              </div>
                              <div className="min-w-0">
                                <p className="font-semibold text-[13px] text-on-surface leading-snug break-words">{order.productName}</p>
                                <p className="text-[11px] text-on-surface-variant font-medium mt-0.5 whitespace-nowrap">{order.subtitle}</p>
                              </div>
                            </div>
                          </td>
                          {/* ราคารวม */}
                          <td className="px-5 py-4 align-middle text-right whitespace-nowrap">
                            <span className="text-[13px] font-semibold text-on-surface">{order.totalPrice}</span>
                          </td>
                          {/* จำนวน */}
                          <td className="px-5 py-4 align-middle text-center whitespace-nowrap">
                            <span className="text-[13px] font-medium text-on-surface bg-surface-container-low px-2.5 py-0.5 rounded-full border border-outline-variant/20 whitespace-nowrap">{order.quantity} ชิ้น</span>
                          </td>
                          {/* สถานะ */}
                          <td className="px-5 py-4 align-middle text-center whitespace-nowrap">
                            <span className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full border ${
                              order.status === "สำเร็จ"
                                ? "bg-green-50 text-green-700 border-green-200/50"
                                : order.status === "รอดำเนินการ"
                                ? "bg-yellow-50 text-yellow-700 border-yellow-200/50"
                                : "bg-red-50 text-red-700 border-red-200/50"
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${
                                order.status === "สำเร็จ"
                                  ? "bg-green-500"
                                  : order.status === "รอดำเนินการ"
                                  ? "bg-yellow-500"
                                  : "bg-red-500"
                              }`} />
                              {order.status}
                            </span>
                          </td>
                          {/* รีวิว */}
                          <td className="px-5 py-4 align-middle whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <div className="flex gap-0.5">
                                {ratingLoading[order.id] ? (
                                  <span className="text-[11px] text-on-surface-variant font-medium animate-pulse">กำลังบันทึก...</span>
                                ) : (
                                  [1, 2, 3, 4, 5].map((star) => (
                                    <span
                                      key={star}
                                      className={`material-symbols-outlined text-[15px] text-amber-400 cursor-pointer hover:scale-125 transition-transform ${
                                        star <= order.rating ? "fill" : ""
                                      }`}
                                      onClick={() => handleRateProduct(order, star)}
                                      title={`ให้ ${star} ดาว`}
                                    >
                                      star
                                    </span>
                                  ))
                                )}
                              </div>
                              {ratingLoading[order.id] ? null : order.reviewed ? (
                                <span className="text-[10px] text-green-600 font-semibold flex items-center gap-0.5 select-none">
                                  <span className="material-symbols-outlined text-[12px] fill">check_circle</span>
                                  รีวิวแล้ว
                                </span>
                              ) : (
                                <span className="text-[10px] text-on-surface-variant/60 font-medium select-none">กดดาวเพื่อรีวิว</span>
                              )}
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
    </div>
  );
}
