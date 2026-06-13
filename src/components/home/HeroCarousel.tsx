"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, useSyncExternalStore } from "react";

const slides = [
  {
    title: "Premium Software Marketplace",
    description:
      "ซอฟต์แวร์ลิขสิทธิ์แท้สำหรับงานและธุรกิจ ส่งรหัสดิจิทัลพร้อมคำแนะนำหลังการขาย",
    eyebrow: "Best seller",
    image: "/assets/softkeystore/hero/hero-marketplace.jpg",
    href: "/category/windows",
    cta: "เลือกซื้อ Windows",
  },
  {
    title: "Create More With The Right Tools",
    description:
      "รวมเครื่องมือสร้างสรรค์สำหรับภาพ วิดีโอ และงานออกแบบในราคาที่เข้าถึงง่าย",
    eyebrow: "Creative suite",
    image: "/assets/softkeystore/hero/hero-creative.jpg",
    href: "/category/office",
    cta: "ดูซอฟต์แวร์ยอดนิยม",
  },
  {
    title: "Secure Your Digital Life",
    description:
      "ปกป้องอุปกรณ์ ข้อมูล และการใช้งานออนไลน์ด้วยซอฟต์แวร์ความปลอดภัยที่เชื่อถือได้",
    eyebrow: "Protection",
    image: "/assets/softkeystore/hero/hero-security.jpg",
    href: "/?q=security",
    cta: "ดูโซลูชันความปลอดภัย",
  },
] as const;

function subscribeToReducedMotion(onChange: () => void) {
  const media = window.matchMedia("(prefers-reduced-motion: reduce)");
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
}

function getReducedMotionSnapshot() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function getReducedMotionServerSnapshot() {
  return false;
}

export function HeroCarousel() {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const reducedMotion = useSyncExternalStore(
    subscribeToReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot,
  );

  useEffect(() => {
    if (paused || reducedMotion) {
      return;
    }

    const timer = window.setInterval(() => {
      setCurrent((index) => (index + 1) % slides.length);
    }, 5000);
    return () => window.clearInterval(timer);
  }, [paused, reducedMotion]);

  const previous = () => {
    setCurrent((index) => (index - 1 + slides.length) % slides.length);
  };

  const next = () => {
    setCurrent((index) => (index + 1) % slides.length);
  };

  return (
    <section
      aria-label="โปรโมชั่นสินค้า"
      className="hero-carousel"
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setPaused(false);
        }
      }}
      onFocusCapture={() => setPaused(true)}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      role="region"
    >
      <div
        className="hero-carousel__track"
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {slides.map((slide, index) => (
          <article
            key={slide.title}
            aria-hidden={index !== current}
            aria-label={`${index + 1} จาก ${slides.length}: ${slide.title}`}
            className="hero-carousel__slide"
            role="group"
          >
            <Image
              priority={index === 0}
              alt=""
              fill
              sizes="100vw"
              src={slide.image}
            />
            <Link href={slide.href} className="absolute inset-0 z-10" aria-label={`ดูรายละเอียด ${slide.title}`} />
          </article>
        ))}
      </div>

      <button
        aria-label="สไลด์ก่อนหน้า"
        className="hero-carousel__arrow hero-carousel__arrow--previous"
        onClick={previous}
        type="button"
      >
        <span aria-hidden="true" className="material-symbols-outlined">
          chevron_left
        </span>
      </button>
      <button
        aria-label="สไลด์ถัดไป"
        className="hero-carousel__arrow hero-carousel__arrow--next"
        onClick={next}
        type="button"
      >
        <span aria-hidden="true" className="material-symbols-outlined">
          chevron_right
        </span>
      </button>

      <div className="hero-carousel__dots">
        {slides.map((slide, index) => (
          <button
            key={slide.title}
            aria-label={`ไปสไลด์ ${index + 1}`}
            aria-pressed={current === index}
            onClick={() => setCurrent(index)}
            type="button"
          />
        ))}
      </div>
      <p className="sr-only" role="status">
        สไลด์ {current + 1} จาก {slides.length}: {slides[current].title}
      </p>
    </section>
  );
}
