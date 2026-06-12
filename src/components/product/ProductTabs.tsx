"use client";

import { useId, useRef, useState } from "react";

import type { ProductReview } from "@/types/commerce";

const TAB_LABELS = ["รายละเอียดสินค้า", "วิธีติดตั้ง", "รีวิว"] as const;

export function ProductTabs({ reviews }: { reviews: ProductReview[] }) {
  const id = useId().replaceAll(":", "");
  const [activeIndex, setActiveIndex] = useState(0);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const selectTab = (index: number, moveFocus = false) => {
    setActiveIndex(index);
    if (moveFocus) {
      tabRefs.current[index]?.focus();
    }
  };

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) => {
    let nextIndex: number | null = null;

    switch (event.key) {
      case "ArrowRight":
        nextIndex = (index + 1) % TAB_LABELS.length;
        break;
      case "ArrowLeft":
        nextIndex = (index - 1 + TAB_LABELS.length) % TAB_LABELS.length;
        break;
      case "Home":
        nextIndex = 0;
        break;
      case "End":
        nextIndex = TAB_LABELS.length - 1;
        break;
      default:
        return;
    }

    event.preventDefault();
    selectTab(nextIndex, true);
  };

  return (
    <section className="product-tabs">
      <div aria-label="ข้อมูลสินค้า" className="product-tabs__list" role="tablist">
        {TAB_LABELS.map((label, index) => (
          <button
            aria-controls={`product-panel-${id}-${index}`}
            aria-selected={activeIndex === index}
            id={`product-tab-${id}-${index}`}
            key={label}
            onClick={() => selectTab(index)}
            onKeyDown={(event) => handleKeyDown(event, index)}
            ref={(node) => {
              tabRefs.current[index] = node;
            }}
            role="tab"
            tabIndex={activeIndex === index ? 0 : -1}
            type="button"
          >
            {label}
            {index === 2 && reviews.length > 0 ? ` (${reviews.length})` : ""}
          </button>
        ))}
      </div>

      <div
        aria-labelledby={`product-tab-${id}-${activeIndex}`}
        className="product-tabs__panel"
        id={`product-panel-${id}-${activeIndex}`}
        role="tabpanel"
        tabIndex={0}
      >
        {activeIndex === 0 ? (
          <div className="product-tabs__details">
            <div>
              <span className="material-symbols-outlined">license</span>
              <h3>สิทธิ์การใช้งานถูกต้อง</h3>
              <p>
                Product Key สำหรับเปิดใช้งานซอฟต์แวร์ตามเงื่อนไขของผู้ผลิต
                พร้อมหลักฐานคำสั่งซื้อ
              </p>
            </div>
            <div>
              <span className="material-symbols-outlined">update</span>
              <h3>อัปเดตได้ตามปกติ</h3>
              <p>
                ดาวน์โหลดไฟล์ติดตั้งจากแหล่งทางการและรับการอัปเดตความปลอดภัย
                ตามรุ่นที่รองรับ
              </p>
            </div>
            <div>
              <span className="material-symbols-outlined">devices</span>
              <h3>พร้อมเริ่มใช้งาน</h3>
              <p>
                คำแนะนำชัดเจนตั้งแต่ดาวน์โหลด ติดตั้ง
                จนถึงการเปิดใช้งานบนอุปกรณ์ของคุณ
              </p>
            </div>
          </div>
        ) : null}

        {activeIndex === 1 ? (
          <ol className="product-tabs__steps">
            <li>
              <span>01</span>
              <div>
                <h3>รับอีเมลคำสั่งซื้อ</h3>
                <p>ตรวจสอบ Product Key และลิงก์ดาวน์โหลดที่จัดส่งอัตโนมัติ</p>
              </div>
            </li>
            <li>
              <span>02</span>
              <div>
                <h3>ดาวน์โหลดและติดตั้ง</h3>
                <p>เปิดลิงก์ทางการและทำตามคู่มือทีละขั้นตอน</p>
              </div>
            </li>
            <li>
              <span>03</span>
              <div>
                <h3>เปิดใช้งานซอฟต์แวร์</h3>
                <p>กรอก Product Key แล้วตรวจสอบสถานะการเปิดใช้งานให้เรียบร้อย</p>
              </div>
            </li>
          </ol>
        ) : null}

        {activeIndex === 2 ? (
          reviews.length > 0 ? (
            <div className="product-reviews">
              {reviews.map((review) => (
                <article key={review.id}>
                  <div>
                    <strong>{review.authorName}</strong>
                    <span aria-label={`${review.rating} จาก 5 ดาว`}>
                      {"★".repeat(review.rating)}
                      {"☆".repeat(Math.max(0, 5 - review.rating))}
                    </span>
                  </div>
                  <p>{review.comment}</p>
                  <time dateTime={review.createdAt}>
                    {new Intl.DateTimeFormat("th-TH", {
                      dateStyle: "medium",
                    }).format(new Date(review.createdAt))}
                  </time>
                </article>
              ))}
            </div>
          ) : (
            <div className="product-reviews__empty">
              <span aria-hidden="true" className="material-symbols-outlined">
                rate_review
              </span>
              <h3>ยังไม่มีรีวิวสำหรับสินค้านี้</h3>
              <p>รีวิวจากผู้ซื้อที่ยืนยันแล้วจะแสดงในส่วนนี้</p>
            </div>
          )
        ) : null}
      </div>
    </section>
  );
}
