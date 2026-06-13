# SoftKeyStore Admin Dashboard Design

## Summary

Build a complete Thai-language administrator dashboard for SoftKeyStore using
the supplied Google Stitch screens as the visual source of truth. The
implementation will use the existing Next.js App Router application, Prisma
and MariaDB database, Auth.js login route, Tailwind CSS setup, and XAMPP
installation.

The selected architecture is **server-first administration**:

- Server Components read validated, minimal DTOs from a server-only data layer.
- Server Actions perform mutations and re-check the administrator role.
- Prisma is the source of truth for products, orders, discounts, members, and
  financial summaries.
- Client Components are limited to interactive controls such as drawers,
  dialogs, chart rendering, and pending form states.

The administrator area is not a visual prototype. Product, discount, and order
operations must persist to Prisma and remain consistent with the storefront.

## Source Of Truth

Google Stitch project:

- Title: `E-commerce Navigation Banner`
- Project ID: `2067195492768532722`

| Admin surface | Stitch screen | Screen ID |
| --- | --- | --- |
| Members | SoftKeyStore Admin - Member Management (Light Mode Thai) Final | `a2a611b5e7b64e39a2007f6520f96203` |
| Discount history | SoftKeyStore Admin - Discount History (Light Mode Thai) Final | `57041f7199094e9cabdeafe83c867d2f` |
| Edit discount | SoftKeyStore Admin - Edit Discount Code (Light Mode Thai) | `e637f7b7b7b14f07bb2eb6c961e575ab` |
| Add discount | SoftKeyStore Admin - Add Discount Code (Light Mode Thai) Final | `c6d3adfa16cf4ce7a952a6407639f266` |
| Discounts | SoftKeyStore Admin - Discount Management (Thai) Final | `e2ca7608d5ec4dbdb5a08355d60a9cc9` |
| Edit product | SoftKeyStore Admin - Edit Product (Light Mode Thai) | `1bcf7b6a98844f7ca027829844a79875` |
| Add product | SoftKeyStore Admin - Add New Product (Light Mode Thai) | `21feabba8e164c32bf3b3b95b17a6326` |
| Products | SoftKeyStore Admin - Product Management (Thai) Final | `68c23dea7a384d6494201edba64a1f4f` |
| Orders | SoftKeyStore Admin - Order Management Dashboard | `dc023daa27a44409bdf18250d46a1dde` |
| Finance | SoftKeyStore Admin - Financial Dashboard | `1853173d83074c049e8ecc13dfe0841f` |

Downloaded HTML and screenshots are stored in `stitch_screens/admin/`.

The user-provided member-list screenshot dated June 13, 2026 supersedes any
editing controls implied by the Stitch member screen. The member surface is
strictly read-only.

## Product Direction

The admin interface extends the existing storefront rather than creating a
separate brand:

- A dark navy fixed sidebar establishes the administrator context.
- Electric blue marks the active route, primary actions, selected controls,
  links, and focus.
- White cards and very light gray page surfaces carry tables and forms.
- Borders, shadows, and radii stay restrained and close to the Stitch sources.
- Thai is the primary interface language.
- Inter or the project's current UI font is used for body content.
- Monospace typography is limited to order numbers, discount codes, and
  license-key identifiers.
- All monetary values use Thai baht formatting, never dollars.
- Material Symbols or the project's installed icon system supplies visible
  icons; icons are not recreated with hand-drawn SVG or text glyphs.

## Information Architecture

### Routes

| Route | Purpose |
| --- | --- |
| `/admin` | Financial dashboard, KPI cards, yearly sales chart, and recent orders |
| `/admin/orders` | Search, filter, inspect, and update internal order status |
| `/admin/products` | Product list, filters, edit links, and archive actions |
| `/admin/products/new` | Create a product and upload its image |
| `/admin/products/[id]/edit` | Edit an existing product |
| `/admin/discounts` | Discount list, filters, edit links, and disable/archive actions |
| `/admin/discounts/new` | Create a discount |
| `/admin/discounts/[id]/edit` | Edit an existing discount |
| `/admin/discounts/history` | Read-only discount usage history |
| `/admin/members` | Read-only member analytics, search, filters, pagination, and CSV export |
| `/admin/members/export` | Authorized CSV download using the current member filters |

No member create route, member edit route, role-management route, or account
status mutation route will be added.

### Shared admin shell

`AdminShell` owns the persistent sidebar, mobile drawer, top bar, date-range
control, administrator identity, and content region. Navigation contains:

1. Dashboard
2. Orders
3. Products
4. Discounts
5. Discount history
6. Members

Desktop uses a fixed sidebar. Tablet may use a compact sidebar. Mobile uses a
focus-managed drawer and keeps the current page title visible.

### Shared interface units

- `AdminPageHeader`: title, breadcrumb, date range, and page actions.
- `AdminKpiCard`: value, unit, supporting label, and optional trend.
- `AdminDataTable`: header, rows, empty state, pagination, and horizontal
  containment on narrow screens.
- `AdminFilters`: search and typed filters backed by URL search parameters.
- `AdminStatusBadge`: consistent order, product, and discount states.
- `AdminConfirmDialog`: confirmation for status changes and archiving.
- `AdminFormField`: label, help, validation error, and pending state.
- `AdminSubmitButton`: loading and disabled behavior.
- `AdminEmptyState`, `AdminErrorState`, and `AdminTableSkeleton`.

These units define presentation only. Business authorization remains in the
server-only data layer.

## Authentication And Authorization

### Login behavior

The existing `/login` route remains the only login page for customers and
administrators. Mock authentication based on `localStorage` and the
`mock_user` cookie is removed.

Auth.js will support:

- Email and password through a Credentials provider backed by Prisma.
- Existing Google sign-in, provided the Google email already maps to a Prisma
  `User`.

Google sign-in must not automatically create an account or administrator. An
unknown Google email is rejected and directed to normal registration. It never
receives `ADMIN` by inference.

Passwords are stored only as secure hashes. Existing seeded or development
credentials are migrated or reseeded as hashes.

After login:

- `ADMIN` redirects to `/admin`.
- `CUSTOMER` redirects to the storefront.

The Auth.js JWT and session expose only the required user identifier and role.
They never expose password hashes.

### Authorization boundary

`requireAdmin()` is a cached, server-only data-layer function that:

1. Reads and verifies the Auth.js session.
2. Requires a user identifier.
3. Queries the current Prisma `User`.
4. Requires `role === "ADMIN"`.
5. Returns a minimal administrator DTO.

The proxy provides early redirects for navigation only. It is not the security
boundary.

Every admin query, Server Action, and Route Handler must call the data-layer
authorization function. Every Server Action is treated as a public POST entry
point and validates its own arguments. Hiding a control in the UI is never
considered authorization.

The members page receives only name, email, creation date, aggregate order
count, and aggregate spend. Passwords and unrelated user fields never enter the
React render tree.

## Data Model

### Money

All stored monetary values move from floating point to Prisma `Decimal` backed
by MySQL/MariaDB `DECIMAL`, using a precision suitable for store totals and two
fractional digits. This applies to:

- Product price and original price
- Order subtotal, discount amount, and total
- Order item price
- Discount value, minimum order amount, and maximum discount amount
- Discount usage snapshots

Formatting uses `th-TH` and `THB` at the presentation boundary.

### User

The existing `User` remains the member source of truth. The admin project does
not add a mutable suspension state or member-management fields.

Required fields remain:

- `id`
- `email`
- `password`
- `name`
- `role`
- `createdAt`
- `updatedAt`

Role values remain `CUSTOMER` and `ADMIN`. Public registration creates
`CUSTOMER` only. No admin page changes a role.

### Product

The existing product model gains archive semantics:

- `archivedAt DateTime?`

The existing `image` field stores the public XAMPP URL. Archived products do
not appear in storefront catalog queries, but remain connected to order
history, reviews, and license keys.

### Order

Order gains explicit monetary snapshots:

- `subtotal Decimal`
- `discountAmount Decimal`
- `total Decimal`
- `discountCode String?`

Supported statuses are:

- `PENDING`
- `PAID`
- `COMPLETED`
- `CANCELLED`

Allowed administrator transitions are:

- `PENDING -> PAID`
- `PENDING -> CANCELLED`
- `PAID -> COMPLETED`

`COMPLETED` and `CANCELLED` are terminal. A paid order cannot be cancelled in
this version because no refund workflow is included.

### Discount

A new `Discount` model contains:

- Unique normalized `code`
- `type`: `PERCENT` or `FIXED`
- Decimal `value`
- Optional `minimumOrderAmount`
- Optional `maximumDiscountAmount` for percentage discounts
- `startsAt` and `endsAt`
- Optional total `usageLimit`
- Optional `perUserLimit`
- `isActive`
- Optional `archivedAt`
- Created and updated timestamps
- Relation to usage records

Validation rules:

- Percentage value is greater than zero and at most 100.
- Fixed value is greater than zero.
- End time is later than start time.
- Numeric limits are positive when present.
- Per-user limit does not exceed the total limit when both are present.
- Archived or inactive discounts cannot be newly applied.
- A discount code cannot be changed after the first usage record exists.

### DiscountUsage

A new append-only `DiscountUsage` model links:

- `Discount`
- `User`
- `Order`

It snapshots:

- Discount code
- Order subtotal before discount
- Applied discount amount
- Final order total
- Usage timestamp

The order relation is unique so an order has at most one discount usage record
in this version. Usage records are not edited or deleted from the admin UI.

### Financial reporting

No separate finance ledger is introduced. Dashboard metrics and charts are
aggregated from orders with `PAID` or `COMPLETED` status. `PENDING` and
`CANCELLED` orders do not count as revenue.

## Data Access And Mutations

Feature-focused server-only modules isolate:

- Administrator session verification
- Dashboard aggregates
- Order queries and transitions
- Product queries and persistence
- Discount queries, validation, and persistence
- Discount usage history
- Member reporting and CSV export

All URL search parameters are parsed through bounded schemas. Page size,
sorting fields, identifiers, date ranges, and numeric filters cannot be passed
directly into Prisma without validation.

Server Actions remain thin:

1. Call `requireAdmin()`.
2. Parse `FormData` or typed input.
3. Delegate to the relevant server-only service.
4. Return a minimal success or field-error result.
5. Revalidate the affected route.

Order creation, stock changes, totals, and discount usage must share a Prisma
transaction so they commit or roll back together.

## Product Image Storage In XAMPP

Product images are stored under:

`C:\xampp\htdocs\softkeystore-uploads\products`

The corresponding public base URL is:

`http://localhost/softkeystore-uploads/products`

The paths are configured through server-only environment variables:

- `PRODUCT_UPLOAD_DIR`
- `PRODUCT_UPLOAD_BASE_URL`

Upload rules:

- Accept JPEG, PNG, and WebP input.
- Maximum input size is 5 MB.
- Decode the image with Sharp rather than trusting the browser MIME string.
- Normalize the output to WebP and strip metadata.
- Generate a UUID filename; never use the submitted filename.
- Create the configured directory when it does not exist.
- Store only the resulting public URL in Prisma.

When replacing an image:

1. Validate and write the new file.
2. Update the product.
3. If the database update fails, remove the new file.
4. After a successful update, remove the old file only when it belongs to the
   managed upload directory.

Archiving a product does not delete its image. This preserves historical
records and permits restoration outside the current UI.

## Screen Behavior

### Financial dashboard

`/admin` follows the finance Stitch screen and shows:

- Date-range filter
- Revenue for the selected period
- Order count
- Average order value
- Active product count
- Monthly or yearly sales chart
- Recent orders

All cards and charts use the same date boundary and paid-status definition.
Charts receive bounded, already-aggregated DTOs and do not query Prisma from
the client.

### Orders

`/admin/orders` supports:

- Search by order number, member name, or email
- Status and date filters
- Pagination and deterministic sorting
- Order details without leaving the list, using a dialog or drawer where it
  matches the Stitch composition
- Authorized status transitions with confirmation

The UI explains invalid or stale transitions and reloads the latest order
state. There is no payment refund button or external payment integration.

### Products

The product list supports search, category filter, archive state, sorting, and
pagination. Active products can be edited or archived. Archived products
remain visible when the archive filter is selected.

The add and edit forms include:

- Name
- Description
- Category
- Price
- Optional original price
- Stock
- Product image

Validation occurs on the server and is mirrored in the UI for faster feedback.
Archiving is confirmed and does not cascade-delete business history.

### Discounts

The discount list supports search, active/archive filters, validity dates,
sorting, and pagination. Administrators can create, edit, disable, and archive
discounts.

The add and edit forms expose only fields represented by the approved model.
Type-specific fields appear conditionally. Server validation remains
authoritative.

Discount history is read-only and supports code, member, order, and date
filters. It shows applied amount and final order total from usage snapshots.

### Members

`/admin/members` is a read-only report matching the user-provided screenshot.

It contains:

- Total member KPI
- Search by member name or email
- Registration date range
- Optional minimum order-count and minimum spend filters
- Deterministic sorting and pagination
- Columns for name, email, registration date, qualifying order count, and
  total spend
- CSV export using the current filters

Order count and total spend include only `PAID` and `COMPLETED` orders. CSV
export uses the same query rules as the table but exports all matching rows,
not only the visible page.

The page has:

- No add-member control
- No row action menu
- No edit route
- No suspend or reactivate control
- No role control
- No member mutation Server Action

## Shared Interaction Rules

- Search fields are debounced and update URL search parameters.
- Filters, sort, date range, page, and page size remain in the URL.
- Reset controls remove only the relevant filters.
- Pagination uses bounded page sizes.
- Mutations disable repeat submission while pending.
- Successful mutations show a Thai confirmation message and revalidate data.
- Risky state changes use a confirmation dialog with a clear object name.
- Empty states explain whether there is no data or no match for the filters.
- Error states preserve entered form values and provide a recovery action.
- Keyboard users can reach, operate, and dismiss all controls.
- Focus returns to the invoking control when a dialog or drawer closes.

## Responsive Behavior

Validate at representative widths of 1440, 1024, 768, and 390 CSS pixels.

- Desktop uses the full sidebar, wide tables, and multi-column KPI cards.
- Tablet compacts or collapses the sidebar and allows table-only horizontal
  scrolling where a card transformation would lose important comparisons.
- Mobile uses a navigation drawer, one-column KPI cards, stacked filters, and
  compact row actions.
- Page-level horizontal overflow is not permitted.
- Thai labels, long emails, product names, and discount codes must not clip.
- Sticky regions return to normal flow when viewport dimensions are limited.

## Loading, Empty, Error, And Success States

Every list and dashboard includes:

- A skeleton that preserves the final layout dimensions.
- An empty state with an add or reset action where applicable.
- A recoverable error state with a retry action.
- A populated state.

Forms include field errors, form-level errors, pending state, and success
feedback. Authorization errors do not reveal whether another account or record
exists. Unexpected errors are logged server-side without returning SQL,
password data, stack traces, or file-system paths to the browser.

## Accessibility

- Target WCAG 2.2 AA.
- Use semantic headings, tables, labels, buttons, links, and dialogs.
- Give icon-only controls accessible names.
- Associate field errors with their controls.
- Announce mutation outcomes through an appropriate live region.
- Maintain visible focus and adequate color contrast.
- Avoid color-only status communication.
- Keep interactive target size or spacing usable on touch devices.
- Respect reduced-motion preferences.

## Testing And Quality Gates

### Domain tests

Use Vitest to cover:

- Discount validation and application
- Money calculations with Decimal
- Allowed and rejected order transitions
- Paid-status financial inclusion
- Upload type, size, and managed-path rules
- Member aggregate and CSV filter semantics

### Data-layer and action tests

Cover:

- Missing session and non-admin rejection
- Re-checking role from Prisma
- Minimal DTO output
- Input and route-parameter validation
- Product archive behavior
- Discount archive and immutable-used-code behavior
- Transaction rollback for order/stock/discount usage
- Read-only member data access with no member mutation exports

### Component tests

Use Testing Library for:

- Sidebar and mobile drawer
- Search and URL-backed filters
- Pagination
- Forms and field errors
- Confirmation dialogs and keyboard focus
- Order status controls
- Image upload feedback
- Loading, empty, error, and success states

### Browser flow verification

Use the in-app Browser selected by the user to verify:

1. Customer and administrator login redirect to the correct destinations.
2. A customer cannot view or mutate admin data.
3. Product create, edit, image replacement, and archive work with XAMPP.
4. Discount create, edit, disable, archive, and history work.
5. Allowed order transitions succeed and disallowed transitions fail safely.
6. Dashboard values match source orders.
7. Member search, filters, pagination, and CSV export are read-only.
8. Direct POST or URL manipulation does not bypass authorization or validation.

### Visual QA

Render each route at the same viewport as its Stitch reference. Compare the
reference screenshot and implementation screenshot together, then correct
visible differences in layout, spacing, typography, color, borders, radii,
table density, and responsive behavior. Repeat critical screens at 390 pixels.

The user-provided read-only member screenshot is the visual and behavioral
reference for `/admin/members`.

### Engineering gates

- Prisma schema validation and client generation pass.
- Database migration applies cleanly to the configured MariaDB database.
- Unit and component tests pass.
- ESLint passes.
- TypeScript/production build passes.
- No runtime console errors occur in supported admin flows.
- No admin route exposes password hashes or raw database records.
- No unrelated storefront behavior regresses.

## Delivery Sequence

1. Database migration, Decimal conversion, discount models, and seed updates.
2. Real Auth.js credentials flow, role-aware redirect, and admin data layer.
3. Admin shell, shared UI units, and route protection.
4. Dashboard and order management.
5. Product management and XAMPP image storage.
6. Discount management and usage history.
7. Read-only member reporting and CSV export.
8. Responsive, accessibility, integration, and visual QA passes.

## Non-goals

- Hard-deleting products, discounts, orders, or usage history
- Creating, editing, suspending, or promoting members in the admin UI
- A real refund workflow
- A new payment gateway
- Multi-currency reporting
- A dark admin theme
- A separate analytics warehouse
- Bulk product or discount import
- Multiple discounts on one order
- A public API for admin operations

## Approval Record

- Server-first administrator architecture: approved.
- Navigation and route structure: approved.
- Prisma-backed CRUD for products, discounts, and orders: approved.
- Thai-baht-only financial model using Decimal: approved.
- Internal order status transitions without refund integration: approved.
- XAMPP product-image storage: approved.
- Auth.js role-based access with `/login` role redirect: approved.
- Read-only members page matching the user screenshot: approved.
- Interaction, responsive, testing, and completion criteria: approved.
