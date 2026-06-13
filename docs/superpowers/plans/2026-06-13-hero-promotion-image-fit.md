# Hero Promotion Image Fit Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Display the entire first-purchase promotion artwork in the homepage carousel without cropping its embedded text.

**Architecture:** Keep the carousel's existing full-bleed image behavior as the default. Add a slide-level fit flag that applies a dedicated modifier class only to artwork that must remain fully visible, and implement that modifier with `object-fit: contain` plus a matching background.

**Tech Stack:** Next.js 16, React 19, `next/image`, CSS, Vitest, Testing Library

---

### Task 1: Lock the slide-specific fit behavior

**Files:**
- Modify: `src/components/home/HeroCarousel.test.tsx`
- Test: `src/components/home/HeroCarousel.test.tsx`

- [x] **Step 1: Write the failing regression test**

Add a test that renders `HeroCarousel`, finds all four slide groups, and asserts
that only the first promotion slide has `hero-carousel__slide--contain`.

```tsx
it("contains the full promotion artwork without changing other slides", () => {
  render(<HeroCarousel />);
  const slides = screen.getAllByRole("group", { hidden: true });

  expect(slides[0]).toHaveClass("hero-carousel__slide--contain");
  expect(slides.slice(1)).toSatisfy((items: HTMLElement[]) =>
    items.every((item) => !item.classList.contains("hero-carousel__slide--contain")),
  );
});
```

- [x] **Step 2: Run the focused test and verify RED**

Run:

```powershell
npm test -- --run src/components/home/HeroCarousel.test.tsx
```

Expected: the new assertion fails because the slide-specific contain modifier is
not implemented in the committed baseline.

### Task 2: Apply full-artwork fitting to the promotion slide

**Files:**
- Modify: `src/components/home/HeroCarousel.tsx`
- Modify: `src/app/globals.css`
- Test: `src/components/home/HeroCarousel.test.tsx`

- [x] **Step 1: Add explicit slide metadata**

Set `imageFit: "contain"` on the first-purchase promotion and derive the
modifier from `slide.imageFit === "contain"`.

```tsx
className={`hero-carousel__slide${
  slide.imageFit === "contain" ? " hero-carousel__slide--contain" : ""
}`}
```

- [x] **Step 2: Add the contain-fit CSS**

```css
.hero-carousel__slide--contain {
  background: #03133e;
}

.hero-carousel__slide--contain > img {
  object-fit: contain;
}
```

- [x] **Step 3: Run the focused test and verify GREEN**

Run:

```powershell
npm test -- --run src/components/home/HeroCarousel.test.tsx
```

Expected: all `HeroCarousel` tests pass.

### Task 3: Verify the responsive result

**Files:**
- Verify: `src/components/home/HeroCarousel.tsx`
- Verify: `src/app/globals.css`

- [x] **Step 1: Run static checks**

```powershell
npx eslint src/components/home/HeroCarousel.tsx src/components/home/HeroCarousel.test.tsx
npm run build
```

Expected: both commands exit successfully.

- [x] **Step 2: Inspect the homepage in the browser**

Open `http://localhost:3000`, then inspect the first slide at desktop and
mobile widths. Confirm the artwork's top heading, `150 บาท`, coupon code, and
right-side ticket text are all inside the carousel viewport.

- [x] **Step 3: Review the final diff**

```powershell
git diff -- src/components/home/HeroCarousel.tsx src/components/home/HeroCarousel.test.tsx src/app/globals.css
```

Expected: the diff is limited to the new promotion slide, its regression test,
and the slide-specific image fitting styles.
