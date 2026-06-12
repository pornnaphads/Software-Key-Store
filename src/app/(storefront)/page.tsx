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

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);

  const totalSlides = 3;

  // Fetch products
  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setProducts(data);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch products:", err);
        setLoading(false);
      });
  }, []);

  // Auto scroll carousel
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % totalSlides);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const handlePrevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  const handleNextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
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
        return "https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=600&q=80";
    }
  };

  // Filter logic
  const filteredProducts = selectedCategory
    ? products.filter((p) => p.category.toLowerCase() === selectedCategory.toLowerCase())
    : products;

  // Distribute products for Bento Grid (recommendations)
  const bentoProducts = filteredProducts.slice(0, 5);
  // Rest of the products
  const remainingProducts = filteredProducts.slice(5);

  return (
    <div className="flex flex-col min-h-screen">
      <main className="pt-16">
        {/* Hero Carousel Section */}
        <section className="relative w-full overflow-hidden group">
          <div
            className="flex transition-transform duration-500 ease-in-out"
            style={{ transform: `translateX(-${currentSlide * 100}%)` }}
          >
            {/* Slide 1: Premium Software */}
            <div className="min-w-full relative flex items-center h-[360px] md:h-[500px] flex-shrink-0">
              <img
                alt="Premium Software Marketplace"
                className="absolute inset-0 w-full h-full object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAzDaJP5NTIHHTYVuPLe0HSNNvPWxfvgP9vPRBtCsLLCj91ZX4AYXg1jMe0NNEHY45XK9WhWLzn24KVI7_wNqUzsGW43vnJpJxyUKmt8ib-xgec_bTuLLVqTesp6ORnffoslmPgDUP8uPXTI-R2mXBiIIK__72_pV4bXdSXT2Lo1jsAl11hnudAeZsQjcsIaq9FOCSN3lU5tjrCQZvzNkTpoNR85SSyiBwXdp0K6YEQhBpeRJvrqgZFac7H8CuqC9nJaEfNwQ2GX2c"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/60 to-transparent flex items-center px-margin-mobile md:px-margin-desktop">
                <div className="max-w-xl">
                  <span className="font-label-sm text-label-sm text-primary uppercase tracking-widest bg-primary/10 px-3 py-1 rounded-full mb-4 inline-block">
                    Best Seller
                  </span>
                  <h2 className="font-display-lg text-3xl md:text-display-lg text-on-surface mb-4 leading-tight font-bold">
                    Premium Software Marketplace
                  </h2>
                  <p className="font-body-md text-body-md text-on-surface-variant mb-6 leading-relaxed">
                    Get authentic Windows 11 and Office 2021 licenses. Instant delivery and lifetime support.
                  </p>
                  <button
                    onClick={() => {
                      const el = document.getElementById("catalog-section");
                      el?.scrollIntoView({ behavior: "smooth" });
                    }}
                    className="bg-primary text-on-primary px-8 py-3 rounded-lg font-bold shadow-lg hover:shadow-xl transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
                  >
                    Shop Now <span className="material-symbols-outlined text-sm">shopping_cart</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Slide 2: Adobe Creative Cloud */}
            <div className="min-w-full relative flex items-center h-[360px] md:h-[500px] flex-shrink-0">
              <img
                alt="Creative Software"
                className="absolute inset-0 w-full h-full object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDl7AcpVRouUcO87j0l-9ThNlGuOlHZwTEm0_gfrYraavxykdkHM27-Wes3pe0I-pyMX1ceS7UGbZCCBtD5JFUZX_YdABcmLG8Gu5rRp2Thh0dZ1KyryHsAdrp5vCk7y0kBBxVuMmns1dUXq108Wm6PESvnfJMDaTVzmkrPwOvjOn8RjsZxIGnRM21qm5u5PEIdS4vcZfSQrCCySll7xlKN0LgzYdg_6wDnSNV8Zb15gVE0o524sBQRMf7IhAsu2nBJEuzfPuQ9RWw"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/50 to-transparent flex items-center px-margin-mobile md:px-margin-desktop">
                <div className="max-w-xl">
                  <span className="font-label-sm text-label-sm text-primary uppercase tracking-widest bg-primary/10 px-3 py-1 rounded-full mb-4 inline-block">
                    New Arrival
                  </span>
                  <h2 className="font-display-lg text-3xl md:text-display-lg text-on-surface mb-4 leading-tight font-bold">
                    Unleash Your Creativity
                  </h2>
                  <p className="font-body-md text-body-md text-on-surface-variant mb-6 leading-relaxed">
                    Adobe Creative Cloud full suite. Transform your ideas into reality with industry-leading tools.
                  </p>
                  <button
                    onClick={() => setSelectedCategory("design")}
                    className="bg-primary text-on-primary px-8 py-3 rounded-lg font-bold shadow-lg hover:shadow-xl transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
                  >
                    Shop Now <span className="material-symbols-outlined text-sm">brush</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Slide 3: Cybersecurity */}
            <div className="min-w-full relative flex items-center h-[360px] md:h-[500px] flex-shrink-0">
              <img
                alt="Cybersecurity Protection"
                className="absolute inset-0 w-full h-full object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuA1RH2hVxXcueGYcyk4uDu2nSfas7ugR1NKQKoaQtK7OS3Zdl7wisAsO4PDsEEvUk1XxZItRKo6XGuYal1RtBt_wgIqjNZIMGrT04Chl0lBWMy8bGw76BNpobGLE4WDxzqjo16eIzaIPB-0F4zAY-Ampazo5N7Bv2nIHxLL_s3pAd85__rymnF1zY-17Q1gpV_Z7yoDKxU8Hn3k7Sa0EeHxym0kUJ30OxmHcMIQxyzyO6-k-yI1z33_tm6bF5y_8bj8IRxXOS7qBVw"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/50 to-transparent flex items-center px-margin-mobile md:px-margin-desktop">
                <div className="max-w-xl">
                  <span className="font-label-sm text-label-sm text-primary uppercase tracking-widest bg-primary/10 px-3 py-1 rounded-full mb-4 inline-block">
                    Special Offer
                  </span>
                  <h2 className="font-display-lg text-3xl md:text-display-lg text-on-surface mb-4 leading-tight font-bold">
                    Secure Your Digital Life
                  </h2>
                  <p className="font-body-md text-body-md text-on-surface-variant mb-6 leading-relaxed">
                    Advanced cybersecurity and antivirus protection. Keep your data safe from every threat.
                  </p>
                  <button
                    onClick={() => setSelectedCategory("security")}
                    className="bg-primary text-on-primary px-8 py-3 rounded-lg font-bold shadow-lg hover:shadow-xl transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
                  >
                    Shop Now <span className="material-symbols-outlined text-sm">security</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Arrows */}
          <button
            className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 border border-outline-variant text-primary hover:bg-white shadow-md transition-all opacity-0 group-hover:opacity-100 z-20 cursor-pointer"
            onClick={handlePrevSlide}
          >
            <span className="material-symbols-outlined flex">chevron_left</span>
          </button>
          <button
            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 border border-outline-variant text-primary hover:bg-white shadow-md transition-all opacity-0 group-hover:opacity-100 z-20 cursor-pointer"
            onClick={handleNextSlide}
          >
            <span className="material-symbols-outlined flex">chevron_right</span>
          </button>

          {/* Pagination Dots */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3 z-20">
            {Array.from({ length: totalSlides }).map((_, index) => (
              <button
                key={index}
                className={`w-3 h-3 rounded-full transition-all duration-300 cursor-pointer ${
                  currentSlide === index ? "bg-primary w-6" : "bg-primary/30"
                }`}
                onClick={() => setCurrentSlide(index)}
              ></button>
            ))}
          </div>
        </section>

        {/* Content Wrapper */}
        <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-section-gap" id="catalog-section">
          {/* Category Filters */}
          <section className="mb-12 overflow-x-auto">
            <div className="flex items-center justify-center gap-4 py-4 min-w-max">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-full transition-all shadow-sm font-medium text-sm cursor-pointer ${
                  selectedCategory === null
                    ? "bg-primary text-on-primary"
                    : "glass-panel text-on-surface hover:border-primary border border-transparent"
                }`}
              >
                <span className="material-symbols-outlined text-sm">grid_view</span> All Brands
              </button>
              <button
                onClick={() => setSelectedCategory("os")}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-full transition-all shadow-sm font-medium text-sm cursor-pointer ${
                  selectedCategory === "os"
                    ? "bg-primary text-on-primary"
                    : "glass-panel text-on-surface hover:border-primary border border-transparent"
                }`}
              >
                <span className="material-symbols-outlined text-sm">window</span> Windows
              </button>
              <button
                onClick={() => setSelectedCategory("office")}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-full transition-all shadow-sm font-medium text-sm cursor-pointer ${
                  selectedCategory === "office"
                    ? "bg-primary text-on-primary"
                    : "glass-panel text-on-surface hover:border-primary border border-transparent"
                }`}
              >
                <span className="material-symbols-outlined text-sm">description</span> Microsoft Office
              </button>
              <button
                onClick={() => setSelectedCategory("design")}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-full transition-all shadow-sm font-medium text-sm cursor-pointer ${
                  selectedCategory === "design"
                    ? "bg-primary text-on-primary"
                    : "glass-panel text-on-surface hover:border-primary border border-transparent"
                }`}
              >
                <span className="material-symbols-outlined text-sm">brush</span> Adobe CC
              </button>
            </div>
          </section>

          {/* Recommended Products (Bento Grid Style) */}
          <section className="mb-section-gap">
            <div className="flex justify-between items-end mb-8">
              <div>
                <h2 className="font-headline-lg text-headline-lg text-on-surface font-bold">สินค้าแนะนำ</h2>
                <p className="text-on-surface-variant text-sm mt-1">Selected top-sellers for you</p>
              </div>
            </div>

            {loading ? (
              /* Bento Loading Skeleton */
              <div className="grid grid-cols-1 md:grid-cols-4 gap-gutter animate-pulse">
                <div className="md:col-span-2 md:row-span-2 rounded-2xl bg-surface-container-high h-[400px]"></div>
                <div className="rounded-2xl bg-surface-container-high h-[180px]"></div>
                <div className="rounded-2xl bg-surface-container-high h-[180px]"></div>
                <div className="rounded-2xl bg-surface-container-high h-[180px]"></div>
              </div>
            ) : bentoProducts.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-outline-variant rounded-2xl bg-surface-container">
                <p className="text-on-surface-variant font-medium">ไม่พบสินค้าในหมวดหมู่นี้</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-gutter">
                {/* Large Featured Card (First Product) */}
                {bentoProducts[0] && (
                  <div className="md:col-span-2 md:row-span-2 rounded-2xl overflow-hidden glass-panel flex flex-col group glow-hover hover:-translate-y-0.5 transition-all duration-300">
                    <div className="h-64 bg-surface-container relative overflow-hidden">
                      <img
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        src={getProductImageUrl(bentoProducts[0].image)}
                        alt={bentoProducts[0].name}
                      />
                      <span className="absolute top-4 left-4 bg-accent-electric text-white font-label-sm px-3 py-1 rounded-full text-xs font-bold">
                        BEST SELLER
                      </span>
                    </div>
                    <div className="p-8 flex-grow flex flex-col justify-between">
                      <div>
                        <Link href={`/product/${bentoProducts[0].id}`} className="font-headline-lg text-headline-lg mb-2 font-bold hover:text-primary block transition-colors">
                          {bentoProducts[0].name}
                        </Link>
                        <div className="flex flex-col gap-1 mb-4">
                          <div className="flex items-center gap-1">
                            <div className="flex text-[#FFB400]">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <span key={i} className="material-symbols-outlined text-sm fill">star</span>
                              ))}
                            </div>
                            <span className="text-xs text-on-surface-variant font-medium">(4.9)</span>
                          </div>
                          <p className="text-xs text-on-surface-variant">คีย์แท้ | มีสินค้า {bentoProducts[0].stock} ชิ้น</p>
                        </div>
                        <p className="text-on-surface-variant mb-6 text-sm line-clamp-3">
                          {bentoProducts[0].description}
                        </p>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-headline-lg text-headline-lg text-primary font-bold text-2xl">
                          ฿{bentoProducts[0].price.toLocaleString()}
                        </span>
                        <Link
                          href={`/login`}
                          className="bg-primary text-on-primary p-4 rounded-xl active:scale-95 transition-all flex items-center justify-center shadow-md hover:bg-blue-700"
                        >
                          <span className="material-symbols-outlined text-base">add_shopping_cart</span>
                        </Link>
                      </div>
                    </div>
                  </div>
                )}

                {/* Sub Cards (Other Bento Products) */}
                {bentoProducts.slice(1).map((product) => (
                  <div key={product.id} className="rounded-2xl overflow-hidden glass-panel flex flex-col glow-hover hover:-translate-y-0.5 transition-all duration-300">
                    <div className="h-40 bg-surface-container relative overflow-hidden">
                      <img
                        className="w-full h-full object-cover"
                        src={getProductImageUrl(product.image)}
                        alt={product.name}
                      />
                    </div>
                    <div className="p-6 flex-grow flex flex-col justify-between">
                      <div>
                        <Link href={`/product/${product.id}`} className="font-title-md text-title-md mb-1 font-bold line-clamp-1 hover:text-primary transition-colors block">
                          {product.name}
                        </Link>
                        <div className="flex flex-col gap-1 mt-2">
                          <div className="flex items-center gap-1">
                            <div className="flex text-[#FFB400]">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <span key={i} className="material-symbols-outlined text-[12px] fill">star</span>
                              ))}
                            </div>
                            <span className="text-[10px] text-on-surface-variant">(4.8)</span>
                          </div>
                          <p className="text-[10px] text-on-surface-variant">มีสินค้า {product.stock} คีย์</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-4">
                        <span className="font-title-md text-title-md text-primary font-bold">
                          ฿{product.price.toLocaleString()}
                        </span>
                        <Link
                          href={`/login`}
                          className="bg-surface-container-high p-2 rounded-lg text-primary hover:bg-primary hover:text-on-primary transition-colors flex items-center justify-center"
                        >
                          <span className="material-symbols-outlined text-sm">shopping_bag</span>
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* All Software Section */}
          <section className="mt-16">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
              <div>
                <h2 className="font-headline-lg text-headline-lg text-on-surface font-bold">ซอฟต์แวร์ทั้งหมด</h2>
                <p className="text-on-surface-variant text-sm mt-1">Browse our complete collection of digital licenses</p>
              </div>
            </div>

            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <div key={n} className="glass-panel rounded-xl h-48 bg-surface-container-high animate-pulse"></div>
                ))}
              </div>
            ) : remainingProducts.length === 0 ? (
              <p className="text-on-surface-variant text-sm italic">ไม่มีสินค้าเพิ่มเติมในหมวดหมู่นี้</p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {remainingProducts.map((product) => (
                  <div
                    key={product.id}
                    className="glass-panel rounded-xl overflow-hidden group hover:border-primary border border-transparent transition-all duration-300 cursor-pointer flex flex-col justify-between"
                  >
                    <div className="aspect-square bg-surface-container-high relative overflow-hidden">
                      <img
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        src={getProductImageUrl(product.image)}
                        alt={product.name}
                      />
                    </div>
                    <div className="p-3">
                      <Link href={`/product/${product.id}`} className="font-body-md text-sm font-semibold truncate text-on-surface block hover:text-primary transition-colors">
                        {product.name}
                      </Link>
                      <div className="flex justify-between items-center mt-1">
                        <p className="text-primary font-bold text-sm">฿{product.price.toLocaleString()}</p>
                        <span className="text-[10px] text-on-surface-variant">คีย์เหลือ: {product.stock}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
