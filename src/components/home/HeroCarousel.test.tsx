import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { HeroCarousel } from "@/components/home/HeroCarousel";

describe("HeroCarousel", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    Object.defineProperty(window, "matchMedia", {
      configurable: true,
      value: vi.fn().mockReturnValue({
        matches: false,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      }),
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders three source slides and supports direct controls", () => {
    render(<HeroCarousel />);

    expect(screen.getAllByRole("group", { hidden: true })).toHaveLength(3);
    expect(screen.getByRole("status")).toHaveTextContent("สไลด์ 1 จาก 3");

    fireEvent.click(screen.getByRole("button", { name: "สไลด์ถัดไป" }));
    expect(screen.getByRole("status")).toHaveTextContent("สไลด์ 2 จาก 3");

    fireEvent.click(screen.getByRole("button", { name: "สไลด์ก่อนหน้า" }));
    expect(screen.getByRole("status")).toHaveTextContent("สไลด์ 1 จาก 3");

    fireEvent.click(screen.getByRole("button", { name: "ไปสไลด์ 3" }));
    expect(screen.getByRole("status")).toHaveTextContent("สไลด์ 3 จาก 3");
  });

  it("uses the wide promotion artwork with full-bleed fitting", () => {
    render(<HeroCarousel />);
    const slides = screen.getAllByRole("group", { hidden: true });
    const promotionImage = slides[0].querySelector("img");

    expect(promotionImage).toHaveAttribute(
      "src",
      expect.stringContaining("banner1.png"),
    );
    for (const slide of slides) {
      expect(slide).not.toHaveClass("hero-carousel__slide--contain");
    }
  });

  it("rotates automatically", () => {
    render(<HeroCarousel />);

    act(() => {
      vi.advanceTimersByTime(5000);
    });

    expect(screen.getByRole("status")).toHaveTextContent("สไลด์ 2 จาก 3");
  });

  it("pauses on hover and resumes afterward", () => {
    render(<HeroCarousel />);
    const carousel = screen.getByRole("region", { name: "โปรโมชั่นสินค้า" });

    fireEvent.mouseEnter(carousel);
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(screen.getByRole("status")).toHaveTextContent("สไลด์ 1 จาก 3");

    fireEvent.mouseLeave(carousel);
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(screen.getByRole("status")).toHaveTextContent("สไลด์ 2 จาก 3");
  });

  it("pauses while focus is inside", () => {
    render(<HeroCarousel />);
    const next = screen.getByRole("button", { name: "สไลด์ถัดไป" });

    fireEvent.focus(next);
    act(() => {
      vi.advanceTimersByTime(5000);
    });

    expect(screen.getByRole("status")).toHaveTextContent("สไลด์ 1 จาก 3");
  });

  it("does not auto-rotate with reduced motion", () => {
    vi.mocked(window.matchMedia).mockReturnValue({
      matches: true,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    } as unknown as MediaQueryList);

    render(<HeroCarousel />);
    act(() => {
      vi.advanceTimersByTime(10000);
    });

    expect(screen.getByRole("status")).toHaveTextContent("สไลด์ 1 จาก 3");
  });
});
