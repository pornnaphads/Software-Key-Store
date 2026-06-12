# SoftKeyStore Stitch Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the eleven approved SoftKeyStore routes as a faithful, responsive, accessible implementation of the supplied light-mode Google Stitch screens while preserving the current Prisma, mock credential, Google authentication, route, and local-cart behavior.

**Architecture:** Keep the App Router server-first. Route groups separate the storefront shell from the split-screen authentication shell without changing URLs. Catalog data continues to come from `/api/products`, product detail reads through a server-only repository, and all browser persistence is isolated behind typed cart and mock-auth adapters. Shared layout, catalog, product, purchase, form, and account components replace the duplicated page-local implementations.

**Tech Stack:** Next.js 16.2.9 App Router, React 19.2.4, TypeScript 5, Tailwind CSS 4, Prisma 7 with MariaDB, NextAuth 5 beta, Vitest, React Testing Library, Playwright, axe-core, and the Codex in-app Browser for visual QA.

---

## Implementation Rules

- Read the relevant guide in `node_modules/next/dist/docs/` before changing a Next.js API or convention. The minimum set for this plan is:
  - `01-app/01-getting-started/03-layouts-and-pages.md`
  - `01-app/01-getting-started/04-linking-and-navigating.md`
  - `01-app/01-getting-started/05-server-and-client-components.md`
  - `01-app/01-getting-started/11-css.md`
  - `01-app/01-getting-started/12-images.md`
  - `01-app/02-guides/testing/vitest.md`
  - `01-app/02-guides/testing/playwright.md`
  - `01-app/02-guides/production-checklist.md`
- Preserve unrelated dirty-worktree changes. Stage only the files named by the current task.
- Use `apply_patch` for manual edits.
- For each behavior task, write the failing test first, run it and confirm the expected failure, implement the minimum behavior, rerun the focused test, then run the related test group.
- Use the screenshots in `stitch_screens/references/` and the downloaded Stitch HTML in `stitch_screens/` as visual truth. Do not invent substitute graphics.
- Keep Thai source files UTF-8. Repair the currently mojibake Thai text while touching each route.
- Use `next/image` for visible raster assets and `next/link` for internal navigation.
- Do not add a UI component library. Continue using the Material Symbols icon font already present in the visual source, with accessible names on icon-only controls.
- Do not introduce a real payment gateway, persist contact submissions, or transmit card data.
- Treat WCAG 2.2 AA as the accessibility acceptance target.

## Task 1: Establish The Test And Verification Harness

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`
- Create: `vitest.config.mts`
- Create: `src/test/setup.ts`
- Create: `src/test/smoke.test.ts`
- Create: `playwright.config.ts`
- Create: `tests/e2e/health.spec.ts`

- [ ] **Step 1: Record the pre-change baseline**

Run:

```powershell
npm run lint
npm run build
```

Record any pre-existing failure in the task notes. Do not fix unrelated failures in this step.

- [ ] **Step 2: Install the approved test dependencies**

Run:

```powershell
npm install --save-dev vitest @vitest/coverage-v8 @vitejs/plugin-react vite-tsconfig-paths jsdom @testing-library/react @testing-library/dom @testing-library/jest-dom @testing-library/user-event @playwright/test @axe-core/playwright sharp
```

- [ ] **Step 3: Add deterministic scripts**

Add these scripts to `package.json`:

```json
{
  "test": "vitest",
  "test:run": "vitest run",
  "test:coverage": "vitest run --coverage",
  "test:e2e": "playwright test",
  "test:e2e:ui": "playwright test --ui"
}
```

- [ ] **Step 4: Configure Vitest and shared browser mocks**

Configure `vitest.config.mts` with `react()`, `tsconfigPaths()`, `environment: "jsdom"`, `setupFiles: ["./src/test/setup.ts"]`, and `restoreMocks: true`.

In `src/test/setup.ts`:

```ts
import "@testing-library/jest-dom/vitest";

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => undefined,
    removeListener: () => undefined,
    addEventListener: () => undefined,
    removeEventListener: () => undefined,
    dispatchEvent: () => false,
  }),
});
```

- [ ] **Step 5: Write the harness smoke test**

`src/test/smoke.test.ts` must verify the test environment exposes `document` and the configured `@/*` path alias.

- [ ] **Step 6: Configure Playwright without running it yet**

Use `baseURL: "http://127.0.0.1:3000"`, a `webServer` command of `npm run dev -- --hostname 127.0.0.1`, one Chromium project, screenshot on failure, trace on first retry, and serial execution for local mock-auth state.

`tests/e2e/health.spec.ts` should only assert that `/` returns a document and has a `main` landmark.

Per Product Design browser policy, ask the user before the first Playwright CLI invocation. If approval is declined, retain the specs and run equivalent checks with the in-app Browser.

- [ ] **Step 7: Verify the unit harness**

Run:

```powershell
npm run test:run -- src/test/smoke.test.ts
```

Expected: one passing test file.

- [ ] **Step 8: Commit the harness**

```powershell
git add package.json package-lock.json vitest.config.mts playwright.config.ts src/test/setup.ts src/test/smoke.test.ts tests/e2e/health.spec.ts
git commit -m "test: add storefront verification harness"
```

## Task 2: Localize Stitch Assets And Establish The Design Foundation

**Files:**
- Create: `DESIGN.md`
- Create: `scripts/download-stitch-assets.mjs`
- Create: `src/lib/product-assets.ts`
- Create: `public/assets/softkeystore/hero/hero-windows.jpg`
- Create: `public/assets/softkeystore/hero/hero-office.jpg`
- Create: `public/assets/softkeystore/hero/hero-creative.jpg`
- Create: `public/assets/softkeystore/products/windows11-pro.png`
- Create: `public/assets/softkeystore/products/windows10-pro.png`
- Create: `public/assets/softkeystore/products/office2021-pro.png`
- Create: `public/assets/softkeystore/products/adobe-creative-cloud.png`
- Create: `public/assets/softkeystore/products/adobe-photoshop.png`
- Create: `public/assets/softkeystore/products/adobe-premiere.png`
- Create: `public/assets/softkeystore/products/kaspersky-total.png`
- Create: `public/assets/softkeystore/products/eset-smart.png`
- Create: `public/assets/softkeystore/products/ccleaner-pro.png`
- Create: `public/assets/softkeystore/products/nordvpn.png`
- Create: `public/assets/softkeystore/support/contact-location.jpg`
- Create: `public/assets/softkeystore/support/how-to-buy.jpg`
- Create: `public/assets/softkeystore/auth/login-trust.jpg`
- Create: `public/assets/softkeystore/auth/register-products.jpg`
- Modify: `src/app/globals.css`
- Modify: `src/app/layout.tsx`
- Modify: `next.config.ts`
- Create: `src/lib/__tests__/product-assets.test.ts`

- [ ] **Step 1: Write the asset-manifest test first**

Test that every Prisma seed image key resolves to a local `/assets/softkeystore/...` path and that an unknown key resolves to the real local Office fallback rather than Unsplash or a placeholder.

```ts
expect(getProductAsset("windows11_pro")).toBe(
  "/assets/softkeystore/products/windows11-pro.png",
);
expect(getProductAsset("unknown")).toBe(
  "/assets/softkeystore/products/office2021-pro.png",
);
```

Run:

```powershell
npm run test:run -- src/lib/__tests__/product-assets.test.ts
```

Expected: fail because the manifest does not exist.

- [ ] **Step 2: Create a checked-in download manifest**

`scripts/download-stitch-assets.mjs` must contain an explicit array of `{ source, target }` pairs taken from the existing `stitch_screens/*.html` and current route files. It must:

- create parent directories,
- use `fetch` with redirect following,
- reject non-2xx responses,
- reject empty bodies,
- skip existing files unless `--force` is present,
- print the final target and byte count.

Do not use screenshot crops as product assets and do not use generated placeholders.

- [ ] **Step 3: Download and inspect the assets**

Run:

```powershell
node scripts/download-stitch-assets.mjs
Get-ChildItem public/assets/softkeystore -Recurse -File | Select-Object FullName,Length
```

Open each downloaded asset with `view_image` before using it. Correct any manifest entry whose subject or crop does not match the named slot.

- [ ] **Step 4: Implement the typed asset resolver**

`src/lib/product-assets.ts` must export:

```ts
export type ProductImageKey =
  | "windows11_pro"
  | "windows10_pro"
  | "office2021_pro"
  | "adobe_cc"
  | "adobe_photoshop"
  | "adobe_premiere"
  | "kaspersky_total"
  | "eset_smart"
  | "ccleaner_pro"
  | "nordvpn_1yr";

export function getProductAsset(imageKey: string | null): string;
```

- [ ] **Step 5: Capture the approved design system in `DESIGN.md`**

Document the exact palette, type roles, radius scale, spacing scale, elevation, focus treatment, container widths, responsive breakpoints, and component rules approved in the spec. Include the Stitch project and screen IDs and state that the light screens override the old project metadata.

- [ ] **Step 6: Replace global ad hoc styling with stable tokens**

In `src/app/layout.tsx`, use `Hanken_Grotesk`, `Inter`, and `JetBrains_Mono` from `next/font/google`; set correct Thai metadata and remove mojibake.

In `src/app/globals.css`:

- remove the Google font-family `@import`,
- retain the Material Symbols import because it matches the source icon system,
- expose font variables from `next/font`,
- normalize focus-visible, selection, body, button, input, dialog, and reduced-motion behavior,
- replace `.glass-panel`, `.hero-glow`, and `.glow-hover` as defaults with restrained `.surface-card`, `.surface-muted`, and `.focus-ring` utilities,
- keep one purposeful hero glow utility only for source-faithful hero artwork,
- define `--header-height`, `--container`, `--page-gutter`, and safe mobile spacing.

Keep `next.config.ts` free of broad remote image wildcards because all visible assets are local.

- [ ] **Step 7: Verify assets and foundation**

Run:

```powershell
npm run test:run -- src/lib/__tests__/product-assets.test.ts
npm run lint
npm run build
```

- [ ] **Step 8: Commit the foundation**

```powershell
git add DESIGN.md scripts/download-stitch-assets.mjs public/assets/softkeystore src/lib/product-assets.ts src/lib/__tests__/product-assets.test.ts src/app/globals.css src/app/layout.tsx next.config.ts
git commit -m "feat: establish SoftKeyStore design foundation"
```

## Task 3: Create Typed Product Data, Catalog Logic, Pricing, And Validation

**Files:**
- Create: `src/types/commerce.ts`
- Create: `src/data/products.ts`
- Modify: `src/app/api/products/route.ts`
- Create: `src/features/catalog/catalog.ts`
- Create: `src/features/catalog/catalog.test.ts`
- Create: `src/features/product/product-options.ts`
- Create: `src/features/product/pricing.ts`
- Create: `src/features/product/pricing.test.ts`
- Create: `src/features/forms/validation.ts`
- Create: `src/features/forms/validation.test.ts`

- [ ] **Step 1: Define the public commerce contracts**

`src/types/commerce.ts` must define serializable `ProductSummary`, `ProductDetail`, `CatalogCategory`, `CatalogSort`, `ProductOption`, and `FieldErrors` types. Do not export Prisma model types to client components.

- [ ] **Step 2: Write failing catalog tests**

Cover:

- category aliases: `OS` belongs to the Windows route and `Office` belongs to Office,
- case-insensitive Thai/English text search,
- price ascending and descending,
- featured ordering,
- no mutation of the input array,
- empty and filtered-empty results.

Run:

```powershell
npm run test:run -- src/features/catalog/catalog.test.ts
```

Expected: fail because catalog logic is missing.

- [ ] **Step 3: Implement catalog logic**

Export `filterProducts`, `sortProducts`, and `getCatalogResult`. Return a result object with `items`, `total`, `isEmpty`, and `isFilteredEmpty` so pages do not infer state from markup.

- [ ] **Step 4: Write failing product-pricing tests**

Preserve the existing Office option prices:

```ts
export const OFFICE_OPTIONS = [
  { id: "word", label: "Microsoft Word", price: 450 },
  { id: "excel", label: "Microsoft Excel", price: 450 },
  { id: "powerpoint", label: "Microsoft PowerPoint", price: 390 },
] as const;
```

Test no options, multiple options, quantity multiplication, quantity clamping to stock, and unavailable stock.

- [ ] **Step 5: Implement product pricing**

Export `getConfiguredUnitPrice`, `getConfiguredTotal`, and `clampQuantity`. Use integer baht arithmetic and format only at the presentation boundary.

- [ ] **Step 6: Write failing form-validation tests**

Cover:

- required values,
- normalized email validation,
- password minimum six characters to preserve current behavior,
- matching confirmation,
- terms acceptance,
- checkout customer names and email,
- contact subject and message,
- whitespace-only rejection.

- [ ] **Step 7: Implement validation**

Export `validateLogin`, `validateRegistration`, `validateCheckoutContact`, and `validateContact`. Return field-keyed errors plus a form-level error only when no single field owns the problem.

- [ ] **Step 8: Add the server-only product repository**

`src/data/products.ts` must import `server-only`, query Prisma, map records to the public types, and export:

```ts
export async function listProducts(): Promise<ProductSummary[]>;
export async function getProductById(id: number): Promise<ProductDetail | null>;
```

Keep `/api/products` as the catalog endpoint and make it call `listProducts()`. Return a stable `{ products }` payload on success and `{ message }` on failure.

- [ ] **Step 9: Verify the domain layer**

Run:

```powershell
npm run test:run -- src/features/catalog/catalog.test.ts src/features/product/pricing.test.ts src/features/forms/validation.test.ts
npm run lint
npm run build
```

- [ ] **Step 10: Commit the domain layer**

```powershell
git add src/types/commerce.ts src/data/products.ts src/app/api/products/route.ts src/features/catalog src/features/product src/features/forms
git commit -m "feat: add typed storefront domain logic"
```

## Task 4: Replace Ad Hoc Local Storage With A Tested Cart Domain

**Files:**
- Create: `src/features/cart/cart-types.ts`
- Create: `src/features/cart/cart-math.ts`
- Create: `src/features/cart/cart-math.test.ts`
- Create: `src/features/cart/cart-storage.ts`
- Create: `src/features/cart/cart-storage.test.ts`
- Create: `src/features/cart/CartProvider.tsx`
- Create: `src/features/cart/CartProvider.test.tsx`
- Modify: `src/components/Providers.tsx`

- [ ] **Step 1: Define cart lines by product and configuration**

Use a stable string `lineId` so two configurations of the same product can coexist:

```ts
export interface CartLine {
  lineId: string;
  productId: number;
  name: string;
  category: string;
  imageKey: string | null;
  unitPrice: number;
  quantity: number;
  stock: number;
  options: Array<{ id: string; label: string; price: number }>;
}
```

- [ ] **Step 2: Write failing cart-math tests**

Cover:

- adding a new line,
- merging only identical configurations,
- preserving distinct configurations,
- decrement floor of one,
- stock ceiling,
- removal,
- subtotal,
- `SOFTKEY10` as a deterministic 10% mock promotion,
- invalid and expired promotion messages,
- price and stock reconciliation against current product data.

- [ ] **Step 3: Implement pure cart math**

Export `createLineId`, `addCartLine`, `setLineQuantity`, `removeCartLine`, `calculateCartTotals`, `validatePromotion`, and `reconcileCart`.

- [ ] **Step 4: Write failing storage tests**

Cover valid versioned storage, corrupt JSON, legacy current-shape migration, unavailable storage, and clear.

Use a versioned envelope:

```ts
interface StoredCart {
  version: 2;
  lines: CartLine[];
  promotionCode: string | null;
}
```

- [ ] **Step 5: Implement the storage adapter**

Keep the key `softkeystore_cart` for backward compatibility. Corrupt or unknown versions must return an empty cart without writing mock items.

- [ ] **Step 6: Write failing provider tests**

Render a test consumer and verify:

- hydration from storage,
- count and totals update immediately,
- persistence after mutations,
- cross-tab `storage` event synchronization,
- an `aria-live` announcement after add, remove, promotion, and error,
- `clearCart()` removes storage.

- [ ] **Step 7: Implement `CartProvider`**

Expose `lines`, `itemCount`, `totals`, `promotion`, `hydrated`, `announcement`, `addItem`, `setQuantity`, `removeItem`, `applyPromotion`, `clearPromotion`, `reconcile`, and `clearCart`.

Do not call `window.location.reload()`.

- [ ] **Step 8: Wire providers**

`src/components/Providers.tsx` must wrap `SessionProvider` and `CartProvider` and remain the only root client provider boundary.

- [ ] **Step 9: Verify the cart domain**

Run:

```powershell
npm run test:run -- src/features/cart
npm run lint
```

- [ ] **Step 10: Commit the cart domain**

```powershell
git add src/features/cart src/components/Providers.tsx
git commit -m "feat: add shared cart state and persistence"
```

## Task 5: Introduce Route Groups, UI Primitives, And The Storefront Shell

**Files:**
- Modify: `src/app/layout.tsx`
- Create: `src/app/(storefront)/layout.tsx`
- Create: `src/app/(auth)/layout.tsx`
- Move: `src/app/page.tsx` to `src/app/(storefront)/page.tsx`
- Move: `src/app/cart/page.tsx` to `src/app/(storefront)/cart/page.tsx`
- Move: `src/app/checkout/page.tsx` to `src/app/(storefront)/checkout/page.tsx`
- Move: `src/app/contact/page.tsx` to `src/app/(storefront)/contact/page.tsx`
- Move: `src/app/how-to-buy/page.tsx` to `src/app/(storefront)/how-to-buy/page.tsx`
- Move: `src/app/profile/page.tsx` to `src/app/(storefront)/profile/page.tsx`
- Move: `src/app/category/office/page.tsx` to `src/app/(storefront)/category/office/page.tsx`
- Move: `src/app/category/windows/page.tsx` to `src/app/(storefront)/category/windows/page.tsx`
- Move: `src/app/product/[id]/page.tsx` to `src/app/(storefront)/product/[id]/page.tsx`
- Move: `src/app/login/page.tsx` to `src/app/(auth)/login/page.tsx`
- Move: `src/app/register/page.tsx` to `src/app/(auth)/register/page.tsx`
- Move: `src/app/forgot-password/page.tsx` to `src/app/(auth)/forgot-password/page.tsx`
- Move: associated auth/profile CSS modules with their pages, then delete them when unused
- Create: `src/components/ui/Button.tsx`
- Create: `src/components/ui/Field.tsx`
- Create: `src/components/ui/PasswordField.tsx`
- Create: `src/components/ui/FormMessage.tsx`
- Create: `src/components/ui/SubmitButton.tsx`
- Create: `src/components/ui/StatusBadge.tsx`
- Create: `src/components/ui/EmptyState.tsx`
- Create: `src/components/ui/Skeleton.tsx`
- Create: `src/components/ui/ui.test.tsx`
- Create: `src/components/layout/SiteHeader.tsx`
- Create: `src/components/layout/MobileNav.tsx`
- Create: `src/components/layout/SearchOverlay.tsx`
- Create: `src/components/layout/SiteFooter.tsx`
- Create: `src/components/layout/StorefrontShell.test.tsx`
- Delete: `src/components/Header.tsx`
- Delete: `src/components/Footer.tsx`

- [ ] **Step 1: Move routes into URL-transparent groups**

Root layout owns only metadata, fonts, providers, and `<body>`. The storefront layout owns the site header/footer. The auth layout owns the lightweight brand header and no storefront footer.

After moves, run:

```powershell
npm run build
```

Expected: URLs remain unchanged.

- [ ] **Step 2: Write failing UI primitive tests**

Verify:

- `Field` associates label, hint, and error with the input,
- `PasswordField` toggles visibility and preserves focus,
- `SubmitButton` communicates loading and disabled state,
- `FormMessage` uses `role="alert"` for errors and `role="status"` for success,
- `Button` has a visible accessible name in icon-only mode.

- [ ] **Step 3: Implement primitives**

Keep variants limited to `primary`, `secondary`, `quiet`, and `danger`. Use the approved radius and focus tokens; avoid page-specific inline styles.

- [ ] **Step 4: Write failing shell tests**

Mock `usePathname`, cart context, and `fetch`. Verify:

- current-route indication,
- live cart count,
- account link state,
- mobile menu open/close and Escape behavior,
- search open/close, focus restoration, query results, no-results, loading, and retry,
- no placeholder `href="#"` links.

- [ ] **Step 5: Implement the shell**

`SiteHeader` is sticky rather than overlaying page content. `MobileNav` and `SearchOverlay` render outside clipped containers, lock background scroll while open, restore focus, and close on route change.

`SearchOverlay` fetches `/api/products`, searches name/category/description, and links to `/product/{id}`.

- [ ] **Step 6: Verify shell behavior**

Run:

```powershell
npm run test:run -- src/components/ui src/components/layout
npm run lint
npm run build
```

- [ ] **Step 7: Commit the shell**

```powershell
git add -- src/app/layout.tsx "src/app/(storefront)" "src/app/(auth)" src/components/ui src/components/layout src/components/Providers.tsx src/components/Header.tsx src/components/Footer.tsx
git commit -m "feat: add storefront and authentication shells"
```

## Task 6: Build Shared Catalog Components, Homepage, And Category Listings

**Files:**
- Create: `src/features/catalog/useCatalogProducts.ts`
- Create: `src/features/catalog/useCatalogProducts.test.tsx`
- Create: `src/components/catalog/ProductCard.tsx`
- Create: `src/components/catalog/ProductGrid.tsx`
- Create: `src/components/catalog/CatalogToolbar.tsx`
- Create: `src/components/catalog/FilterPanel.tsx`
- Create: `src/components/catalog/CatalogExplorer.tsx`
- Create: `src/components/catalog/CatalogExplorer.test.tsx`
- Create: `src/components/home/HeroCarousel.tsx`
- Create: `src/components/home/HeroCarousel.test.tsx`
- Create: `src/components/home/CategoryDiscovery.tsx`
- Create: `src/components/home/FeaturedProducts.tsx`
- Modify: `src/app/(storefront)/page.tsx`
- Modify: `src/app/(storefront)/category/office/page.tsx`
- Modify: `src/app/(storefront)/category/windows/page.tsx`

- [ ] **Step 1: Write the product-fetch hook tests**

Mock fetch and cover loading, success with `{ products }`, malformed success payload, server error, retry, and aborted unmount.

- [ ] **Step 2: Implement `useCatalogProducts`**

Return a discriminated state:

```ts
type CatalogLoadState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; products: ProductSummary[] };
```

- [ ] **Step 3: Write failing catalog component tests**

Cover:

- consistent card hierarchy,
- add-to-cart action,
- sort control,
- category and availability filters,
- clear filters,
- desktop filter panel and mobile disclosure,
- true empty versus filtered-empty messages,
- URL query parameters `q`, `sort`, and `availability`.

- [ ] **Step 4: Implement catalog components**

Use one card component across home and category pages. Keep the featured home treatment separate through `FeaturedProducts`, not card-level special cases.

On filter/sort changes, update the current URL with `router.replace` and `URLSearchParams` without scrolling to the top.

- [ ] **Step 5: Write failing carousel tests**

Use fake timers and verify:

- three source slides,
- previous, next, and direct controls,
- automatic rotation,
- pause on hover,
- pause while focus is inside,
- no automatic rotation when `prefers-reduced-motion` matches,
- accessible slide status.

- [ ] **Step 6: Implement the homepage**

Match `stitch_screens/references/homepage.png`:

- full-width three-slide hero with local source art,
- category discovery,
- source-faithful featured arrangement,
- shared product grid,
- trust strip.

The page itself remains a Server Component; only carousel and catalog explorer are client boundaries.

- [ ] **Step 7: Implement Office and Windows listings**

Match their separate Stitch references while sharing `CatalogExplorer`. Use route-specific heading, intro, category filter, trust content, and image treatment. Do not add filler products.

- [ ] **Step 8: Verify catalog routes**

Run:

```powershell
npm run test:run -- src/features/catalog src/components/catalog src/components/home
npm run lint
npm run build
```

Use the in-app Browser at `/`, `/category/office`, and `/category/windows`; verify loading, retry by temporarily intercepting the API, filter-empty, and populated states.

- [ ] **Step 9: Commit the catalog routes**

```powershell
git add src/features/catalog src/components/catalog src/components/home "src/app/(storefront)/page.tsx" "src/app/(storefront)/category"
git commit -m "feat: rebuild storefront catalog routes"
```

## Task 7: Rebuild The Product Detail Route

**Files:**
- Create: `src/components/product/ProductGallery.tsx`
- Create: `src/components/product/ProductConfigurator.tsx`
- Create: `src/components/product/ProductConfigurator.test.tsx`
- Create: `src/components/product/PurchasePanel.tsx`
- Create: `src/components/product/PurchasePanel.test.tsx`
- Create: `src/components/product/ProductTabs.tsx`
- Create: `src/components/product/ProductTabs.test.tsx`
- Modify: `src/app/(storefront)/product/[id]/page.tsx`

- [ ] **Step 1: Write failing configurator tests**

Verify selecting and clearing Word, Excel, and PowerPoint updates unit and total prices; quantity cannot exceed stock; and zero stock disables purchase.

- [ ] **Step 2: Implement the configurator and purchase panel**

Use `pricing.ts` and `CartProvider`. `Add to cart` announces success without reload. `Buy now` adds the configured line and navigates to `/checkout`.

Prevent purchase when:

- product stock is zero,
- requested quantity exceeds stock,
- price calculation is invalid.

- [ ] **Step 3: Write failing tab tests**

Verify `tablist`, arrow-key navigation, Home/End, selected state, and panel association for details, installation, and reviews.

- [ ] **Step 4: Implement the tabs and gallery**

Use local source artwork and `next/image`. Keep breadcrumbs, rating, trust facts, configuration, purchase summary, and information hierarchy faithful to `office-product.png`.

- [ ] **Step 5: Make the route server-first**

Parse `params.id`, call `getProductById`, and call `notFound()` for invalid or absent products. Pass plain serializable product data into client components.

- [ ] **Step 6: Verify the product route**

Run:

```powershell
npm run test:run -- src/components/product src/features/product
npm run lint
npm run build
```

In the in-app Browser, verify `/product/3`, `/product/not-a-number`, and a valid out-of-stock fixture or mocked response.

- [ ] **Step 7: Commit the product route**

```powershell
git add src/components/product "src/app/(storefront)/product/[id]/page.tsx"
git commit -m "feat: rebuild product configuration flow"
```

## Task 8: Rebuild The Shopping Cart

**Files:**
- Create: `src/components/purchase/QuantityControl.tsx`
- Create: `src/components/purchase/QuantityControl.test.tsx`
- Create: `src/components/purchase/CartItem.tsx`
- Create: `src/components/purchase/OrderSummary.tsx`
- Create: `src/components/purchase/OrderSummary.test.tsx`
- Modify: `src/app/(storefront)/cart/page.tsx`

- [ ] **Step 1: Write failing quantity-control tests**

Verify increment, decrement, minimum, stock maximum, disabled states, and accessible labels that include the product name.

- [ ] **Step 2: Implement the shared purchase controls**

`CartItem` shows image, configuration, unit price, quantity, line total, stock warning, and remove action. `OrderSummary` shows subtotal, discount, and total; promo input uses `SOFTKEY10`.

- [ ] **Step 3: Write failing cart-page tests**

Cover:

- empty cart does not create a mock item,
- return-to-shopping link,
- quantity and removal,
- valid/invalid promotion,
- stale price and stock recovery messages after reconciliation,
- checkout disabled when no valid lines remain.

- [ ] **Step 4: Implement the page**

Match `cart.png`, including the source hierarchy and desktop summary position. On small screens, the summary returns to document flow. Never use `alert()` or reload.

- [ ] **Step 5: Verify the cart**

Run:

```powershell
npm run test:run -- src/components/purchase src/features/cart
npm run lint
npm run build
```

- [ ] **Step 6: Commit the cart**

```powershell
git add src/components/purchase "src/app/(storefront)/cart/page.tsx"
git commit -m "feat: rebuild shopping cart experience"
```

## Task 9: Rebuild Checkout As A Safe Local Presentation Flow

**Files:**
- Create: `src/features/checkout/checkout.ts`
- Create: `src/features/checkout/checkout.test.ts`
- Create: `src/components/checkout/PaymentSelector.tsx`
- Create: `src/components/checkout/PaymentSelector.test.tsx`
- Create: `src/components/checkout/CheckoutForm.tsx`
- Create: `src/components/checkout/CheckoutForm.test.tsx`
- Modify: `src/app/(storefront)/checkout/page.tsx`

- [ ] **Step 1: Write failing checkout-domain tests**

Cover:

- PromptPay and card presentation states,
- `prioritySupport` fixed at 150 baht to preserve current behavior,
- empty cart rejection,
- invalid contact rejection,
- duplicate-submit lock,
- success result,
- unavailable card result,
- recoverable payment failure/network failure result.

- [ ] **Step 2: Implement a local-only checkout adapter**

Export `prepareCheckout` and `simulateCheckout`. The adapter must not persist or transmit card details. Card selection should present the Stitch card panel but return an explicit `unavailable` result with a PromptPay recovery action. PromptPay returns a simulated success after one guarded async operation.

- [ ] **Step 3: Write failing payment-selector tests**

Verify radio semantics, keyboard selection, selected styling, unavailable explanation, and that switching methods does not erase contact fields.

- [ ] **Step 4: Write failing checkout-form tests**

Verify inline field errors, synchronized totals, support add-on, submit loading, duplicate-submit prevention, payment unavailable, simulated failure recovery, success feedback, cart clear, and navigation to `/profile`.

- [ ] **Step 5: Implement checkout**

Match `checkout.png`. Use shared `Field`, `SubmitButton`, `OrderSummary`, and cart context. Keep the desktop summary visible without obscuring content; put it in normal flow for tablet/mobile or limited viewport height.

- [ ] **Step 6: Verify checkout**

Run:

```powershell
npm run test:run -- src/features/checkout src/components/checkout
npm run lint
npm run build
```

- [ ] **Step 7: Commit checkout**

```powershell
git add src/features/checkout src/components/checkout "src/app/(storefront)/checkout/page.tsx"
git commit -m "feat: rebuild local checkout presentation"
```

## Task 10: Consolidate Mock Authentication And Rebuild Login/Register

**Files:**
- Create: `src/features/auth/mock-auth.ts`
- Create: `src/features/auth/mock-auth.test.ts`
- Create: `src/components/auth/AuthShell.tsx`
- Create: `src/components/auth/LoginForm.tsx`
- Create: `src/components/auth/LoginForm.test.tsx`
- Create: `src/components/auth/RegisterForm.tsx`
- Create: `src/components/auth/RegisterForm.test.tsx`
- Modify: `src/app/(auth)/login/page.tsx`
- Modify: `src/app/(auth)/register/page.tsx`
- Modify: `src/app/(auth)/forgot-password/page.tsx`
- Delete: unused `login.module.css`, `register.module.css`, and `forgot-password.module.css`
- Modify: `src/proxy.ts`

- [ ] **Step 1: Write failing mock-auth adapter tests**

Cover:

- corrupt user storage,
- duplicate normalized email,
- credential success and failure,
- cookie encode/decode,
- logout,
- browser API unavailable,
- no use of `any`.

- [ ] **Step 2: Implement the adapter**

Preserve `mock_users` and `mock_user`. Centralize cookie lifetime at seven days. Do not replace NextAuth Google configuration.

- [ ] **Step 3: Write failing login tests**

Cover required validation, invalid credentials, password visibility, loading/disabled state, successful redirect without reload, Google `signIn("google")`, server error, forgot-password link, and register link.

- [ ] **Step 4: Write failing register tests**

Cover all field errors, password confirmation, six-character minimum, terms acceptance, duplicate email, visibility controls, success message, and login redirect.

- [ ] **Step 5: Implement the shared auth shell and forms**

Match `login.png` and `register.png`, keeping the distinct split composition and source assets. Use the auth route-group layout, shared form primitives, and real NextAuth `signIn("google")`.

Reuse the same primitives in forgot password without treating it as an additional Stitch redesign. Preserve its existing mock reset behavior.

- [ ] **Step 6: Align route protection**

Keep `/checkout` and `/profile` protected by the current mock cookie. Treat `/login` and `/register` as auth pages for redirect purposes. Do not add `/dashboard`.

- [ ] **Step 7: Verify auth**

Run:

```powershell
npm run test:run -- src/features/auth src/components/auth
npm run lint
npm run build
```

- [ ] **Step 8: Commit auth**

```powershell
git add src/features/auth src/components/auth "src/app/(auth)" src/proxy.ts
git commit -m "feat: rebuild authentication flows"
```

## Task 11: Rebuild The Profile And License Interactions

**Files:**
- Create: `src/features/account/account-data.ts`
- Create: `src/features/account/account.ts`
- Create: `src/features/account/account.test.ts`
- Create: `src/components/account/ProfileNav.tsx`
- Create: `src/components/account/LicenseKey.tsx`
- Create: `src/components/account/LicenseKey.test.tsx`
- Create: `src/components/account/OrderList.tsx`
- Create: `src/components/account/OrderList.test.tsx`
- Create: `src/components/account/ReviewDialog.tsx`
- Create: `src/components/account/ReviewDialog.test.tsx`
- Modify: `src/app/(storefront)/profile/page.tsx`
- Delete: unused `profile.module.css`

- [ ] **Step 1: Move current mock orders into typed fixture data**

Repair Thai text and replace remote order images with `getProductAsset`. Keep the three current orders, keys, dates, review state, and prices.

- [ ] **Step 2: Write failing account logic tests**

Cover order ID/product search, status filter, empty results, review submission, and session-to-profile mapping.

- [ ] **Step 3: Write failing license-key tests**

Mock `navigator.clipboard.writeText` and verify success announcement, failure announcement with recovery instruction, only the requested key copied, and accessible button naming.
The failure case is the required license-key copy failure state from the approved specification.

- [ ] **Step 4: Write failing order-list and review-dialog tests**

Verify:

- desktop table semantics,
- mobile record labels,
- search/filter,
- already-reviewed state,
- dialog focus entry, Escape close, cancel, required review text, submit, and focus restoration.

- [ ] **Step 5: Implement profile components**

Match `profile.png`; keep profile summary, navigation, purchase history, support access, and trust information. Use JetBrains Mono only for license keys and order identifiers.

Logout uses the mock-auth adapter and router navigation without reload.

- [ ] **Step 6: Verify profile**

Run:

```powershell
npm run test:run -- src/features/account src/components/account
npm run lint
npm run build
```

- [ ] **Step 7: Commit profile**

```powershell
git add src/features/account src/components/account "src/app/(storefront)/profile"
git commit -m "feat: rebuild customer profile experience"
```

## Task 12: Rebuild How To Buy And Contact

**Files:**
- Create: `src/components/support/PurchaseSteps.tsx`
- Create: `src/components/support/PaymentMethods.tsx`
- Create: `src/components/support/ContactChannels.tsx`
- Create: `src/components/support/ContactForm.tsx`
- Create: `src/components/support/ContactForm.test.tsx`
- Modify: `src/app/(storefront)/how-to-buy/page.tsx`
- Modify: `src/app/(storefront)/contact/page.tsx`

- [ ] **Step 1: Write failing contact-form tests**

Cover required fields, email format, whitespace-only message, submitting, success, recoverable simulated error, field-error association, and no external request.

- [ ] **Step 2: Implement the contact form**

Use a local async presentation function that returns success and is mockable in tests. Do not call an external endpoint and do not retain personal data.

- [ ] **Step 3: Rebuild How To Buy**

Match `how-to-buy.png` with:

- concise three-step purchase path,
- source installation artwork,
- payment methods as real downloaded assets or honest text labels,
- support CTA.

Remove the current nonfunctional video affordance rather than leaving a decorative play button.

- [ ] **Step 4: Rebuild Contact**

Match `contact.png` with contact channels, business hours, location image, and the validated form. Replace `alert()` with inline status feedback.

- [ ] **Step 5: Verify support routes**

Run:

```powershell
npm run test:run -- src/components/support src/features/forms
npm run lint
npm run build
```

- [ ] **Step 6: Commit support routes**

```powershell
git add src/components/support "src/app/(storefront)/how-to-buy/page.tsx" "src/app/(storefront)/contact/page.tsx"
git commit -m "feat: rebuild support and purchase guidance"
```

## Task 13: Add Route States, Responsive Hardening, And Accessibility Checks

**Files:**
- Create: `src/app/(storefront)/loading.tsx`
- Create: `src/app/(storefront)/error.tsx`
- Create: `src/app/not-found.tsx`
- Create: `src/components/system/RouteError.tsx`
- Create: `src/components/system/RouteError.test.tsx`
- Modify: all components created in Tasks 5-12 as findings require
- Modify: `src/app/globals.css`

- [ ] **Step 1: Write failing route-error tests**

Verify the error component names the problem, exposes retry, supports keyboard activation, and does not reveal stack details.

- [ ] **Step 2: Implement route states**

Add:

- storefront skeleton with stable geometry,
- client error boundary with retry,
- product/not-found recovery links,
- expired session message on protected route redirects,
- status live regions that do not duplicate announcements.

- [ ] **Step 3: Run a responsive route matrix in the in-app Browser**

Check all eleven routes at 1440, 1024, 768, and 390 CSS pixels:

```text
/
/category/office
/category/windows
/product/3
/cart
/checkout
/login
/register
/profile
/how-to-buy
/contact
```

At every viewport verify:

- no document-level horizontal overflow,
- no clipped focus indicators,
- controls remain at least 24 by 24 CSS pixels with adequate spacing, preferably 44 by 44,
- Thai and English copy wraps,
- sticky content does not obscure primary actions,
- tables transform into labeled records,
- mobile nav, filters, dialogs, and search restore focus.

- [ ] **Step 4: Run keyboard-only checks**

For every route:

- Tab and Shift+Tab follow visual order,
- Enter/Space activates controls,
- Escape closes transient surfaces,
- carousel tabs and radio groups use expected arrow keys,
- focus is never hidden under the sticky header,
- no hover-only required content.

- [ ] **Step 5: Verify reduced motion**

Emulate `prefers-reduced-motion: reduce` in the in-app Browser. Confirm carousel auto-rotation stops and transitions become effectively immediate.

- [ ] **Step 6: Run engineering checks**

Run:

```powershell
npm run test:run
npm run lint
npm run build
```

- [ ] **Step 7: Commit hardening**

Stage `src/app/(storefront)/loading.tsx`, `src/app/(storefront)/error.tsx`,
`src/app/not-found.tsx`, `src/components/system/`, `src/app/globals.css`, and
each component actually changed by this task one literal path at a time after
reviewing `git diff --name-only`. Do not use a directory-wide `git add` for
`src/components`.

Then run:

```powershell
git commit -m "fix: harden responsive and accessible route states"
```

## Task 14: Add End-To-End Flows And Complete Visual QA

**Files:**
- Create: `tests/e2e/commerce.spec.ts`
- Create: `tests/e2e/auth-profile.spec.ts`
- Create: `tests/e2e/support.spec.ts`
- Create: `tests/e2e/accessibility.spec.ts`
- Create: `scripts/compose-visual-comparison.mjs`
- Create: `artifacts/visual-qa/` screenshots and comparisons
- Create: `docs/design-qa.md`

- [ ] **Step 1: Write the commerce flow**

`commerce.spec.ts` must:

1. load the homepage,
2. browse Office,
3. open product `3`,
4. select one add-on and quantity,
5. add to cart,
6. verify header count,
7. edit quantity,
8. apply `SOFTKEY10`,
9. proceed to checkout,
10. verify auth protection,
11. seed the mock cookie,
12. validate checkout,
13. choose PromptPay,
14. submit once,
15. verify success, profile navigation, and empty cart.

- [ ] **Step 2: Write auth/profile and support flows**

`auth-profile.spec.ts` covers register validation, registration, credential login, profile search, key-copy feedback, review dialog, and logout.

`support.spec.ts` covers How To Buy links and contact validation/success.

`accessibility.spec.ts` runs `@axe-core/playwright` on all eleven ready states and fails on serious or critical violations. Exclude no rule without documenting the exact false positive in `docs/design-qa.md`.

- [ ] **Step 3: Obtain browser approval and run E2E**

Ask the user before invoking Playwright CLI. After approval:

```powershell
npx playwright install chromium
npm run test:e2e
```

If approval is not granted, perform the same flows with the in-app Browser and record Playwright as authored but not executed.

- [ ] **Step 4: Capture source-faithful desktop screenshots**

Using the in-app Browser, capture the implementation at the same desktop viewport as each reference. Save:

```text
artifacts/visual-qa/homepage-1440.png
artifacts/visual-qa/office-listing-1440.png
artifacts/visual-qa/windows-listing-1440.png
artifacts/visual-qa/office-product-1440.png
artifacts/visual-qa/cart-1440.png
artifacts/visual-qa/checkout-1440.png
artifacts/visual-qa/login-1440.png
artifacts/visual-qa/register-1440.png
artifacts/visual-qa/profile-1440.png
artifacts/visual-qa/how-to-buy-1440.png
artifacts/visual-qa/contact-1440.png
```

- [ ] **Step 5: Compose side-by-side comparisons**

`scripts/compose-visual-comparison.mjs` must use `sharp` to place the reference on the left and implementation on the right, top-aligned on a neutral canvas with labels. Produce one comparison per route under `artifacts/visual-qa/compare/`.

Run:

```powershell
node scripts/compose-visual-comparison.mjs
```

Open every composed comparison with `view_image`. A standalone implementation screenshot does not count as comparison QA.

- [ ] **Step 6: Classify and fix visual findings**

Use:

- P0: broken/missing route or unusable action,
- P1: major hierarchy, structure, asset, or responsive mismatch,
- P2: visible spacing, type, color, radius, crop, or state mismatch,
- P3: minor polish.

Fix every P0, P1, and P2, recapture, and recompute the comparison. Do not merely document unresolved P0-P2 findings.

- [ ] **Step 7: Capture critical mobile routes**

At 390 CSS pixels capture and inspect:

```text
/
/category/office
/product/3
/cart
/checkout
/login
/register
/profile
/contact
```

Record layout and interaction findings in `docs/design-qa.md`.

- [ ] **Step 8: Write the QA record**

`docs/design-qa.md` must include:

- date and tested commit,
- exact route/viewport matrix,
- test commands and results,
- Playwright execution status,
- axe results,
- console-error result,
- overflow result,
- reference/implementation comparison paths,
- findings and fixes,
- remaining P3 items only,
- final line exactly:

```text
final result: passed
```

- [ ] **Step 9: Run final verification**

Run:

```powershell
npm run test:run
npm run lint
npm run build
git status --short
```

Open every route once more in the in-app Browser and confirm no runtime console errors.

- [ ] **Step 10: Commit QA and E2E coverage**

```powershell
git add tests/e2e playwright.config.ts scripts/compose-visual-comparison.mjs artifacts/visual-qa docs/design-qa.md
git commit -m "test: verify SoftKeyStore redesign end to end"
```

## Final Acceptance Checklist

- [ ] All eleven requested routes match their supplied light Stitch screen in hierarchy, assets, and visual character.
- [ ] Homepage carousel, search, mobile navigation, filters, tabs, forms, dialogs, cart, checkout, copy, and review controls work.
- [ ] Cart no longer seeds a mock item and no route uses `alert()` or `window.location.reload()`.
- [ ] Product/catalog data has one typed contract and product image resolution has one local manifest.
- [ ] Existing Prisma schema and Google authentication provider remain intact.
- [ ] Mock credential storage and cookie names remain backward compatible.
- [ ] All visible assets come from the supplied source or another real local asset; no fake placeholders or approximate drawings remain.
- [ ] Unit/component tests, lint, and production build pass.
- [ ] E2E is executed after user browser approval or clearly recorded as authored but unexecuted.
- [ ] All eleven routes pass the responsive matrix and have no page-level overflow.
- [ ] All P0, P1, and P2 visual findings are fixed.
- [ ] `docs/design-qa.md` ends with `final result: passed`.
