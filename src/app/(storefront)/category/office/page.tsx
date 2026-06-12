"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  originalPrice: number | null;
  image: string | null;
  category: string;
  stock: number;
}

export default function OfficeCategoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          // Filter products under 'Office' category
          const officeProducts = data.filter((p) => p.category === "Office");
          setProducts(officeProducts);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch products:", err);
        setLoading(false);
      });
  }, []);

  const getProductImageUrl = (imageKey: string | null) => {
    switch (imageKey) {
      case "office2021_pro":
        return "https://lh3.googleusercontent.com/aida-public/AB6AXuDJD5aOi7vQ97xqdV6lcOz0f7MghOhZ8Bcfpf5Gz6i7VF9VrEvvSkcSBhhq63cslC5IOV_pFsI-wPxX-W-FaoWT_QTaSVAlO6yOpKLgjdM1lvaTaVn15KVBR4lOlxA5UuUOZ6aykYOwDh6KcrhhSwYceLHccZj4GDG1llWYyk6PM6fC_146fZfmsejjC6BmNxXSK_siQx0dV3I1nDV5YITwS57L6wzRklOWzGt85zMdFaSGtT_NWG2jG0-bQ37b73JDP-Mtt6nFedA";
      default:
        return "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80";
    }
  };

  const handleAddToCart = (product: Product) => {
    const localCart = localStorage.getItem("softkeystore_cart");
    let cart: any[] = [];
    if (localCart) {
      try {
        cart = JSON.parse(localCart);
      } catch (e) {
        cart = [];
      }
    }
    const existing = cart.find((item) => item.id === product.id);
    if (existing) {
      existing.quantity += 1;
    } else {
      cart.push({
        id: product.id,
        name: product.name,
        category: product.category,
        price: product.price,
        quantity: 1,
        image: product.image,
      });
    }
    localStorage.setItem("softkeystore_cart", JSON.stringify(cart));
    alert(`เพิ่ม ${product.name} ลงในตะกร้าแล้ว!`);
    window.location.reload();
  };

  return (
    <div className="bg-white text-[#1a1c1e] font-body-md min-h-screen selection:bg-accent-electric selection:text-white">
      {/* Main Content Area */}
      <main className="pt-32 pb-section-gap max-w-container-max mx-auto px-margin-desktop relative overflow-hidden">
        {/* Atmospheric Background Glow */}
        <div className="absolute -top-64 left-1/2 -translate-x-1/2 w-[1000px] h-[1000px] hero-glow pointer-events-none bg-radial from-[rgba(0,98,255,0.08)] to-transparent"></div>

        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 relative z-10 gap-6">
          <div>
            <nav className="flex items-center gap-2 text-on-surface-variant mb-4 font-label-sm uppercase tracking-wider text-xs">
              <Link className="hover:text-accent-electric" href="/">หน้าแรก</Link>
              <span className="material-symbols-outlined text-[14px]">chevron_right</span>
              <span className="text-accent-electric font-bold">Microsoft Office</span>
            </nav>
            <h1 className="font-headline-lg text-headline-lg text-on-surface font-bold">Microsoft Office</h1>
            <p className="text-on-surface-variant mt-2 max-w-xl">ลิขสิทธิ์แท้ 100% สำหรับการใช้งานส่วนตัวและธุรกิจ พร้อมรับประกันและบริการหลังการขายตลอดอายุการใช้งาน</p>
          </div>
          <div className="flex items-center gap-4 w-full md:w-auto">
            <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 glass-panel rounded-xl hover:bg-white transition-all text-on-surface cursor-pointer">
              <span className="material-symbols-outlined text-[20px]">filter_list</span>
              <span className="font-medium">กรองสินค้า</span>
            </button>
            <div className="flex-1 md:flex-none relative">
              <button className="w-full flex items-center justify-between gap-2 px-6 py-3 glass-panel rounded-xl hover:bg-white transition-all text-on-surface cursor-pointer">
                <span className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[20px]">sort</span>
                  <span className="font-medium">เรียงตาม: แนะนำ</span>
                </span>
                <span className="material-symbols-outlined text-[18px]">expand_more</span>
              </button>
            </div>
          </div>
        </div>

        {/* Product Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter relative z-10">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="bg-white rounded-2xl h-[420px] border border-outline-variant animate-pulse shadow-sm"></div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-outline-variant rounded-2xl relative z-10">
            <p className="text-on-surface-variant font-medium">ไม่พบสินค้าในหมวดหมู่นี้</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter relative z-10">
            {products.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-2xl overflow-hidden glow-hover hover:-translate-y-1 transition-all duration-300 group border border-outline-variant shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="aspect-square bg-surface-container relative overflow-hidden">
                    <img
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      src={getProductImageUrl(product.image)}
                      alt={product.name}
                    />
                    <div className="absolute top-3 left-3 bg-error text-white text-xs px-3 py-1 rounded-full font-label-sm shadow-sm font-bold">
                      SALE
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="bg-primary/10 text-primary px-2 py-0.5 rounded font-label-sm text-xs font-bold uppercase">
                        Lifetime
                      </span>
                      <span className="text-on-surface-variant text-[12px]">คีย์เหลือ {product.stock} ชิ้น</span>
                    </div>
                    <Link
                      href={`/product/${product.id}`}
                      className="font-title-md text-title-md text-on-surface font-bold mb-1 hover:text-primary transition-colors block line-clamp-2"
                    >
                      {product.name}
                    </Link>
                    <p className="text-body-md text-on-surface-variant text-sm mb-4 line-clamp-1">
                      {product.description}
                    </p>
                    <div className="flex items-center gap-1 mb-4">
                      <div className="flex text-accent-electric">
                        <span className="material-symbols-outlined text-[16px] fill">star</span>
                        <span className="material-symbols-outlined text-[16px] fill">star</span>
                        <span className="material-symbols-outlined text-[16px] fill">star</span>
                        <span className="material-symbols-outlined text-[16px] fill">star</span>
                        <span className="material-symbols-outlined text-[16px] fill">star</span>
                      </div>
                      <span className="text-on-surface-variant text-[12px] ml-1">5.0 (25K)</span>
                    </div>
                  </div>
                </div>
                <div className="p-6 pt-0 mt-auto flex items-center justify-between">
                  <div>
                    {product.originalPrice && (
                      <span className="text-on-surface-variant line-through text-sm">฿{product.originalPrice.toLocaleString()}</span>
                    )}
                    <div className="text-accent-electric font-bold text-xl">฿{product.price.toLocaleString()}</div>
                  </div>
                  <button
                    onClick={() => handleAddToCart(product)}
                    className="bg-accent-electric text-white p-3 rounded-xl shadow-lg shadow-accent-electric/20 active:scale-95 transition-all cursor-pointer"
                  >
                    <span className="material-symbols-outlined">shopping_cart</span>
                  </button>
                </div>
              </div>
            ))}

            {/* Additional custom placeholder for layout balance */}
            <div className="hidden lg:flex bg-surface-container-low rounded-2xl items-center justify-center border-dashed border-2 border-outline-variant opacity-60 hover:opacity-100 transition-opacity p-8 text-center min-h-[300px]">
              <div>
                <span className="material-symbols-outlined text-[48px] text-on-surface-variant mb-2">add_circle</span>
                <p className="text-on-surface-variant font-medium">ดูสินค้า Microsoft อื่นๆ</p>
              </div>
            </div>
          </div>
        )}

        {/* SEO Content Section (Bento Style) */}
        <section className="mt-section-gap grid grid-cols-1 lg:grid-cols-3 gap-gutter relative z-10">
          <div className="lg:col-span-2 glass-panel p-8 rounded-3xl shadow-sm bg-white/80 backdrop-blur border border-outline-variant">
            <h2 className="font-headline-lg text-headline-lg text-on-surface mb-6 font-bold">ทำไมต้องเลือก SoftKeyStore?</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="flex gap-4">
                <div className="w-12 h-12 shrink-0 bg-accent-electric/10 rounded-xl flex items-center justify-center text-accent-electric">
                  <span className="material-symbols-outlined">verified_user</span>
                </div>
                <div>
                  <h4 className="font-title-md text-title-md text-on-surface font-bold">ลิขสิทธิ์แท้ 100%</h4>
                  <p className="text-on-surface-variant text-sm mt-1">สินค้าทุกชิ้นตรวจสอบได้ อัปเดตได้ตลอดอายุการใช้งาน</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-12 h-12 shrink-0 bg-accent-electric/10 rounded-xl flex items-center justify-center text-accent-electric">
                  <span className="material-symbols-outlined">bolt</span>
                </div>
                <div>
                  <h4 className="font-title-md text-title-md text-on-surface font-bold">จัดส่งทันใจ</h4>
                  <p className="text-on-surface-variant text-sm mt-1">รับคีย์ทางอีเมลทันทีหลังจากยืนยันการชำระเงิน</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-12 h-12 shrink-0 bg-accent-electric/10 rounded-xl flex items-center justify-center text-accent-electric">
                  <span className="material-symbols-outlined">support_agent</span>
                </div>
                <div>
                  <h4 className="font-title-md text-title-md text-on-surface font-bold">ดูแล 24 ชั่วโมง</h4>
                  <p className="text-on-surface-variant text-sm mt-1">ทีมงานผู้เชี่ยวชาญพร้อมช่วยเหลือในทุกขั้นตอน</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-12 h-12 shrink-0 bg-accent-electric/10 rounded-xl flex items-center justify-center text-accent-electric">
                  <span className="material-symbols-outlined">published_with_changes</span>
                </div>
                <div>
                  <h4 className="font-title-md text-title-md text-on-surface font-bold">คืนเงินหากใช้งานไม่ได้</h4>
                  <p className="text-on-surface-variant text-sm mt-1">นโยบายรับประกันความพึงพอใจ มั่นใจทุกการสั่งซื้อ</p>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-accent-electric p-8 rounded-3xl flex flex-col justify-between overflow-hidden relative shadow-lg shadow-accent-electric/20 text-white">
            <div className="relative z-10">
              <h3 className="font-headline-lg text-headline-lg text-white mb-4 font-bold">พร้อมติดตั้งแล้วหรือยัง?</h3>
              <p className="text-white/80">สแกนเพื่อรับคู่มือการติดตั้งภาษาไทย เข้าใจง่าย ทำตามได้ทันที</p>
            </div>
            <div className="mt-8 flex justify-center relative z-10">
              <div className="w-32 h-32 bg-white p-2 rounded-xl shadow-inner">
                <img
                  alt="QR Code"
                  className="w-full h-full"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCcQFjEpIJJk6KGUEsAXk23yRPsQ8_GFyUOej83Vw2T0LeV3vlOzUYsLjcfGK4w7-TGZka91V2HC_4hTQKMHB6vGvdovxjt3iVwljAvyoIRRQND8Dbghnu5iGi8lThn4ItiBLITtTMh7_JY9EZocBI037ayitvjCq-4MGIWWHlFKdTQl26GqPXNqwd_L_RRG2-JnlYwrRPdgdLAteP8L67wfQLIjr32GIH0ltMDZtuUglEnvT6DETjJFQHLIVPqgwXrkEk7wTCggE8"
                />
              </div>
            </div>
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/20 blur-[60px] opacity-50"></div>
          </div>
        </section>
      </main>
    </div>
  );
}
