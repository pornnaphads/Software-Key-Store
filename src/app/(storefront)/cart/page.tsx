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

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  useEffect(() => {
    // Initialise cart with mock items for preview if empty
    const localCart = localStorage.getItem("softkeystore_cart");
    if (localCart) {
      try {
        setCartItems(JSON.parse(localCart));
      } catch (e) {
        initializeMockCart();
      }
    } else {
      initializeMockCart();
    }
  }, []);

  const initializeMockCart = () => {
    const mockItems = [
      {
        id: 3,
        name: "Microsoft Office 2021 Professional Plus",
        category: "Office",
        price: 1190,
        quantity: 1,
        image: "office2021_pro"
      }
    ];
    setCartItems(mockItems);
    localStorage.setItem("softkeystore_cart", JSON.stringify(mockItems));
  };

  const updateQuantity = (id: number, delta: number) => {
    const updated = cartItems.map((item) => {
      if (item.id === id) {
        const newQty = item.quantity + delta;
        return { ...item, quantity: newQty > 0 ? newQty : 1 };
      }
      return item;
    });
    setCartItems(updated);
    localStorage.setItem("softkeystore_cart", JSON.stringify(updated));
  };

  const removeItem = (id: number) => {
    const updated = cartItems.filter((item) => item.id !== id);
    setCartItems(updated);
    localStorage.setItem("softkeystore_cart", JSON.stringify(updated));
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

  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return (
    <main className="pt-32 pb-section-gap px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto w-full">
      <div className="mb-12">
        <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight font-bold">
          ตะกร้าสินค้าของคุณ
        </h1>
        <div className="h-1 w-24 bg-accent-electric mt-2 rounded-full"></div>
      </div>

      {cartItems.length === 0 ? (
        <div className="text-center py-20 glass-panel rounded-2xl">
          <span className="material-symbols-outlined text-6xl text-on-surface-variant mb-4">shopping_cart</span>
          <p className="text-on-surface-variant font-medium text-lg">ตะกร้าสินค้าว่างเปล่า</p>
          <Link
            href="/"
            className="mt-6 inline-block bg-primary text-on-primary font-bold px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
          >
            เลือกสินค้าเพิ่ม
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-start">
          {/* Cart Items List */}
          <div className="lg:col-span-8 space-y-6">
            {/* Table Header (Desktop Only) */}
            <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-4 border-b border-outline-variant text-on-surface-variant font-label-sm text-label-sm uppercase tracking-wider font-bold">
              <div className="col-span-6">รายการสินค้า</div>
              <div className="col-span-2 text-center">จำนวน</div>
              <div className="col-span-3 text-right">ราคารวม</div>
              <div className="col-span-1"></div>
            </div>

            {/* Product Rows */}
            {cartItems.map((item) => (
              <div key={item.id} className="glass-panel glow-hover rounded-xl p-6 transition-all duration-300">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                  <div className="col-span-1 md:col-span-6 flex items-center gap-4">
                    <div className="w-24 h-24 bg-surface-container-highest rounded-lg overflow-hidden flex-shrink-0 border border-outline-variant">
                      <img
                        alt={item.name}
                        className="w-full h-full object-cover"
                        src={getProductImageUrl(item.image)}
                      />
                    </div>
                    <div>
                      <h3 className="font-title-md text-title-md text-on-surface mb-1 font-bold">
                        {item.name}
                      </h3>
                      <p className="text-on-surface-variant font-body-md text-body-md text-xs">
                        Digital License ({item.category})
                      </p>
                      <p className="text-accent-electric font-bold mt-1 text-sm">
                        ฿{item.price.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* Quantity Controls */}
                  <div className="col-span-1 md:col-span-2 flex justify-center items-center">
                    <div className="flex items-center bg-surface-container-low border border-outline-variant rounded-lg p-1">
                      <button
                        onClick={() => updateQuantity(item.id, -1)}
                        className="w-8 h-8 flex items-center justify-center hover:bg-surface-container-highest rounded text-on-surface transition-colors cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-sm text-on-surface-variant">remove</span>
                      </button>
                      <span className="w-10 text-center font-bold text-on-surface">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, 1)}
                        className="w-8 h-8 flex items-center justify-center hover:bg-surface-container-highest rounded text-on-surface transition-colors cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-sm text-on-surface-variant">add</span>
                      </button>
                    </div>
                  </div>

                  {/* Total Price */}
                  <div className="col-span-1 md:col-span-3 text-right">
                    <span className="font-title-md text-title-md text-on-surface font-bold">
                      ฿{(item.price * item.quantity).toLocaleString()}
                    </span>
                  </div>

                  {/* Delete Button */}
                  <div className="col-span-1 md:col-span-1 flex justify-end">
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-on-surface-variant hover:text-error transition-colors p-2 rounded-full hover:bg-error-soft cursor-pointer flex items-center"
                    >
                      <span className="material-symbols-outlined text-lg">delete</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}

            <div className="pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
              <Link
                className="flex items-center gap-2 text-on-surface-variant hover:text-accent-electric transition-colors font-body-md text-body-md text-sm font-semibold"
                href="/"
              >
                <span className="material-symbols-outlined text-sm">arrow_back</span>
                ซื้อสินค้าต่อ
              </Link>
            </div>
          </div>

          {/* Checkout Summary Card */}
          <div className="lg:col-span-4">
            <div className="glass-panel rounded-xl p-8 sticky top-28 border-t-4 border-t-accent-electric">
              <h2 className="font-headline-lg text-headline-lg text-on-surface mb-8 border-b border-outline-variant pb-4 font-bold">
                สรุปคำสั่งซื้อ
              </h2>
              <div className="space-y-4 mb-8">
                <div className="flex justify-between text-on-surface-variant font-body-md text-body-md text-sm">
                  <span>ยอดรวมสินค้า</span>
                  <span className="text-on-surface font-semibold">฿{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-on-surface-variant font-body-md text-body-md text-sm">
                  <span>ภาษี (0%)</span>
                  <span className="text-on-surface font-semibold">฿0.00</span>
                </div>
                <div className="pt-4 border-t border-outline-variant flex justify-between items-end">
                  <span className="font-title-md text-title-md text-on-surface font-bold">ยอดรวมสุทธิ</span>
                  <span className="text-3xl font-bold text-accent-electric">฿{subtotal.toLocaleString()}</span>
                </div>
              </div>
              <div className="space-y-4">
                <Link
                  href="/checkout"
                  className="w-full py-4 bg-accent-electric text-white font-bold rounded-xl shadow-[0_4px_14px_rgba(0,98,255,0.4)] hover:shadow-[0_6px_20px_rgba(0,98,255,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 flex items-center justify-center cursor-pointer"
                >
                  ดำเนินการชำระเงิน
                </Link>
                <div className="flex items-center justify-center gap-4 pt-4 opacity-70">
                  <span className="material-symbols-outlined text-3xl text-on-surface-variant">credit_card</span>
                  <span className="material-symbols-outlined text-3xl text-on-surface-variant">payments</span>
                  <span className="material-symbols-outlined text-3xl text-on-surface-variant">account_balance_wallet</span>
                </div>
                <p className="text-center text-on-surface-variant text-xs font-semibold uppercase mt-4 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[14px] mr-1 text-accent-electric fill">lock</span>
                  Secure 256-bit SSL Checkout
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
