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

export default function WindowsCategoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          // Filter products under 'OS' category
          const osProducts = data.filter((p) => p.category === "OS");
          setProducts(osProducts);
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
      case "windows11_pro":
        return "https://lh3.googleusercontent.com/aida-public/AB6AXuDDWLJ6QSMy1cu6vJUYlJjfoqycHgEmWl6c9ygbiP3GhS36f0UegZOjJxrAYOuh_UDspWBnYnbkQJLUPmJXsiUj999KHZoEuKcIJVtAqHxGaFrDf7rzbVzAFZIMNEHyeivFxHKwCpRgeA4ihNMz51-enReCUMMFvEh_NCE_nfUyKgbER6Mlg4GOrAEjHBPd0rJhMLxRyWb9zJ6NvXMUgix7VlYDqCP61gcONZADVfcBTDPmsOD0D2DnRBeGMxoH0e0kX2Y9CyKmUNc";
      case "windows10_pro":
        return "https://lh3.googleusercontent.com/aida-public/AB6AXuC599x6u026PR1VcBtmiwrarjZfC0F5UkLn5CzBXY_VNbTs3hj6n5qWA0HMIRL7hViRW6o4fhNOq4jehzyt4qkiThtaf47pSq8eXk--POQNM-6gHGf0OtPOmtzoREHV7gwTnLwo-FQ0-ZUr3ys2bF6h2Nbsx_Z9E8KPgLYbxiD91krQgA44b_0PyQJIAb4ZMgWi7k7El9Cu7txUdrlfww9GRnc-GYCqPO5eyEkMVoqrvnsRtSw33pdHSNwOTdFL5hWobKCFnLYBs4g";
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
    <div className="bg-white text-[#1a1c1e] font-body-md min-h-screen">
      <div className="flex pt-24 max-w-container-max mx-auto px-margin-desktop">
        <main className="flex-1 pb-section-gap">
          <header className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <div>
              <h1 className="font-headline-lg text-headline-lg text-on-surface font-bold">Windows Operating Systems</h1>
              <p className="text-on-surface-variant mt-2">สัมผัสประสบการณ์ดิจิทัลที่เหนือระดับด้วยลิขสิทธิ์แท้ 100% จาก SoftKeyStore</p>
            </div>
            <div className="flex gap-4 items-center">
              <div className="flex items-center gap-2 px-4 py-2 bg-surface-container-low border border-outline-variant rounded-lg cursor-pointer hover:border-primary transition-colors">
                <span className="text-sm">เรียงตาม: แนะนำ</span>
                <span className="material-symbols-outlined text-sm">expand_more</span>
              </div>
              <button className="flex items-center gap-2 px-4 py-2 glass-panel rounded-lg hover:bg-surface-container-high transition-all cursor-pointer">
                <span className="material-symbols-outlined text-sm">filter_list</span>
                <span className="text-sm">กรองสินค้า</span>
              </button>
            </div>
          </header>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-gutter">
              {[1, 2, 3].map((n) => (
                <div key={n} className="bg-surface border border-outline-variant p-4 rounded-2xl h-96 animate-pulse"></div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20 border border-dashed border-outline-variant rounded-2xl">
              <p className="text-on-surface-variant font-medium">ไม่พบสินค้าในหมวดหมู่นี้</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-gutter">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="bg-surface border border-outline-variant p-4 rounded-2xl flex flex-col glow-hover hover:-translate-y-0.5 transition-all duration-300 group"
                >
                  <div className="product-image-container mb-4 relative aspect-square bg-[#f1f3f4] rounded-xl overflow-hidden">
                    <img
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      src={getProductImageUrl(product.image)}
                      alt={product.name}
                    />
                    <span className="absolute top-2 left-2 px-2 py-1 bg-primary text-white font-label-sm text-[10px] rounded uppercase tracking-widest font-bold">
                      BEST SELLER
                    </span>
                  </div>
                  <div className="flex-1">
                    <Link
                      href={`/product/${product.id}`}
                      className="font-title-md text-title-md text-on-surface font-bold group-hover:text-primary transition-colors block mb-1"
                    >
                      {product.name}
                    </Link>
                    <p className="text-sm text-on-surface-variant mb-2">Digital Key - 1 PC Lifetime</p>

                    <div className="flex items-center gap-2 mb-4">
                      <div className="flex text-[#FFB400]">
                        <span className="material-symbols-outlined text-sm fill">star</span>
                        <span className="material-symbols-outlined text-sm fill">star</span>
                        <span className="material-symbols-outlined text-sm fill">star</span>
                        <span className="material-symbols-outlined text-sm fill">star</span>
                        <span className="material-symbols-outlined text-sm fill">star_half</span>
                      </div>
                      <span className="text-xs text-on-surface-variant font-medium">4.8 (12K)</span>
                      <span className="text-xs text-outline mx-1">•</span>
                      <span className="text-xs text-on-surface-variant">คีย์เหลือ {product.stock} ชิ้น</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-auto">
                    <div>
                      {product.originalPrice && (
                        <span className="text-xs text-outline line-through">฿{product.originalPrice.toLocaleString()}</span>
                      )}
                      <p className="text-xl font-bold text-primary">฿{product.price.toLocaleString()}</p>
                    </div>
                    <button
                      onClick={() => handleAddToCart(product)}
                      className="p-3 bg-primary text-white rounded-lg shadow-sm hover:bg-opacity-90 active:scale-95 transition-all cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-sm">shopping_cart</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          <div className="flex justify-center mt-12 gap-2">
            <button className="w-10 h-10 flex items-center justify-center rounded-lg border border-outline-variant hover:bg-surface-container-high transition-colors cursor-pointer">
              <span className="material-symbols-outlined text-sm">chevron_left</span>
            </button>
            <button className="w-10 h-10 flex items-center justify-center rounded-lg bg-primary text-white font-bold">1</button>
            <button className="w-10 h-10 flex items-center justify-center rounded-lg border border-outline-variant hover:bg-surface-container-high transition-colors cursor-pointer">
              <span className="material-symbols-outlined text-sm">chevron_right</span>
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}
