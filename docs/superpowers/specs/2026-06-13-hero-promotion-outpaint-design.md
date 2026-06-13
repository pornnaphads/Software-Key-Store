# Hero Promotion Outpaint

## Goal

Create a wider homepage hero asset that fills the carousel from edge to edge
while keeping every promotional word visible.

## Source

- Edit target: `public/assets/softkeystore/hero/hero-first-purchase-150.png`
- Source dimensions: 1774 by 887 pixels, a 2:1 aspect ratio.

## Design

- Extend the canvas to an approximately 3:1 landscape ratio.
- Preserve the complete original artwork in the center without changing,
  regenerating, stretching, or cropping its Thai and English text.
- Continue the dark navy environment, electric-blue circuit lines, light
  streaks, floor glow, and floating key-card motifs into both new side areas.
- Keep the added side areas visually quiet enough that the central promotion
  remains the focal point.
- Do not add new text, logos, watermarks, offers, characters, or products.

## Integration

- Save the generated result as a new versioned PNG beside the source image.
- Update only the first carousel slide to use the wider asset.
- Return that slide to full-bleed `cover` rendering after confirming the wider
  composition keeps all text visible at representative desktop and mobile
  widths.

## Verification

- Inspect the generated image for exact preservation of all source text.
- Confirm the left and right extensions have no visible seams.
- Run the focused carousel test suite and production build.
- Verify the first slide at 1440-pixel desktop and 390-pixel mobile widths.
