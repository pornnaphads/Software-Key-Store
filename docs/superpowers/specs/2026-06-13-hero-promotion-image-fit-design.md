# Hero Promotion Image Fit

## Goal

Show every word embedded in the first-purchase promotion artwork at desktop,
tablet, and mobile widths without changing the presentation of the existing
hero slides.

## Root Cause

The promotion artwork has a 2:1 aspect ratio. The carousel uses a shorter,
viewport-dependent frame and applies `object-fit: cover` by default. At wide
desktop widths, filling that frame crops the top and bottom of the artwork,
including promotional text.

## Design

- Keep `object-fit: cover` as the default for the three existing hero images.
- Mark the first-purchase promotion as a full-artwork slide.
- Render that slide with `object-fit: contain` so none of its embedded text is
  cropped.
- Use a dark navy background matching the artwork behind any letterboxing.
- Preserve the current carousel height, controls, links, timing, and motion
  behavior.

## Responsive Behavior

The full image remains visible at all viewport widths. Empty space may appear
beside or above the artwork when the carousel frame and image aspect ratios do
not match. This is preferable to cropping promotional text.

## Verification

- Add a component regression test proving only the promotion slide receives
  the contain-fit modifier.
- Run the focused carousel tests.
- Visually inspect the homepage at representative desktop and mobile widths.
- Confirm all embedded Thai and English promotional text remains visible.
