# Hero Promotion Outpaint Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create and integrate a seamless wide version of the first-purchase promotion artwork that fills the carousel without cropping its text.

**Architecture:** Use the existing 1774 by 887 PNG as the edit target and extend only its left and right environment to a roughly 3:1 canvas. Save the result as a new asset, point the first slide at it, and restore that slide to the carousel's default full-bleed `cover` behavior.

**Tech Stack:** Built-in image generation/editing, PNG, Next.js 16, React 19, CSS, Vitest

---

### Task 1: Generate and validate the wide artwork

**Files:**
- Source: `public/assets/softkeystore/hero/hero-first-purchase-150.png`
- Create: `public/assets/softkeystore/hero/hero-first-purchase-150-wide.png`

- [x] **Step 1: Generate the outpaint**

Use the source as the edit target. Preserve the entire original central artwork
pixel-faithfully and extend only the left and right sides with matching navy
space, electric-blue circuit lines, floor glow, light streaks, and sparse
floating key cards.

- [x] **Step 2: Inspect the output**

Confirm all Thai text, `150`, `WELCOME`, the ticket, bow, button, and central
composition are unchanged. Reject the output if text is regenerated, misspelled,
cropped, stretched, or duplicated.

- [x] **Step 3: Save the selected asset**

Copy the accepted generated image to:

```text
public/assets/softkeystore/hero/hero-first-purchase-150-wide.png
```

### Task 2: Lock the wide asset behavior

**Files:**
- Modify: `src/components/home/HeroCarousel.test.tsx`
- Test: `src/components/home/HeroCarousel.test.tsx`

- [x] **Step 1: Write the failing regression test**

Assert that the first slide image uses the wide asset and that no slide receives
the contain modifier.

```tsx
expect(screen.getByLabelText("ดูรายละเอียด ลูกค้าใหม่ซื้อครั้งแรกลด 150 บาท")
  .parentElement?.querySelector("img")).toHaveAttribute(
  "src",
  expect.stringContaining("hero-first-purchase-150-wide.png"),
);
expect(slides.every((slide) =>
  !slide.classList.contains("hero-carousel__slide--contain"),
)).toBe(true);
```

- [x] **Step 2: Run the focused test and verify RED**

```powershell
npm test -- --run src/components/home/HeroCarousel.test.tsx
```

Expected: FAIL because the first slide still points to the original asset and
uses the contain modifier.

### Task 3: Integrate full-bleed rendering

**Files:**
- Modify: `src/components/home/HeroCarousel.tsx`
- Modify: `src/app/globals.css`
- Test: `src/components/home/HeroCarousel.test.tsx`

- [x] **Step 1: Update the first slide asset**

```tsx
image: "/assets/softkeystore/hero/hero-first-purchase-150-wide.png",
imageFit: "cover",
```

- [x] **Step 2: Remove the unused contain modifier styles**

Delete `.hero-carousel__slide--contain` rules after no slide uses them.

- [x] **Step 3: Run the focused test and verify GREEN**

```powershell
npm test -- --run src/components/home/HeroCarousel.test.tsx
```

Expected: all carousel tests pass.

### Task 4: Verify responsive rendering

**Files:**
- Verify: `src/components/home/HeroCarousel.tsx`
- Verify: `src/app/globals.css`

- [x] **Step 1: Run static verification**

```powershell
npx eslint src/components/home/HeroCarousel.tsx src/components/home/HeroCarousel.test.tsx
npm run build
```

Expected: both commands exit successfully.

- [x] **Step 2: Inspect the homepage**

At 1440 by 900, confirm the hero fills the full width and all text remains
inside the viewport. At 390 by 844, confirm the core promotion remains legible
without horizontal overflow.

- [x] **Step 3: Review the final diff**

```powershell
git diff --check
git diff -- src/components/home/HeroCarousel.tsx src/components/home/HeroCarousel.test.tsx src/app/globals.css
```

Expected: changes are limited to the wide asset integration, its regression
test, and removal of obsolete contain-fit CSS.
