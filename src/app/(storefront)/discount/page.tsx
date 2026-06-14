"use client";

import { useRef, useState, useCallback } from "react";

const discountCodes = [
  {
    id: 1,
    badge: "WELCOME BONUS",
    badgeColor: "#4361EE",
    amount: 50,
    code: "NEWUSER50",
    conditions: [
      "สำหรับสมาชิกใหม่เท่านั้น",
      "ใช้งานภายใน 7 วันหลังสมัครสมาชิก",
    ],
    expiry: "31 ธ.ค. 2567",
    usedCount: 3421,
  },
  {
    id: 2,
    badge: "JUNE SPECIAL",
    badgeColor: "#10B981",
    amount: 30,
    code: "MEMBER3JUN",
    conditions: ["ขั้นต่ำ 1,500 บาท", "จำกัด 1 สิทธิ์ต่อบัญชี"],
    expiry: "30 มิ.ย. 2567",
    usedCount: 850,
  },
  {
    id: 3,
    badge: "OFFICE PROMO",
    badgeColor: "#F59E0B",
    amount: 20,
    code: "OFFICE20",
    conditions: [
      "เฉพาะหมวดหมู่ Microsoft Office",
      "ไม่มีขั้นต่ำในการสั่งซื้อ",
    ],
    expiry: "15 ก.ค. 2567",
    usedCount: 1209,
  },
  {
    id: 4,
    badge: "SUMMER SALE",
    badgeColor: "#EF4444",
    amount: 100,
    code: "SUMMER100",
    conditions: ["ขั้นต่ำ 3,000 บาท", "ใช้ได้ทุกหมวดหมู่"],
    expiry: "31 ส.ค. 2567",
    usedCount: 567,
  },
  {
    id: 5,
    badge: "ADOBE DEAL",
    badgeColor: "#8B5CF6",
    amount: 40,
    code: "ADOBE40OFF",
    conditions: [
      "เฉพาะหมวดหมู่ Adobe Creative Cloud",
      "จำกัด 1 สิทธิ์ต่อบัญชี",
    ],
    expiry: "28 ก.พ. 2568",
    usedCount: 412,
  },
  {
    id: 6,
    badge: "WINDOWS PRO",
    badgeColor: "#0EA5E9",
    amount: 25,
    code: "WINPRO25",
    conditions: [
      "เฉพาะหมวดหมู่ Windows",
      "ไม่มีขั้นต่ำในการสั่งซื้อ",
    ],
    expiry: "30 ก.ย. 2567",
    usedCount: 1834,
  },
] as const;

function formatNumber(n: number): string {
  return n.toLocaleString("th-TH");
}

export default function DiscountPage() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const checkScroll = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  }, []);

  function scroll(direction: "left" | "right") {
    const el = trackRef.current;
    if (!el) return;
    const cardWidth = el.querySelector<HTMLElement>(".discount-card")?.offsetWidth ?? 380;
    const gap = 20;
    const distance = cardWidth + gap;
    el.scrollBy({ left: direction === "right" ? distance : -distance, behavior: "smooth" });
    setTimeout(checkScroll, 350);
  }

  function copyCode(code: string) {
    navigator.clipboard.writeText(code).then(() => {
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2000);
    });
  }

  return (
    <>
      {/* Hero header */}
      <section className="discount-hero">
        <div className="discount-hero__inner">
          <h1>โค้ดส่วนลดพิเศษ</h1>
          <p>
            ประหยัดได้มากขึ้นด้วยโปรส่วนลดสำหรับสินค้า Microsoft Office, Windows
            และซอฟต์แวร์ลิขสิทธิ์แท้ รับฟรีส่วนลดทันทีเมื่อสั่งซื้อด้วยความมั่นใจ
          </p>
        </div>
      </section>

      {/* Discount carousel */}
      <section className="discount-section storefront-container">
        <div className="discount-carousel">
          {canScrollLeft && (
            <button
              className="discount-carousel__arrow discount-carousel__arrow--left"
              onClick={() => scroll("left")}
              aria-label="เลื่อนไปทางซ้าย"
            >
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
          )}

          <div
            className="discount-carousel__track"
            ref={trackRef}
            onScroll={checkScroll}
          >
            {discountCodes.map((item) => (
              <article key={item.id} className="discount-card">
                {/* Top section */}
                <div className="discount-card__top">
                  <span
                    className="discount-card__badge"
                    style={{ background: item.badgeColor }}
                  >
                    {item.badge}
                  </span>
                  <div className="discount-card__amount">
                    <span className="discount-card__currency">฿</span>
                    <strong>{item.amount}</strong>
                    <small>CASH DISCOUNT</small>
                  </div>
                </div>

                {/* Code section */}
                <div className="discount-card__code-row">
                  <code className="discount-card__code">{item.code}</code>
                  <button
                    className="discount-card__copy"
                    onClick={() => copyCode(item.code)}
                  >
                    <span className="material-symbols-outlined">
                      {copiedCode === item.code ? "check" : "content_copy"}
                    </span>
                    {copiedCode === item.code ? "คัดลอกแล้ว" : "คัดลอก"}
                  </button>
                </div>

                {/* Conditions */}
                <ul className="discount-card__conditions">
                  {item.conditions.map((cond, i) => (
                    <li key={i}>
                      <span className="material-symbols-outlined">check_circle</span>
                      {cond}
                    </li>
                  ))}
                </ul>

                {/* Footer */}
                <div className="discount-card__footer">
                  <span>
                    <span className="material-symbols-outlined">calendar_today</span>
                    {item.expiry}
                  </span>
                  <span>{formatNumber(item.usedCount)} ใช้แล้ว</span>
                </div>
              </article>
            ))}
          </div>

          {canScrollRight && (
            <button
              className="discount-carousel__arrow discount-carousel__arrow--right"
              onClick={() => scroll("right")}
              aria-label="เลื่อนไปทางขวา"
            >
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          )}
        </div>
      </section>
    </>
  );
}
