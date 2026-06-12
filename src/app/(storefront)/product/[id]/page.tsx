"use client";

import React, { useState, useEffect, use } from "react";
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

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<"details" | "usage" | "reviews">("details");

  // Add-ons state
  const [addons, setAddons] = useState({
    word: false,
    excel: false,
    powerpoint: false,
  });

  const addonPrices = {
    word: 450,
    excel: 450,
    powerpoint: 390,
  };

  useEffect(() => {
    // Fetch product details
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const found = data.find((p) => p.id === parseInt(id));
          if (found) {
            setProduct(found);
          }
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load product details:", err);
        setLoading(false);
      });
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;

    const localCart = localStorage.getItem("softkeystore_cart");
    let cart: any[] = [];
    if (localCart) {
      try {
        cart = JSON.parse(localCart);
      } catch (e) {
        cart = [];
      }
    }

    // Calculate item total based on addons
    let itemPrice = product.price;
    let nameExtension = "";
    if (addons.word) { itemPrice += addonPrices.word; nameExtension += " + Word"; }
    if (addons.excel) { itemPrice += addonPrices.excel; nameExtension += " + Excel"; }
    if (addons.powerpoint) { itemPrice += addonPrices.powerpoint; nameExtension += " + PowerPoint"; }

    const cartItem = {
      id: product.id,
      name: `${product.name}${nameExtension}`,
      category: product.category,
      price: itemPrice,
      quantity: quantity,
      image: product.image,
    };

    // Add to cart
    const existingIndex = cart.findIndex((item) => item.id === product.id);
    if (existingIndex > -1) {
      cart[existingIndex] = cartItem; // Overwrite/update with new configuration and quantity
    } else {
      cart.push(cartItem);
    }

    localStorage.setItem("softkeystore_cart", JSON.stringify(cart));
    alert(`เพิ่ม "${product.name}${nameExtension}" ลงตะกร้าเรียบร้อยแล้ว!`);
    window.location.reload(); // Reload to update header cart count
  };

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

  if (loading) {
    return (
      <main className="mt-28 max-w-container-max mx-auto px-margin-desktop min-h-screen animate-pulse">
        <div className="h-6 w-48 bg-surface-container-high rounded mb-8"></div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
          <div className="lg:col-span-5 h-[450px] bg-surface-container-high rounded-xl"></div>
          <div className="lg:col-span-4 space-y-6">
            <div className="h-10 bg-surface-container-high rounded w-3/4"></div>
            <div className="h-24 bg-surface-container-high rounded"></div>
            <div className="h-40 bg-surface-container-high rounded"></div>
          </div>
          <div className="lg:col-span-3 h-80 bg-surface-container-high rounded-xl"></div>
        </div>
      </main>
    );
  }

  if (!product) {
    return (
      <main className="mt-32 max-w-container-max mx-auto px-margin-desktop text-center py-20">
        <h2 className="font-headline-lg text-headline-lg font-bold">ไม่พบสินค้าที่ต้องการ</h2>
        <Link href="/" className="mt-6 inline-block bg-primary text-on-primary px-6 py-2.5 rounded-lg">
          กลับหน้าหลัก
        </Link>
      </main>
    );
  }

  // Calculate sum of selected addons
  let addonTotal = 0;
  if (addons.word) addonTotal += addonPrices.word;
  if (addons.excel) addonTotal += addonPrices.excel;
  if (addons.powerpoint) addonTotal += addonPrices.powerpoint;

  const finalTotal = (product.price + addonTotal) * quantity;

  return (
    <main className="mt-24 max-w-container-max mx-auto px-margin-desktop min-h-screen w-full">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-label-sm font-label-sm text-on-surface-variant mb-8 text-xs">
        <Link className="hover:text-accent-electric" href="/">หน้าหลัก</Link>
        <span className="material-symbols-outlined text-[10px]">chevron_right</span>
        <span className="hover:text-accent-electric capitalize">{product.category}</span>
        <span className="material-symbols-outlined text-[10px]">chevron_right</span>
        <span className="text-on-surface font-semibold">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
        {/* Left Column: Product Preview */}
        <div className="lg:col-span-5 flex flex-col gap-gutter">
          <div className="glass-panel p-8 rounded-xl relative overflow-hidden group shadow-sm bg-white/40 border border-outline-variant/30">
            <div className="absolute inset-0 hero-glow opacity-30"></div>
            <div className="bg-surface-container-low rounded-lg p-12 flex flex-col items-center justify-center mb-6 min-h-[360px] border border-outline-variant/20">
              <img
                alt={product.name}
                className="max-w-xs h-auto drop-shadow-xl transform group-hover:scale-102 transition-transform duration-500"
                src={getProductImageUrl(product.image)}
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="glass-panel p-4 rounded-lg flex flex-col items-center text-center gap-2 bg-white/80 border border-outline-variant/20">
                <span className="material-symbols-outlined text-accent-electric text-xl font-bold fill">verified</span>
                <p className="text-[10px] font-bold leading-tight text-on-surface">
                  ของแท้ 100%<br />
                  <span className="text-on-surface-variant font-normal">ลิขสิทธิ์ถูกต้อง</span>
                </p>
              </div>
              <div className="glass-panel p-4 rounded-lg flex flex-col items-center text-center gap-2 bg-white/80 border border-outline-variant/20">
                <span className="material-symbols-outlined text-accent-electric text-xl font-bold fill">bolt</span>
                <p className="text-[10px] font-bold leading-tight text-on-surface">
                  จัดส่งอัตโนมัติ<br />
                  <span className="text-on-surface-variant font-normal">รับคีย์ทันที</span>
                </p>
              </div>
              <div className="glass-panel p-4 rounded-lg flex flex-col items-center text-center gap-2 bg-white/80 border border-outline-variant/20">
                <span className="material-symbols-outlined text-accent-electric text-xl font-bold fill">support_agent</span>
                <p className="text-[10px] font-bold leading-tight text-on-surface">
                  ช่วยเหลือ 24/7<br />
                  <span className="text-on-surface-variant font-normal">พร้อมดูแลคุณ</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Middle Column: Product Details & Options */}
        <div className="lg:col-span-4 flex flex-col gap-gutter">
          <div>
            <span className="text-xs font-label-sm text-accent-electric uppercase tracking-widest font-bold">
              {product.category} ซอฟต์แวร์
            </span>
            <h1 className="font-headline-lg text-headline-lg text-on-surface mt-2 font-bold leading-tight">
              {product.name}
            </h1>
            <div className="flex items-center gap-2 mt-2">
              <div className="flex text-yellow-500">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span key={i} className="material-symbols-outlined text-sm fill">star</span>
                ))}
              </div>
              <span className="text-on-surface-variant text-xs font-semibold">( 138 รีวิว )</span>
            </div>
            <p className="text-on-surface-variant mt-4 leading-relaxed text-sm">
              {product.description}
            </p>

            <div className="mt-8 flex items-end gap-4">
              <span className="text-3xl font-display-lg text-on-surface font-bold">
                ฿ {product.price.toLocaleString()}
              </span>
              <div className="flex items-center gap-2 text-green-600 pb-1.5">
                <span className="w-2 h-2 rounded-full bg-green-600 animate-pulse"></span>
                <span className="text-xs font-bold">
                  {product.stock > 0 ? "มีสินค้า พร้อมจัดส่ง" : "สินค้าหมด"}
                </span>
              </div>
            </div>
          </div>

          {/* Selection Card (Dynamic for Office add-ons or configuration check) */}
          {product.category === "Office" && (
            <div className="glass-panel p-6 rounded-xl border border-accent-electric/10 bg-white/50 space-y-4">
              <h3 className="font-title-md text-title-md text-on-surface font-bold text-sm">
                เลือกส่วนประกอบเพิ่มเติม
              </h3>
              <p className="text-xs text-on-surface-variant leading-none mb-2">สามารถเลือกโปรแกรมเสริมได้</p>
              <div className="space-y-3">
                <label className="flex items-center justify-between p-3 rounded-lg border border-outline-variant hover:border-accent-electric cursor-pointer transition-colors bg-white">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={addons.word}
                      onChange={(e) => setAddons({ ...addons, word: e.target.checked })}
                      className="rounded border-outline-variant text-accent-electric focus:ring-accent-electric bg-surface-container-low"
                    />
                    <div>
                      <p className="text-on-surface font-bold text-xs">Word Add-On</p>
                      <p className="text-[10px] text-on-surface-variant">โปรแกรมจัดการเอกสาร</p>
                    </div>
                  </div>
                  <span className="text-on-surface font-bold text-xs">฿ {addonPrices.word}</span>
                </label>

                <label className="flex items-center justify-between p-3 rounded-lg border border-outline-variant hover:border-accent-electric cursor-pointer transition-colors bg-white">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={addons.excel}
                      onChange={(e) => setAddons({ ...addons, excel: e.target.checked })}
                      className="rounded border-outline-variant text-accent-electric focus:ring-accent-electric bg-surface-container-low"
                    />
                    <div>
                      <p className="text-on-surface font-bold text-xs">Excel Add-On</p>
                      <p className="text-[10px] text-on-surface-variant">โปรแกรมจัดการตารางงาน</p>
                    </div>
                  </div>
                  <span className="text-on-surface font-bold text-xs">฿ {addonPrices.excel}</span>
                </label>
              </div>
            </div>
          )}

          {/* Quantity and Actions */}
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <span className="text-on-surface text-xs font-semibold">จำนวนสิทธิ์การใช้งาน (License)</span>
              <div className="flex items-center bg-white rounded-lg border border-outline-variant shadow-sm p-1">
                <button
                  onClick={() => setQuantity((q) => (q > 1 ? q - 1 : 1))}
                  className="p-1 hover:text-accent-electric transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-sm">remove</span>
                </button>
                <span className="w-8 text-center font-bold text-on-surface text-sm">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  className="p-1 hover:text-accent-electric transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-sm">add</span>
                </button>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={handleAddToCart}
                disabled={product.stock <= 0}
                className="flex-1 bg-accent-electric disabled:bg-gray-400 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:brightness-110 active:scale-95 transition-all shadow-md cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm">shopping_cart</span>
                เพิ่มลงตะกร้า
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Summary & Features Sidebar */}
        <div className="lg:col-span-3 space-y-gutter">
          {/* Order Summary Sidebar */}
          <div className="glass-panel p-6 rounded-xl bg-surface-container-low shadow-sm border border-outline-variant/30">
            <h3 className="font-title-md text-title-md text-on-surface mb-6 border-b border-outline-variant pb-2 font-bold text-sm">
              สรุปรายการที่เลือก
            </h3>
            <div className="space-y-4 mb-6">
              <div className="flex justify-between text-xs text-on-surface-variant font-medium">
                <span>{product.name}</span>
                <span className="text-on-surface">฿{product.price.toLocaleString()}</span>
              </div>
              {addons.word && (
                <div className="flex justify-between text-xs text-on-surface-variant font-medium">
                  <span>+ Word Add-On</span>
                  <span className="text-on-surface">฿{addonPrices.word}</span>
                </div>
              )}
              {addons.excel && (
                <div className="flex justify-between text-xs text-on-surface-variant font-medium">
                  <span>+ Excel Add-On</span>
                  <span className="text-on-surface">฿{addonPrices.excel}</span>
                </div>
              )}
              <div className="flex justify-between text-xs text-on-surface-variant font-medium border-t border-dashed border-outline-variant pt-2">
                <span>จำนวน</span>
                <span className="text-on-surface">x {quantity}</span>
              </div>
            </div>
            <div className="flex justify-between items-center pt-4 border-t border-outline-variant">
              <span className="font-bold text-on-surface text-sm">รวมทั้งหมด</span>
              <span className="text-lg font-bold text-accent-electric">฿ {finalTotal.toLocaleString()}</span>
            </div>
          </div>

          {/* Highlights */}
          <div className="glass-panel p-6 rounded-xl space-y-6 bg-white shadow-sm border border-outline-variant/30">
            <div className="flex gap-4">
              <div className="bg-primary-container p-2 rounded-lg text-primary flex items-center justify-center">
                <span className="material-symbols-outlined text-lg">local_shipping</span>
              </div>
              <div>
                <h4 className="text-xs font-bold text-on-surface">จัดส่งคีย์อัตโนมัติ</h4>
                <p className="text-[10px] text-on-surface-variant">รับคีย์ในอีเมลทันที หลังชำระเงินสำเร็จ</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="bg-primary-container p-2 rounded-lg text-primary flex items-center justify-center">
                <span className="material-symbols-outlined text-lg">download_done</span>
              </div>
              <div>
                <h4 className="text-xs font-bold text-on-surface">ใช้งานได้ถาวร</h4>
                <p className="text-[10px] text-on-surface-variant">ซื้อสิทธิ์ครั้งเดียว ใช้งานได้ถาวร</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Detail Tabs Section */}
      <section className="mt-16 mb-24">
        <div className="flex border-b border-outline-variant overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab("details")}
            className={`px-8 py-4 whitespace-nowrap text-sm cursor-pointer font-bold transition-all ${
              activeTab === "details" ? "tab-active border-b-2 border-primary text-primary" : "text-on-surface-variant"
            }`}
          >
            รายละเอียดสินค้า
          </button>
          <button
            onClick={() => setActiveTab("usage")}
            className={`px-8 py-4 whitespace-nowrap text-sm cursor-pointer font-bold transition-all ${
              activeTab === "usage" ? "tab-active border-b-2 border-primary text-primary" : "text-on-surface-variant"
            }`}
          >
            วิธีใช้งาน
          </button>
        </div>

        <div className="py-12 glass-panel mt-px border-t-0 rounded-b-xl px-8 md:px-12 bg-white/40 shadow-sm border border-outline-variant/30">
          {activeTab === "details" && (
            <div className="max-w-3xl space-y-6">
              <h2 className="font-headline-lg text-headline-lg text-on-surface font-bold text-lg">
                รายละเอียดเกี่ยวกับซอฟต์แวร์
              </h2>
              <p className="text-on-surface-variant leading-relaxed text-sm">
                ชุดโปรแกรมเพื่อการทำงานระดับมืออาชีพ รองรับความต้องการของธุรกิจ สถาบันการศึกษา และการสร้างสรรค์ส่วนบุคคล
                ลิขสิทธิ์แท้ใช้งานได้อย่างมั่นใจ ปราศจากมัลแวร์ ไม่ติดปัญหาการบล็อกคีย์ หรือลิขสิทธิ์หลุดเมื่ออัปเดตระบบปฏิบัติการ
              </p>
            </div>
          )}

          {activeTab === "usage" && (
            <div className="max-w-3xl space-y-8">
              <h2 className="font-headline-lg text-headline-lg text-on-surface font-bold text-lg">
                วิธีการเปิดใช้งาน (Activation Guide)
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl border border-outline-variant/30 space-y-3 bg-white">
                  <span className="text-accent-electric font-bold text-[10px] font-label-sm">STEP 01</span>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-accent-electric text-sm">download</span>
                    <h5 className="font-bold text-sm">ดาวน์โหลดไฟล์ติดตั้ง</h5>
                  </div>
                  <p className="text-[11px] text-on-surface-variant">ดาวน์โหลดซอฟต์แวร์จากลิงก์ทางการที่ส่งไปให้ในอีเมล</p>
                </div>
                <div className="p-4 rounded-xl border border-outline-variant/30 space-y-3 bg-white">
                  <span className="text-accent-electric font-bold text-[10px] font-label-sm">STEP 02</span>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-accent-electric text-sm">install_desktop</span>
                    <h5 className="font-bold text-sm">ทำการติดตั้ง</h5>
                  </div>
                  <p className="text-[11px] text-on-surface-variant">ทำตามคู่มือทีละขั้นตอนเพื่อติดตั้งโปรแกรมลงในอุปกรณ์ของคุณ</p>
                </div>
                <div className="p-4 rounded-xl border border-outline-variant/30 space-y-3 bg-white">
                  <span className="text-accent-electric font-bold text-[10px] font-label-sm">STEP 03</span>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-accent-electric text-sm">key</span>
                    <h5 className="font-bold text-sm">กรอกรหัสคีย์</h5>
                  </div>
                  <p className="text-[11px] text-on-surface-variant">กรอก Product Key เพื่อทำการตรวจสอบสิทธิ์และเริ่มต้นใช้งาน</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
