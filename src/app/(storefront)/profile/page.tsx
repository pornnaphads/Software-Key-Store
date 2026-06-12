"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Order {
  id: string;
  productName: string;
  price: string;
  date: string;
  status: string;
  key: string;
  reviewed: boolean;
  reviewText?: string;
  image: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const [userName, setUserName] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState("");
  const [orders, setOrders] = useState<Order[]>([
    {
      id: "#ORD-202606-0001",
      productName: "Windows 11 Pro",
      price: "790.00 ฿",
      date: "12 มิ.ย. 2026",
      status: "สำเร็จ",
      key: "W269N-WFGWX-YVC9B-4J6C9-T83GX",
      reviewed: false,
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCRxpEfuq11_vYbapBgipuLc59XKXurRyeZI4Ig01WowvhMcyd6OHXV4iwTSQ6J6w8lwdq9uW7Sj9yc0n2jDuCRmwzVhp7QLJP3bxsfw6eCb-8Mr26hLmO-TEoJ_LSOizV0tpDRxKqgsY89LCK4WqIacLhAV97s7leoH-h8UVMBuoKcWDtssAeg8sHcSzAputpW_I_459wM-C5YYd-1q7jz9nyyGRY5J-rxxUXRVyAfrDWRbRbb6gV7SHAXkdjrBNSLLSqXvJg-_Ok",
    },
    {
      id: "#ORD-202606-0002",
      productName: "Microsoft Office 2021 Professional Plus",
      price: "1,190.00 ฿",
      date: "10 มิ.ย. 2026",
      status: "สำเร็จ",
      key: "NH3PV-QD9BC-3YMX2-W78GF-P89XH",
      reviewed: true,
      reviewText: "คีย์แท้ใช้งานได้ทันที จัดส่งออโต้เร็วมากครับ",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuClJ7vlZFuvja_Xqng18bp6TFUVektyA6-PVQb6W-kRcrr2moYwCcBZIfZfSqXniLPUjzTyWM6ntzNvW81qTUd1MkYvkyqp5_pdlzirzBtGoaoRHk_zFMPtOMcKPcAP_5PtpRTscYtmTETD-31w4OOzGBPEAEPayB3fcISBeZM-S_mrhvuJeYurCHqsJSpgxYhnWtUEKLLNJdPq4Z60eHHNXFdEeQTEH_3eUNXLJspjFhP5WFfv4iJXE2LR0FHLaUP81l3lp84xpBA",
    },
    {
      id: "#ORD-202606-0003",
      productName: "Adobe Creative Cloud All Apps",
      price: "1,790.00 ฿",
      date: "28 พ.ค. 2026",
      status: "สำเร็จ",
      key: "ADOBE-CC-KEYS-TEMP-11223",
      reviewed: false,
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBkZSo6HtfjFyvqzZU7FFrI0udlkwoB_hbWz0-noFEHRyyEJNAuwVc6kP4yl7d4gzZ2XNvmPEle_O9_DHm-8UgQJhsBxWLo5MOlgX5UopuK3XSkTLzLcVga874_nh3qcVSqI3FOQyLJJUJjHakcl5_9TYQB9QcXAu7wmqqwN85x4oivHQiWNljb0-Lsr9I5UR0mGA-TNQlLFbNe2gsKHfZ67ysZ368BOmw3GwcHzCiOtv1GctQGpQSyp_EqTWeP13BGHa4AVvBO9Yc",
    },
  ]);

  const [activeOrderForReview, setActiveOrderForReview] = useState<string | null>(null);
  const [reviewInput, setReviewInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const match = document.cookie.match(new RegExp('(^| )mock_user=([^;]+)'));
    if (match) {
      const decodedName = decodeURIComponent(match[2]);
      setUserName(decodedName);

      const registeredUsers = JSON.parse(localStorage.getItem("mock_users") || "[]");
      const user = registeredUsers.find((u: any) => u.name === decodedName);
      if (user) {
        setUserEmail(user.email);
      } else {
        setUserEmail(`${decodedName.toLowerCase().replace(/\s+/g, "")}@gmail.com`);
      }
    } else {
      router.push("/login");
    }
  }, [router]);

  const handleSignOut = () => {
    document.cookie = "mock_user=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
    router.push("/");
    setTimeout(() => {
      window.location.reload();
    }, 150);
  };

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key).then(() => {
      alert("คัดลอก License Key สำเร็จ!");
    });
  };

  const handleOpenReviewModal = (orderId: string) => {
    setActiveOrderForReview(orderId);
    setReviewInput("");
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewInput.trim()) return;

    setOrders((prevOrders) =>
      prevOrders.map((order) => {
        if (order.id === activeOrderForReview) {
          return { ...order, reviewed: true, reviewText: reviewInput };
        }
        return order;
      })
    );

    setActiveOrderForReview(null);
    setReviewInput("");
    alert("ส่งรีวิวสินค้าสำเร็จ! ขอบพระคุณสำหรับความคิดเห็นของคุณครับ");
  };

  const filteredOrders = searchQuery
    ? orders.filter((o) => o.id.toLowerCase().includes(searchQuery.toLowerCase()))
    : orders;

  if (!userName) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fdfbff] text-[#1b1b1f] font-body-md">
        <p className="animate-pulse font-medium text-lg">กำลังโหลดข้อมูลโปรไฟล์...</p>
      </div>
    );
  }

  return (
    <div className="bg-[#fdfbff] text-[#1b1b1f] font-body-md antialiased min-h-screen">
      {/* Main Container */}
      <main className="max-w-container-max mx-auto px-margin-desktop pt-32 pb-section-gap flex flex-col lg:flex-row gap-gutter">

        {/* Sidebar Navigation */}
        <aside className="w-full lg:w-72 flex-shrink-0 space-y-6">
          <div className="glass-panel p-2 rounded-xl bg-white shadow-sm border border-outline-variant/30">
            <nav className="flex flex-col">
              <button
                type="button"
                className="flex items-center gap-3 px-4 py-3 rounded-lg bg-accent-electric/10 text-accent-electric border-r-4 border-accent-electric font-medium text-left outline-none cursor-default"
              >
                <span className="material-symbols-outlined">person</span>
                <span>ข้อมูลส่วนตัว</span>
              </button>
              <button
                type="button"
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low transition-all text-left outline-none"
              >
                <span className="material-symbols-outlined">history</span>
                <span>ประวัติการสั่งซื้อ</span>
              </button>
              <hr className="my-2 border-outline-variant opacity-30" />
              <button
                onClick={handleSignOut}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-error hover:bg-error-container transition-all text-left outline-none cursor-pointer w-full"
              >
                <span className="material-symbols-outlined">logout</span>
                <span>ออกจากระบบ</span>
              </button>
            </nav>
          </div>

          {/* Trust Badge */}
          <div className="glass-panel p-6 rounded-xl relative overflow-hidden group bg-white shadow-sm border border-outline-variant/30">
            <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform duration-700">
              <span className="material-symbols-outlined text-accent-electric text-[100px]" style={{ fontVariationSettings: '"FILL" 1' }}>
                verified
              </span>
            </div>
            <div className="flex items-center gap-4 mb-3">
              <div className="w-10 h-10 rounded-full bg-accent-electric flex items-center justify-center">
                <span className="material-symbols-outlined text-white" style={{ fontVariationSettings: '"FILL" 1' }}>
                  check_circle
                </span>
              </div>
              <div>
                <h4 className="font-title-md text-on-surface font-bold text-sm">ของแท้ 100%</h4>
                <p className="text-xs text-on-surface-variant">มั่นใจได้ในสินค้าแท้</p>
              </div>
            </div>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              ทุกซอฟต์แวร์ที่เราจัดจำหน่ายเป็นลิขสิทธิ์แท้ พร้อมรับประกันการใช้งานตลอดอายุสมาชิก
            </p>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex-grow space-y-8">

          {/* Profile Header */}
          <section className="glass-panel p-8 rounded-2xl flex flex-col md:flex-row items-center md:items-start gap-8 relative overflow-hidden bg-white shadow-sm border border-outline-variant/30">
            <div className="absolute top-0 right-0 w-64 h-64 bg-accent-electric/5 blur-[100px] -z-10"></div>
            <div className="relative">
              <div className="w-32 h-32 rounded-full border-4 border-accent-electric p-1 bg-white overflow-hidden flex items-center justify-center">
                <div className="w-full h-full rounded-full bg-accent-electric/15 text-accent-electric flex items-center justify-center font-bold text-4xl">
                  {userName.charAt(0).toUpperCase()}
                </div>
              </div>
              <button className="absolute bottom-1 right-1 bg-white border border-outline-variant rounded-full p-2 hover:scale-110 transition-transform shadow-sm">
                <span className="material-symbols-outlined text-sm text-on-surface">photo_camera</span>
              </button>
            </div>
            <div className="flex-grow text-center md:text-left">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h1 className="font-display-lg text-headline-lg text-on-surface mb-2 font-bold">{userName}</h1>
                  <div className="flex flex-col md:flex-row gap-x-6 gap-y-2 text-on-surface-variant text-sm">
                    <span className="flex items-center gap-2 justify-center md:justify-start">
                      <span className="material-symbols-outlined text-accent-electric text-sm">mail</span>
                      {userEmail}
                    </span>
                    <span className="flex items-center gap-2 justify-center md:justify-start">
                      <span className="material-symbols-outlined text-accent-electric text-sm">call</span>
                      081-234-5678
                    </span>
                  </div>
                </div>
                <button className="px-6 py-2 border border-accent-electric text-accent-electric rounded-lg font-medium hover:bg-accent-electric/10 transition-colors flex items-center justify-center gap-2 cursor-pointer">
                  <span className="material-symbols-outlined text-sm">edit</span>
                  แก้ไขข้อมูล
                </button>
              </div>
              <div className="mt-6 pt-6 border-t border-outline-variant/30 flex items-center justify-center md:justify-start gap-2 text-label-sm text-on-surface-variant text-xs font-semibold">
                <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: '"FILL" 1' }}>
                  calendar_today
                </span>
                เป็นสมาชิกตั้งแต่ 12 พฤษภาคม 2026
              </div>
            </div>
          </section>

          {/* Order History Section */}
          <section className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h2 className="font-display-lg text-headline-lg text-on-surface font-bold">ประวัติการสั่งซื้อ</h2>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">
                  search
                </span>
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-white border border-outline-variant rounded-xl text-sm focus:ring-1 focus:ring-accent-electric outline-none w-full sm:w-64 text-on-surface"
                  placeholder="ค้นหาเลขออร์เดอร์..."
                  type="text"
                />
              </div>
            </div>

            {filteredOrders.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-outline-variant rounded-2xl">
                <p className="text-on-surface-variant font-medium">ไม่พบรายการสั่งซื้อ</p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-2xl glass-panel bg-white shadow-sm border border-outline-variant/30">
                <table className="w-full text-left border-collapse min-w-[700px]">
                  <thead>
                    <tr className="border-b border-outline-variant/30 bg-surface-container-low">
                      <th className="px-6 py-4 font-label-sm text-on-surface-variant uppercase text-xs font-bold">คำสั่งซื้อ</th>
                      <th className="px-6 py-4 font-label-sm text-on-surface-variant uppercase text-xs font-bold">สินค้า</th>
                      <th className="px-6 py-4 font-label-sm text-on-surface-variant uppercase text-xs font-bold">วันที่ซื้อ</th>
                      <th className="px-6 py-4 font-label-sm text-on-surface-variant uppercase text-xs font-bold">License Key</th>
                      <th className="px-6 py-4 font-label-sm text-on-surface-variant uppercase text-xs font-bold text-center">สถานะ</th>
                      <th className="px-6 py-4 font-label-sm text-on-surface-variant uppercase text-xs font-bold text-right">รีวิวสินค้า</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/20">
                    {filteredOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-surface-container-low transition-colors">
                        <td className="px-6 py-5">
                          <span className="font-label-sm text-accent-electric text-xs font-bold">{order.id}</span>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white border border-outline-variant/30 rounded flex items-center justify-center p-1.5 shadow-sm overflow-hidden flex-shrink-0">
                              <img alt={order.productName} className="w-full h-full object-contain" src={order.image} />
                            </div>
                            <div>
                              <div className="font-title-md text-sm text-on-surface font-bold">{order.productName}</div>
                              <div className="text-xs text-on-surface-variant">1 PC / 1 User</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="text-sm text-on-surface">{order.date}</div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-2">
                            <code className="font-label-sm text-xs bg-surface-container-high px-2 py-1 rounded text-on-surface">
                              {order.key}
                            </code>
                            <button
                              onClick={() => handleCopyKey(order.key)}
                              className="text-accent-electric hover:scale-110 transition-transform outline-none cursor-pointer flex items-center"
                              title="คัดลอก"
                            >
                              <span className="material-symbols-outlined text-sm">content_copy</span>
                            </button>
                          </div>
                        </td>
                        <td className="px-6 py-5 text-center">
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium font-bold">
                            <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: '"FILL" 1' }}>check_circle</span>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-6 py-5 text-right">
                          {order.reviewed ? (
                            <span className="text-xs text-on-surface-variant font-medium italic">รีวิวแล้ว: "{order.reviewText}"</span>
                          ) : (
                            <button
                              onClick={() => handleOpenReviewModal(order.id)}
                              className="text-sm text-accent-electric hover:underline font-medium cursor-pointer"
                            >
                              เขียนรีวิว
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* Features Grid */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter pt-8">
            <div className="glass-panel p-6 rounded-2xl flex flex-col items-center text-center glow-hover transition-all bg-white shadow-sm border border-outline-variant/30">
              <span className="material-symbols-outlined text-accent-electric text-3xl mb-4" style={{ fontVariationSettings: '"FILL" 1' }}>
                verified_user
              </span>
              <h3 className="font-title-md text-on-surface mb-2 font-bold text-sm">ของแท้ 100%</h3>
              <p className="text-xs text-on-surface-variant">มั่นใจได้ในสินค้าลิขสิทธิ์แท้ทุกรายการ</p>
            </div>
            <div className="glass-panel p-6 rounded-2xl flex flex-col items-center text-center glow-hover transition-all bg-white shadow-sm border border-outline-variant/30">
              <span className="material-symbols-outlined text-accent-electric text-3xl mb-4" style={{ fontVariationSettings: '"FILL" 1' }}>
                bolt
              </span>
              <h3 className="font-title-md text-on-surface mb-2 font-bold text-sm">จัดส่งคีย์ทันที</h3>
              <p className="text-xs text-on-surface-variant">ภายในไม่กี่วินาทีหลังชำระเงินเรียบร้อย</p>
            </div>
            <div className="glass-panel p-6 rounded-2xl flex flex-col items-center text-center glow-hover transition-all bg-white shadow-sm border border-outline-variant/30">
              <span className="material-symbols-outlined text-accent-electric text-3xl mb-4" style={{ fontVariationSettings: '"FILL" 1' }}>
                support_agent
              </span>
              <h3 className="font-title-md text-on-surface mb-2 font-bold text-sm">บริการ 24 ชม.</h3>
              <p className="text-xs text-on-surface-variant">ทีมงานพร้อมดูแลและแก้ไขปัญหาให้คุณ</p>
            </div>
            <div className="glass-panel p-6 rounded-2xl flex flex-col items-center text-center glow-hover transition-all bg-white shadow-sm border border-outline-variant/30">
              <span className="material-symbols-outlined text-accent-electric text-3xl mb-4" style={{ fontVariationSettings: '"FILL" 1' }}>
                lock
              </span>
              <h3 className="font-title-md text-on-surface mb-2 font-bold text-sm">ชำระเงินปลอดภัย</h3>
              <p className="text-xs text-on-surface-variant">ระบบป้องกันข้อมูล 100% และช่องทางที่เชื่อถือได้</p>
            </div>
          </section>

        </div>
      </main>

      {/* Review Modal Dialog */}
      {activeOrderForReview && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl border border-outline-variant/30 relative">
            <h3 className="text-headline-lg font-bold text-deep-navy mb-2 text-lg">✍️ เขียนรีวิวสินค้า</h3>
            <p className="text-on-surface-variant text-sm mb-6">กรุณากรอกความคิดเห็นเพื่อปรับปรุงคุณภาพบริการต่อไป</p>
            <form onSubmit={handleSubmitReview}>
              <textarea
                className="w-full p-4 border border-outline-variant rounded-xl focus:ring-2 focus:ring-accent-electric focus:border-accent-electric outline-none text-sm placeholder:text-outline-variant bg-[#f8fafb] mb-6"
                rows={4}
                placeholder="เขียนรีวิวสินค้าชิ้นนี้ เช่น การติดตั้งคีย์, ความเร็วการจัดส่ง..."
                value={reviewInput}
                onChange={(e) => setReviewInput(e.target.value)}
                required
              />
              <div className="flex gap-4 justify-end">
                <button
                  type="button"
                  onClick={() => setActiveOrderForReview(null)}
                  className="px-6 py-3 border border-outline-variant rounded-xl text-on-surface-variant hover:bg-surface-container transition-all cursor-pointer font-bold text-sm"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-accent-electric text-white rounded-xl shadow-md hover:brightness-110 transition-all cursor-pointer font-bold text-sm"
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
