# SoftKeyStore Stitch Redesign

## Summary

Improve all eleven SoftKeyStore routes using the supplied Google Stitch screens
as the visual source of truth. Preserve the light-mode storefront identity and
recognizable page composition while consolidating the implementation into a
coherent, responsive, accessible commerce system.

The selected direction is **Faithful System Polish**: match the source's
information hierarchy and brand cues, then improve consistency, interaction,
responsive behavior, accessibility, and maintainability.

## Source Of Truth

Google Stitch project:

- Title: `E-commerce Navigation Banner`
- Project ID: `2067195492768532722`

| Route | Stitch screen | Screen ID |
| --- | --- | --- |
| `/cart` | SoftKeyStore Shopping Cart Page (Light Mode) | `bac30703fb7a47288413d05f6a71343d` |
| `/contact` | SoftKeyStore Contact Us Page (Light Mode) | `f2c220f7c8694b1185042e596c8cdc59` |
| `/product/[id]` | Microsoft Office 2021 Product Page (Light Mode) | `999d8b7b45744a4fba0ca72f48a4152f` |
| `/how-to-buy` | SoftKeyStore How to Buy Page (Light Mode) | `0e19261e792b45a1aadb759c588f513b` |
| `/profile` | SoftKeyStore User Profile Page (Light Mode) Updated | `2aad1242520349069a3eb3a43fdd5ef9` |
| `/checkout` | SoftKeyStore Checkout Page (Light Mode) | `fd7bc167e64e4dac8e8063a1d0e883d4` |
| `/login` | SoftKeyStore Login Page (Light Mode) | `77772bdee8d14c64b8682178234f8d62` |
| `/register` | SoftKeyStore Register Page (Light Mode) Updated | `f037a2d616614f6eaf978f9b8c702b4f` |
| `/category/office` | Microsoft Office Listing Page (Light Mode) Updated | `1d3581eb65304896ae8a108fb58a966f` |
| `/category/windows` | Windows Listing Page (Light Mode) | `1159c24785b24d77ba2b378f602226d0` |
| `/` | Homepage with Full-Width Carousel | `4873ad9c05004e4caa2d709de11b0c16` |

Downloaded HTML and reference screenshots live in `stitch_screens/`. The listed
light-mode screens override the older dark-mode project theme metadata.

## Product Direction

The interface should feel like trusted commerce rather than a technology
spectacle:

- Navy establishes trust in navigation and high-confidence surfaces.
- Electric blue is reserved for primary actions, selection, and focus.
- White and neutral-gray surfaces carry most content.
- Success, warning, and error colors communicate state rather than decoration.
- Glass and glow effects are reduced to rare, purposeful uses.
- Typography remains compact and legible with Hanken Grotesk for headings and
  Inter for UI/body copy. JetBrains Mono is limited to license keys and
  technical identifiers.

## Shared Architecture

### App shell

`SiteHeader`, `MobileNav`, `SearchOverlay`, and `SiteFooter` provide consistent
navigation. The header supports working search, current-route indication, cart
count, account state, keyboard operation, and a mobile menu. Authentication
routes retain their distinct split layout without the storefront shell.

### Catalog

`ProductCard`, `ProductGrid`, `CatalogToolbar`, and `FilterPanel` are shared by
home and category routes. Cards use one hierarchy for image, category/license
type, title, rating, stock, price, and purchase action.

Filtering and sorting operate on current product data. Desktop controls remain
inline; mobile filters use a drawer or expandable region rather than a cramped
toolbar.

### Product detail

`ProductGallery`, `ProductConfigurator`, `PurchasePanel`, and `ProductTabs`
compose the product page. Add-on selections update totals immediately.
Quantity respects stock. Tabs expose product details, installation guidance,
and reviews with keyboard-accessible state.

### Purchase flow

`CartItem`, `OrderSummary`, and `PaymentSelector` are shared by cart and
checkout. Quantity, removal, promo validation, subtotal, discount, and total
update immediately. The summary stays visible on desktop without obscuring
content and returns to document flow on smaller screens.

### Forms

`Field`, `PasswordField`, `FormMessage`, and `SubmitButton` provide consistent
labels, help text, validation, focus, loading, disabled, error, and success
states across authentication, checkout, contact, and profile editing.

### Account

`ProfileNav`, `OrderList`, `LicenseKey`, and `StatusBadge` support account
summary and purchase history. The desktop order table transforms into readable
mobile records. Copying a key announces success or failure without exposing
other keys.

## Route Requirements

### Homepage

- Keep the full-width three-slide hero and category discovery.
- Pause automatic rotation while hovered, focused, or when reduced motion is
  requested.
- Provide previous, next, and direct slide controls with accessible labels.
- Load products from the existing product API.
- Show skeleton, error with retry, empty, filtered-empty, and populated states.
- Keep a featured product treatment without forcing every item into identical
  cards.

### Office And Windows Listings

- Keep the source heading, product-density, trust section, and category tone.
- Make sort and filter controls functional.
- Preserve URL or client state consistently during interactions.
- Provide mobile filter disclosure and clear-filter behavior.
- Avoid filler cards or nonfunctional "more products" placeholders.

### Office Product Page

- Preserve breadcrumbs, product image, title, rating, price, trust facts,
  add-ons, quantity, purchase actions, summary, and information tabs.
- Calculate add-on and quantity pricing from one utility.
- Disable purchase actions when stock or required configuration is invalid.
- Add-to-cart and buy-now actions provide visible confirmation and navigation.

### Cart

- Support quantity changes, removal, return-to-shopping, and checkout.
- Totals update without reload.
- Empty cart teaches the next action.
- Invalid stock or stale pricing explains how to recover.

### Checkout

- Support PromptPay and card selection as interactive presentation states.
- Validate customer and billing information inline.
- Keep order totals synchronized with cart state.
- Prevent duplicate submission while processing.
- Present explicit payment unavailable, failure, and success outcomes.

### Login And Register

- Preserve the Stitch split layout and focused form hierarchy.
- Support password visibility, validation, loading, disabled, and server-error
  states.
- Retain current credential and Google authentication behavior.
- Keep forgot-password and account-switch links clear.

### Profile

- Preserve profile summary, navigation, order history, trust information, and
  support access.
- Support order search/filter where shown.
- Provide copy-key feedback and accessible order details.
- Keep logout and profile editing distinct from destructive actions.

### How To Buy

- Present a concise three-step purchase path.
- Keep installation guidance, payment methods, and support call to action.
- Any video affordance opens meaningful content or is removed.
- Payment logos use real assets or text labels, not drawn approximations.

### Contact

- Preserve contact channels, business hours, location image, and form.
- Validate required fields and email format.
- Provide submitting, success, and recoverable error feedback.
- Do not submit personal data to an external service without explicit setup.

## Responsive Behavior

Validate at representative widths of 1440, 1024, 768, and 390 CSS pixels.

- Desktop uses a constrained twelve-column layout.
- Tablet reduces columns and reorders secondary panels when needed.
- Mobile uses a four-column content rhythm with sixteen-pixel outer margins.
- Tables become structured lists where horizontal scrolling harms usability.
- Sticky panels return to normal flow when viewport height or width is limited.
- No route has page-level horizontal overflow or clipped controls.
- Thai and English headings wrap without overflow.

## Interaction And Motion

- Standard transitions last 150-220 ms and communicate state.
- Avoid page-load choreography and decorative motion.
- Carousel motion has user controls and a reduced-motion alternative.
- Hover behavior is never the only way to reveal required information.
- Focus does not trigger navigation or context changes.
- Popovers, drawers, and overlays escape clipping and restore focus on close.

## Error And Edge States

The implementation includes:

- Product API loading failure with retry.
- Product not found.
- Empty catalog and filtered-empty results.
- Empty cart.
- Stock shortage and stale price.
- Invalid or expired promotion.
- Invalid fields and authentication failure.
- Payment method unavailable, payment failure, and duplicate-submit prevention.
- Expired session.
- Contact submission failure.
- License-key copy failure.

Every error names the problem and offers the most relevant recovery action.

## Accessibility

- Target WCAG 2.2 AA.
- Body text contrast is at least 4.5:1; large text and essential graphics meet
  their applicable thresholds.
- Keyboard focus is visible and not obscured.
- Inputs have programmatic labels and errors are associated with their fields.
- Status changes use an appropriate live region.
- Controls meet minimum target size or spacing requirements.
- Icon-only buttons have accessible names.
- Motion respects `prefers-reduced-motion`.

## Technical Constraints

- Use the installed Next.js `16.2.9` App Router conventions documented in
  `node_modules/next/dist/docs/`.
- Keep pages and layouts as Server Components by default. Add `"use client"`
  only to interactive boundaries.
- Use `next/link` for internal navigation.
- Use local assets with `next/image` when practical and configure remote image
  patterns narrowly when remote images remain.
- Preserve existing Prisma and authentication behavior.
- Build on the installed Tailwind CSS 4 setup and current route structure.
- Do not introduce a new component library unless an existing requirement
  cannot be met without one.

## Testing And Quality Gates

### Logic tests

Cover product filtering/sorting, add-on pricing, cart totals, promotion
validation, stock limits, and form validators.

### Component tests

Cover mobile navigation, carousel controls, quantity controls, configurator,
payment selection, password visibility, and license-key feedback.

### Flow verification

Verify:

1. Browse to product to cart to checkout.
2. Login and register validation.
3. Profile order and license interactions.
4. Contact form validation and feedback.
5. Keyboard navigation through primary controls.

### Visual QA

Capture each reference and implementation at equivalent desktop viewports.
Compare reference and rendered images together. Fix all P0, P1, and P2 findings
before handoff. Repeat critical routes at 390-pixel mobile width.

### Engineering gates

- ESLint passes.
- Production build passes.
- No runtime console errors on the eleven routes.
- No page-level horizontal overflow.
- `design-qa.md` exists and ends with `final result: passed`.

## Delivery Sequence

1. Tokens, shared shell, data utilities, and UI primitives.
2. Homepage, listing routes, and product detail.
3. Cart and checkout.
4. Login, register, and profile.
5. How to Buy and Contact.
6. Responsive and accessibility pass.
7. Production build and full visual QA.

## Non-goals

- Admin interfaces.
- A real payment gateway or transmission of payment details.
- New product categories or database redesign.
- A new authentication provider.
- A dark theme.
- Routes beyond the eleven supplied screens.

## Approval Record

- Direction A, Faithful System Polish: approved.
- Brand foundation and shared system: approved.
- Page architecture and component boundaries: approved.
- Quality gates and delivery sequence: approved.
