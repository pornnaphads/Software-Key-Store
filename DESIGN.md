# SoftKeyStore Design System

## Source

- Google Stitch project: `E-commerce Navigation Banner`
- Project ID: `2067195492768532722`
- The eleven downloaded light-mode screens in `stitch_screens/references/`
  are the visual source of truth.
- The light screens override the older dark project-theme metadata.

## Direction

Faithful System Polish preserves the Stitch hierarchy and recognizable brand
cues while making the storefront coherent, responsive, accessible, and
production-ready. The interface should feel like trusted digital commerce,
not a technology spectacle.

## Color

| Token | Value | Use |
| --- | --- | --- |
| Navy 950 | `#071a3a` | Header, footer, high-confidence surfaces |
| Navy 900 | `#0b2147` | Hover and elevated navy surfaces |
| Blue 600 | `#0969da` | Primary actions and selected state |
| Blue 500 | `#1683ff` | Focus and active accents |
| Blue 100 | `#dcecff` | Selected and informational surfaces |
| Cyan 500 | `#08a7c4` | Secondary commerce accent |
| White | `#ffffff` | Primary surface |
| Gray 50 | `#f7f9fc` | Page background |
| Gray 100 | `#eef2f7` | Muted surface |
| Gray 200 | `#dce3ec` | Dividers and borders |
| Gray 600 | `#526071` | Secondary text |
| Gray 900 | `#152033` | Primary text |
| Success | `#0f7a4f` | Completed and available states |
| Warning | `#a65d00` | Stock and recoverable attention |
| Error | `#b42318` | Validation and failure |

Electric blue is reserved for actions, selection, links, and focus. Success,
warning, and error colors communicate state rather than decoration.

## Typography

- Display and headings: Hanken Grotesk, weights 600-800.
- Body and UI: Inter, weights 400-600.
- License keys and technical identifiers: JetBrains Mono, weight 500.
- Thai text falls through to the platform sans-serif while preserving the
  same line-height and hierarchy.
- Body copy: 16/26 pixels.
- Compact UI copy: 14/20 pixels.
- Page title: clamp from 34 to 52 pixels.
- Section title: clamp from 26 to 36 pixels.

## Layout

- Maximum content width: 1280 pixels.
- Desktop: twelve-column grid with 24-pixel gutters.
- Tablet: reduced columns with secondary panels reordered as needed.
- Mobile: four-column rhythm with 16-pixel outer margins.
- Representative QA widths: 1440, 1024, 768, and 390 CSS pixels.
- Header height: 72 pixels desktop, 64 pixels mobile.
- Section spacing: 64-88 pixels desktop, 40-56 pixels mobile.

## Shape And Elevation

- Controls: 10-12 pixel radius.
- Cards and panels: 16 pixel radius.
- Feature and hero containers: 20-24 pixel radius.
- Pills are limited to tags, filters, and status labels.
- Default cards use a one-pixel neutral border and restrained shadow.
- Glass and glow are limited to source-faithful hero artwork and transient
  overlays; they are not the default card treatment.

## Interaction

- Standard transitions: 150-220 milliseconds.
- Primary controls expose hover, active, disabled, loading, and focus states.
- Focus uses a visible two-pixel blue ring with a two-pixel offset.
- Overlays restore focus on close and close with Escape.
- Carousel motion pauses on hover and focus and stops for reduced motion.
- Hover is never the only way to reveal required information.

## Accessibility

- Target WCAG 2.2 AA.
- Body text contrast is at least 4.5:1.
- Inputs have programmatic labels and associated error text.
- Status changes use `role="status"` or `role="alert"` as appropriate.
- Icon-only buttons have accessible names.
- Controls are at least 24 by 24 CSS pixels with sufficient spacing, with
  44-pixel targets preferred for primary and mobile actions.
- Sticky content may not obscure keyboard focus.

## Shared Components

- App shell: `SiteHeader`, `MobileNav`, `SearchOverlay`, `SiteFooter`.
- Catalog: `ProductCard`, `ProductGrid`, `CatalogToolbar`, `FilterPanel`.
- Product: `ProductGallery`, `ProductConfigurator`, `PurchasePanel`,
  `ProductTabs`.
- Purchase: `CartItem`, `QuantityControl`, `OrderSummary`, `PaymentSelector`.
- Forms: `Field`, `PasswordField`, `FormMessage`, `SubmitButton`.
- Account: `ProfileNav`, `OrderList`, `LicenseKey`, `StatusBadge`.

## Assets

Visible raster assets are downloaded from the supplied Stitch HTML into
`public/assets/softkeystore/` and rendered with `next/image`. Product image
keys resolve through `src/lib/product-assets.ts`. Do not add placeholder
boxes, CSS drawings, handcrafted SVGs, or broad remote-image allowlists.
