# SoftKeyStore Admin Dashboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the approved Thai-language SoftKeyStore administrator dashboard with real Prisma persistence, Auth.js role protection, XAMPP product-image storage, and a strictly read-only member report.

**Architecture:** Keep pages as Next.js 16 Server Components and put database access in feature-focused `server-only` modules. Thin Server Actions validate input, call `requireAdmin()`, delegate to the data layer, and revalidate affected routes; Client Components are limited to forms, drawers, dialogs, URL controls, and the Recharts visualization.

**Tech Stack:** Next.js 16.2 App Router, React 19, TypeScript, Auth.js 5 beta, Prisma 7 with MariaDB, Tailwind CSS 4, Zod, bcryptjs, Recharts, Sharp, Vitest, Testing Library, XAMPP Apache, and the Codex in-app Browser.

---

## Scope And Milestones

This is one integrated plan because authentication, money types, order state,
discount usage, and reporting share the same database contract. Execute it in
five reviewable milestones:

1. **Foundation:** Tasks 1-4
2. **Admin shell and commerce transaction:** Tasks 5-6
3. **Dashboard and orders:** Tasks 7-8
4. **Products and discounts:** Tasks 9-12
5. **Members and quality gates:** Tasks 13-15

Do not stage or commit `stitch_screens/admin/` unless the user explicitly asks
to version downloaded references. Preserve unrelated worktree changes.

## File Structure

### Foundation

- `src/features/admin/money.ts`: Decimal-safe conversion and Thai-baht formatting.
- `src/features/admin/order-status.ts`: Allowed admin order transitions.
- `src/features/admin/discount.ts`: Discount validation and calculation.
- `src/features/admin/query.ts`: Bounded URL-query parsing.
- `src/features/admin/action-state.ts`: Serializable Server Action state.
- `src/data/admin/auth.ts`: Administrator authorization boundary.
- `src/types/next-auth.d.ts`: Session and JWT role augmentation.

### Admin UI

- `src/app/admin/layout.tsx`: Protected admin shell.
- `src/app/admin/admin.css`: Admin-only visual system derived from Stitch.
- `src/app/admin/loading.tsx`: Shared route skeleton.
- `src/app/admin/error.tsx`: Recoverable admin error boundary.
- `src/components/admin/AdminSidebar.tsx`: Desktop navigation and mobile trigger.
- `src/components/admin/AdminNavLinks.tsx`: Client-only active-route treatment.
- `src/components/admin/AdminMobileNav.tsx`: Focus-managed mobile drawer.
- `src/components/admin/AdminPageHeader.tsx`: Page title, breadcrumb, and actions.
- `src/components/admin/AdminKpiCard.tsx`: KPI presentation.
- `src/components/admin/AdminDataTable.tsx`: Semantic table and contained horizontal scrolling.
- `src/components/admin/AdminStatusBadge.tsx`: Order/product/discount statuses.
- `src/components/admin/AdminPagination.tsx`: URL-backed pagination.
- `src/components/admin/AdminSearch.tsx`: Debounced URL search.
- `src/components/admin/AdminConfirmDialog.tsx`: Confirmed status/archive actions.
- `src/components/admin/AdminForm.tsx`: Shared form field and action-state rendering.
- `src/components/admin/MembersReport.tsx`: Read-only member KPI, filters, table, and export UI.

### Feature data and routes

- `src/data/admin/dashboard.ts`
- `src/data/admin/orders.ts`
- `src/data/admin/products.ts`
- `src/data/admin/discounts.ts`
- `src/data/admin/members.ts`
- `src/data/checkout.ts`
- `src/lib/product-upload.ts`
- `src/app/admin/page.tsx`
- `src/app/admin/orders/page.tsx`
- `src/app/admin/orders/actions.ts`
- `src/app/admin/products/page.tsx`
- `src/app/admin/products/actions.ts`
- `src/app/admin/products/new/page.tsx`
- `src/app/admin/products/[id]/edit/page.tsx`
- `src/app/admin/discounts/page.tsx`
- `src/app/admin/discounts/actions.ts`
- `src/app/admin/discounts/new/page.tsx`
- `src/app/admin/discounts/[id]/edit/page.tsx`
- `src/app/admin/discounts/history/page.tsx`
- `src/app/admin/members/page.tsx`
- `src/app/admin/members/export/route.ts`
- `src/app/(storefront)/checkout/actions.ts`

### Tests and QA

- Unit tests live beside their feature modules as `*.test.ts` or `*.test.tsx`.
- `scripts/create-visual-comparison.mjs`: combines a Stitch reference and Browser screenshot.
- `docs/design-qa/admin-dashboard.md`: records viewport-by-viewport findings and final status.

### Dependencies

Add only:

```json
{
  "dependencies": {
    "bcryptjs": "^3.0.2",
    "recharts": "^3.1.2",
    "zod": "^4.1.5"
  }
}
```

Use the latest compatible patch resolved by `npm install`; do not add a second
form, table, icon, date, or ORM library.

---

### Task 1: Install Dependencies And Add Domain Primitives

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`
- Modify: `vitest.config.mts`
- Create: `src/features/admin/money.ts`
- Create: `src/features/admin/money.test.ts`
- Create: `src/features/admin/order-status.ts`
- Create: `src/features/admin/order-status.test.ts`
- Create: `src/features/admin/discount.ts`
- Create: `src/features/admin/discount.test.ts`
- Create: `src/features/admin/action-state.ts`

- [ ] **Step 1: Install the approved dependencies**

Run:

```powershell
npm install bcryptjs zod recharts
```

Expected: `package.json` and `package-lock.json` change; installation exits 0.

- [ ] **Step 2: Configure Vitest to honor the server-only marker**

Modify `vitest.config.mts`:

```ts
import { fileURLToPath } from "node:url";

import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  resolve: {
    tsconfigPaths: true,
    alias: {
      "server-only": fileURLToPath(
        new URL("./node_modules/server-only/empty.js", import.meta.url),
      ),
    },
  },
  test: {
    environment: "jsdom",
    restoreMocks: true,
    setupFiles: ["./src/test/setup.ts"],
    exclude: ["**/node_modules/**", "**/dist/**", "**/tests/e2e/**"],
  },
});
```

- [ ] **Step 3: Write failing money, transition, and discount tests**

Create `src/features/admin/money.test.ts`:

```ts
import { describe, expect, it } from "vitest";

import { formatBaht, toMoneyString } from "@/features/admin/money";

describe("admin money", () => {
  it("normalizes values to two decimal places", () => {
    expect(toMoneyString("12450")).toBe("12450.00");
    expect(toMoneyString(8900.5)).toBe("8900.50");
  });

  it("formats Thai baht with two decimal places", () => {
    expect(formatBaht("12450")).toBe("฿12,450.00");
  });
});
```

Create `src/features/admin/order-status.test.ts`:

```ts
import { describe, expect, it } from "vitest";

import {
  canTransitionOrder,
  type OrderStatus,
} from "@/features/admin/order-status";

describe("order status transitions", () => {
  it.each<[OrderStatus, OrderStatus]>([
    ["PENDING", "PAID"],
    ["PENDING", "CANCELLED"],
    ["PAID", "COMPLETED"],
  ])("allows %s -> %s", (from, to) => {
    expect(canTransitionOrder(from, to)).toBe(true);
  });

  it.each<[OrderStatus, OrderStatus]>([
    ["PAID", "CANCELLED"],
    ["COMPLETED", "PENDING"],
    ["CANCELLED", "PAID"],
  ])("rejects %s -> %s", (from, to) => {
    expect(canTransitionOrder(from, to)).toBe(false);
  });
});
```

Create `src/features/admin/discount.test.ts`:

```ts
import { describe, expect, it } from "vitest";

import {
  calculateDiscount,
  discountInputSchema,
} from "@/features/admin/discount";

describe("discount domain", () => {
  it("caps percentage discounts", () => {
    expect(
      calculateDiscount({
        subtotal: "2000.00",
        type: "PERCENT",
        value: "20.00",
        maximumDiscountAmount: "300.00",
      }),
    ).toBe("300.00");
  });

  it("rejects an invalid date range", () => {
    const result = discountInputSchema.safeParse({
      code: "SAVE20",
      type: "PERCENT",
      value: "20",
      startsAt: "2026-06-20T00:00",
      endsAt: "2026-06-19T00:00",
      isActive: true,
    });
    expect(result.success).toBe(false);
  });
});
```

- [ ] **Step 4: Run the tests and verify they fail**

Run:

```powershell
npm run test:run -- src/features/admin/money.test.ts src/features/admin/order-status.test.ts src/features/admin/discount.test.ts
```

Expected: FAIL because the three implementation modules do not exist.

- [ ] **Step 5: Implement the minimal domain modules**

Create `src/features/admin/money.ts`:

```ts
import { Prisma } from "@prisma/client";

export type MoneyInput = Prisma.Decimal | string | number;

export function toDecimal(value: MoneyInput): Prisma.Decimal {
  return value instanceof Prisma.Decimal ? value : new Prisma.Decimal(value);
}

export function toMoneyString(value: MoneyInput): string {
  return toDecimal(value).toFixed(2);
}

export function formatBaht(value: MoneyInput): string {
  return new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: "THB",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(toMoneyString(value)));
}
```

Create `src/features/admin/order-status.ts`:

```ts
export const ORDER_STATUSES = [
  "PENDING",
  "PAID",
  "COMPLETED",
  "CANCELLED",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

const ALLOWED_TRANSITIONS: Record<OrderStatus, readonly OrderStatus[]> = {
  PENDING: ["PAID", "CANCELLED"],
  PAID: ["COMPLETED"],
  COMPLETED: [],
  CANCELLED: [],
};

export function canTransitionOrder(
  from: OrderStatus,
  to: OrderStatus,
): boolean {
  return ALLOWED_TRANSITIONS[from].includes(to);
}
```

Create `src/features/admin/discount.ts`:

```ts
import { Prisma } from "@prisma/client";
import { z } from "zod";

const optionalMoney = z.union([z.string(), z.number()]).optional();

export const discountInputSchema = z
  .object({
    code: z.string().trim().min(3).max(40).transform((value) => value.toUpperCase()),
    type: z.enum(["PERCENT", "FIXED"]),
    value: z.union([z.string(), z.number()]),
    minimumOrderAmount: optionalMoney,
    maximumDiscountAmount: optionalMoney,
    startsAt: z.coerce.date(),
    endsAt: z.coerce.date(),
    usageLimit: z.coerce.number().int().positive().optional(),
    perUserLimit: z.coerce.number().int().positive().optional(),
    isActive: z.preprocess(
      (value) => value === true || value === "true" || value === "on",
      z.boolean(),
    ),
  })
  .superRefine((value, context) => {
    const amount = new Prisma.Decimal(value.value);
    if (amount.lte(0) || (value.type === "PERCENT" && amount.gt(100))) {
      context.addIssue({
        code: "custom",
        path: ["value"],
        message: "มูลค่าส่วนลดไม่ถูกต้อง",
      });
    }
    if (value.endsAt <= value.startsAt) {
      context.addIssue({
        code: "custom",
        path: ["endsAt"],
        message: "วันสิ้นสุดต้องอยู่หลังวันเริ่มต้น",
      });
    }
    if (
      value.usageLimit &&
      value.perUserLimit &&
      value.perUserLimit > value.usageLimit
    ) {
      context.addIssue({
        code: "custom",
        path: ["perUserLimit"],
        message: "จำนวนต่อสมาชิกต้องไม่เกินจำนวนใช้ทั้งหมด",
      });
    }
  });

export function calculateDiscount(input: {
  subtotal: string;
  type: "PERCENT" | "FIXED";
  value: string;
  maximumDiscountAmount?: string | null;
}): string {
  const subtotal = new Prisma.Decimal(input.subtotal);
  const value = new Prisma.Decimal(input.value);
  const raw =
    input.type === "PERCENT"
      ? subtotal.mul(value).div(100)
      : Prisma.Decimal.min(subtotal, value);
  const capped = input.maximumDiscountAmount
    ? Prisma.Decimal.min(raw, new Prisma.Decimal(input.maximumDiscountAmount))
    : raw;
  return Prisma.Decimal.min(subtotal, capped).toFixed(2);
}
```

Create `src/features/admin/action-state.ts`:

```ts
export interface AdminActionState {
  status: "idle" | "success" | "error";
  message: string;
  fields?: Record<string, string[] | undefined>;
}

export const INITIAL_ADMIN_ACTION_STATE: AdminActionState = {
  status: "idle",
  message: "",
};
```

- [ ] **Step 6: Run the focused tests**

Run:

```powershell
npm run test:run -- src/features/admin/money.test.ts src/features/admin/order-status.test.ts src/features/admin/discount.test.ts
```

Expected: PASS.

- [ ] **Step 7: Commit the domain foundation**

```powershell
git add package.json package-lock.json vitest.config.mts src/features/admin
git commit -m "feat: add admin domain primitives"
```

---

### Task 2: Migrate Prisma Money, Orders, Products, And Discounts

**Files:**
- Modify: `prisma/schema.prisma`
- Create: `prisma/migrations/20260613120000_admin_dashboard/migration.sql`
- Modify: `prisma/seed.ts`
- Create: `prisma/schema-contract.test.ts`

- [ ] **Step 1: Write a failing schema contract test**

Create `prisma/schema-contract.test.ts`:

```ts
import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

describe("admin Prisma schema", () => {
  it("contains Decimal money, archive support, and discount usage", async () => {
    const schema = await readFile("prisma/schema.prisma", "utf8");
    expect(schema).toContain("price         Decimal");
    expect(schema).toContain("archivedAt");
    expect(schema).toContain("model Discount {");
    expect(schema).toContain("model DiscountUsage {");
    expect(schema).toContain("discountAmount Decimal");
  });
});
```

- [ ] **Step 2: Run the contract test and verify it fails**

Run:

```powershell
npm run test:run -- prisma/schema-contract.test.ts
```

Expected: FAIL because the current schema uses `Float` and has no discount models.

- [ ] **Step 3: Update the Prisma models**

Use these exact field contracts in `prisma/schema.prisma`:

```prisma
model User {
  id             Int             @id @default(autoincrement())
  email          String          @unique
  password       String
  name           String
  role           String          @default("CUSTOMER")
  createdAt      DateTime        @default(now())
  updatedAt      DateTime        @updatedAt
  orders         Order[]
  reviews        Review[]
  discountUsages DiscountUsage[]
}

model Product {
  id            Int          @id @default(autoincrement())
  name          String
  description   String       @db.Text
  price         Decimal      @db.Decimal(12, 2)
  originalPrice Decimal?     @db.Decimal(12, 2)
  image         String?
  category      String
  stock         Int          @default(0)
  archivedAt    DateTime?
  createdAt     DateTime     @default(now())
  updatedAt     DateTime     @updatedAt
  orderItems    OrderItem[]
  licenseKeys   LicenseKey[]
  reviews       Review[]

  @@index([archivedAt, category])
}

model Order {
  id              Int            @id @default(autoincrement())
  userId          Int
  user            User           @relation(fields: [userId], references: [id], onDelete: Cascade)
  subtotal        Decimal        @db.Decimal(12, 2)
  discountAmount  Decimal        @default(0) @db.Decimal(12, 2)
  total           Decimal        @db.Decimal(12, 2)
  discountCode    String?
  status          String         @default("PENDING")
  paymentMethod   String?
  createdAt       DateTime       @default(now())
  updatedAt       DateTime       @updatedAt
  orderItems      OrderItem[]
  discountUsage   DiscountUsage?

  @@index([status, createdAt])
  @@index([userId, createdAt])
}

model OrderItem {
  id          Int         @id @default(autoincrement())
  orderId     Int
  order       Order       @relation(fields: [orderId], references: [id], onDelete: Cascade)
  productId   Int
  product     Product     @relation(fields: [productId], references: [id], onDelete: Restrict)
  quantity    Int         @default(1)
  price       Decimal     @db.Decimal(12, 2)
  licenseKey  LicenseKey?
}

model Discount {
  id                    Int             @id @default(autoincrement())
  code                  String          @unique
  type                  String
  value                 Decimal         @db.Decimal(12, 2)
  minimumOrderAmount    Decimal?        @db.Decimal(12, 2)
  maximumDiscountAmount Decimal?        @db.Decimal(12, 2)
  startsAt              DateTime
  endsAt                DateTime
  usageLimit            Int?
  perUserLimit          Int?
  isActive              Boolean         @default(true)
  archivedAt            DateTime?
  createdAt             DateTime        @default(now())
  updatedAt             DateTime        @updatedAt
  usages                DiscountUsage[]

  @@index([isActive, archivedAt, startsAt, endsAt])
}

model DiscountUsage {
  id                 Int      @id @default(autoincrement())
  discountId         Int
  discount           Discount @relation(fields: [discountId], references: [id], onDelete: Restrict)
  userId             Int
  user               User     @relation(fields: [userId], references: [id], onDelete: Restrict)
  orderId            Int      @unique
  order              Order    @relation(fields: [orderId], references: [id], onDelete: Restrict)
  codeSnapshot       String
  subtotalSnapshot   Decimal  @db.Decimal(12, 2)
  discountAmount     Decimal  @db.Decimal(12, 2)
  totalSnapshot      Decimal  @db.Decimal(12, 2)
  createdAt          DateTime @default(now())

  @@index([discountId, createdAt])
  @@index([userId, createdAt])
}
```

Keep `LicenseKey` and `Review`, but change the `OrderItem.product` delete rule
to `Restrict` as shown so archive semantics cannot be bypassed by deletion.

- [ ] **Step 4: Create the forward-only MariaDB migration**

Create `prisma/migrations/20260613120000_admin_dashboard/migration.sql` with:

```sql
ALTER TABLE `Product`
  MODIFY `price` DECIMAL(12,2) NOT NULL,
  MODIFY `originalPrice` DECIMAL(12,2) NULL,
  ADD COLUMN `archivedAt` DATETIME(3) NULL;

ALTER TABLE `Order`
  MODIFY `total` DECIMAL(12,2) NOT NULL,
  ADD COLUMN `subtotal` DECIMAL(12,2) NOT NULL DEFAULT 0,
  ADD COLUMN `discountAmount` DECIMAL(12,2) NOT NULL DEFAULT 0,
  ADD COLUMN `discountCode` VARCHAR(191) NULL;

UPDATE `Order` SET `subtotal` = `total` WHERE `subtotal` = 0;

ALTER TABLE `Order`
  MODIFY `subtotal` DECIMAL(12,2) NOT NULL;

ALTER TABLE `OrderItem`
  MODIFY `price` DECIMAL(12,2) NOT NULL;

ALTER TABLE `OrderItem`
  DROP FOREIGN KEY `OrderItem_productId_fkey`;

ALTER TABLE `OrderItem`
  ADD CONSTRAINT `OrderItem_productId_fkey`
  FOREIGN KEY (`productId`) REFERENCES `Product`(`id`)
  ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE `Discount` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `code` VARCHAR(191) NOT NULL,
  `type` VARCHAR(191) NOT NULL,
  `value` DECIMAL(12,2) NOT NULL,
  `minimumOrderAmount` DECIMAL(12,2) NULL,
  `maximumDiscountAmount` DECIMAL(12,2) NULL,
  `startsAt` DATETIME(3) NOT NULL,
  `endsAt` DATETIME(3) NOT NULL,
  `usageLimit` INTEGER NULL,
  `perUserLimit` INTEGER NULL,
  `isActive` BOOLEAN NOT NULL DEFAULT true,
  `archivedAt` DATETIME(3) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  UNIQUE INDEX `Discount_code_key`(`code`),
  INDEX `Discount_isActive_archivedAt_startsAt_endsAt_idx`
    (`isActive`, `archivedAt`, `startsAt`, `endsAt`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `DiscountUsage` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `discountId` INTEGER NOT NULL,
  `userId` INTEGER NOT NULL,
  `orderId` INTEGER NOT NULL,
  `codeSnapshot` VARCHAR(191) NOT NULL,
  `subtotalSnapshot` DECIMAL(12,2) NOT NULL,
  `discountAmount` DECIMAL(12,2) NOT NULL,
  `totalSnapshot` DECIMAL(12,2) NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  UNIQUE INDEX `DiscountUsage_orderId_key`(`orderId`),
  INDEX `DiscountUsage_discountId_createdAt_idx`(`discountId`, `createdAt`),
  INDEX `DiscountUsage_userId_createdAt_idx`(`userId`, `createdAt`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE INDEX `Product_archivedAt_category_idx`
  ON `Product`(`archivedAt`, `category`);
CREATE INDEX `Order_status_createdAt_idx`
  ON `Order`(`status`, `createdAt`);
CREATE INDEX `Order_userId_createdAt_idx`
  ON `Order`(`userId`, `createdAt`);

ALTER TABLE `DiscountUsage`
  ADD CONSTRAINT `DiscountUsage_discountId_fkey`
  FOREIGN KEY (`discountId`) REFERENCES `Discount`(`id`)
  ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `DiscountUsage_userId_fkey`
  FOREIGN KEY (`userId`) REFERENCES `User`(`id`)
  ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `DiscountUsage_orderId_fkey`
  FOREIGN KEY (`orderId`) REFERENCES `Order`(`id`)
  ON DELETE RESTRICT ON UPDATE CASCADE;
```

The existing migration defines the foreign key as
`OrderItem_productId_fkey`; keep that exact name in the `DROP FOREIGN KEY`
clause.

- [ ] **Step 5: Hash seed passwords and seed representative admin data**

Modify `prisma/seed.ts` to import:

```ts
import { hash } from "bcryptjs";
import { Prisma } from "@prisma/client";
```

Create users with:

```ts
const [adminPassword, customerPassword] = await Promise.all([
  hash("adminpassword123", 12),
  hash("password123", 12),
]);
```

Delete in foreign-key order:

```ts
await prisma.discountUsage.deleteMany();
await prisma.discount.deleteMany();
await prisma.review.deleteMany();
await prisma.licenseKey.deleteMany();
await prisma.orderItem.deleteMany();
await prisma.order.deleteMany();
await prisma.product.deleteMany();
await prisma.user.deleteMany();
```

Seed at least:

```ts
const welcomeDiscount = await prisma.discount.create({
  data: {
    code: "WELCOME10",
    type: "PERCENT",
    value: new Prisma.Decimal("10.00"),
    minimumOrderAmount: new Prisma.Decimal("500.00"),
    maximumDiscountAmount: new Prisma.Decimal("300.00"),
    startsAt: new Date("2026-01-01T00:00:00+07:00"),
    endsAt: new Date("2026-12-31T23:59:59+07:00"),
    usageLimit: 1000,
    perUserLimit: 1,
    isActive: true,
  },
});
```

Update seeded orders to set `subtotal`, `discountAmount`, `total`, and one
`DiscountUsage`, and seed all four order statuses so dashboard and order
filters are testable.

- [ ] **Step 6: Validate, generate, migrate, and seed**

Run:

```powershell
npx prisma format
npx prisma validate
npx prisma generate
npx prisma migrate deploy
npx prisma db seed
npm run test:run -- prisma/schema-contract.test.ts
```

Expected: every command exits 0 and the contract test passes. If migration
deployment reports an existing foreign-key name mismatch, correct only that
name and rerun.

- [ ] **Step 7: Commit the database contract**

```powershell
git add prisma/schema.prisma prisma/seed.ts prisma/schema-contract.test.ts prisma/migrations/20260613120000_admin_dashboard/migration.sql
git commit -m "feat: add admin commerce data model"
```

---

### Task 3: Replace Mock Authentication With Auth.js Credentials And Roles

**Files:**
- Modify: `src/auth.ts`
- Modify: `src/proxy.ts`
- Modify: `src/app/(auth)/login/page.tsx`
- Modify: `src/app/(auth)/register/page.tsx`
- Create: `src/app/(auth)/actions.ts`
- Create: `src/components/auth/LoginForm.tsx`
- Create: `src/components/auth/RegisterForm.tsx`
- Create: `src/data/auth-users.ts`
- Create: `src/data/auth-users.test.ts`
- Create: `src/types/next-auth.d.ts`
- Create: `src/proxy.test.ts`
- Delete: `src/features/auth/mock-auth.ts`
- Delete: `src/features/auth/mock-auth.test.ts`

- [ ] **Step 1: Write failing credential and proxy tests**

Create `src/data/auth-users.test.ts`:

```ts
import { compare, hash } from "bcryptjs";
import { describe, expect, it } from "vitest";

import { verifyCredentials } from "@/data/auth-users";

describe("verifyCredentials", () => {
  it("returns a minimal user for a valid hashed password", async () => {
    const password = await hash("secret123", 4);
    const result = await verifyCredentials(
      { email: " ADMIN@EXAMPLE.COM ", password: "secret123" },
      async () => ({
        id: 7,
        email: "admin@example.com",
        name: "Admin",
        password,
        role: "ADMIN",
      }),
      compare,
    );
    expect(result).toEqual({
      id: "7",
      email: "admin@example.com",
      name: "Admin",
      role: "ADMIN",
    });
  });

  it("returns null without revealing whether email or password failed", async () => {
    const result = await verifyCredentials(
      { email: "missing@example.com", password: "wrong" },
      async () => null,
      compare,
    );
    expect(result).toBeNull();
  });
});
```

Create `src/proxy.test.ts` using Next.js 16 proxy testing:

```ts
import { NextRequest } from "next/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/auth", () => ({
  auth: (handler: (request: NextRequest & { auth: null }) => Response) =>
    (request: NextRequest) =>
      handler(Object.assign(request, { auth: null })),
}));

describe("proxy", () => {
  it("redirects anonymous admin navigation to login", async () => {
    const { proxy } = await import("@/proxy");
    const response = await proxy(
      new NextRequest("http://localhost:3000/admin"),
    );
    expect(response.headers.get("location")).toBe(
      "http://localhost:3000/login?callbackUrl=%2Fadmin",
    );
  });
});
```

- [ ] **Step 2: Run the tests and verify they fail**

Run:

```powershell
npm run test:run -- src/data/auth-users.test.ts src/proxy.test.ts
```

Expected: FAIL because `verifyCredentials` is missing and proxy still reads
`mock_user`.

- [ ] **Step 3: Implement database credential verification**

Create `src/data/auth-users.ts`:

```ts
import "server-only";

import { compare } from "bcryptjs";
import { z } from "zod";

import { prisma } from "@/lib/prisma";

const credentialsSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(8).max(128),
});

type UserRecord = {
  id: number;
  email: string;
  name: string;
  password: string;
  role: string;
};

export async function verifyCredentials(
  raw: unknown,
  findUser: (email: string) => Promise<UserRecord | null> = (email) =>
    prisma.user.findUnique({ where: { email } }),
  comparePassword: typeof compare = compare,
) {
  const parsed = credentialsSchema.safeParse(raw);
  if (!parsed.success) return null;
  const user = await findUser(parsed.data.email);
  if (!user || !(await comparePassword(parsed.data.password, user.password))) {
    return null;
  }
  return {
    id: String(user.id),
    email: user.email,
    name: user.name,
    role: user.role,
  };
}

export async function findAuthUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email: email.trim().toLowerCase() },
    select: { id: true, email: true, name: true, role: true },
  });
}
```

- [ ] **Step 4: Configure Auth.js session role and Google mapping**

Replace `src/auth.ts` with:

```ts
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";

import {
  findAuthUserByEmail,
  verifyCredentials,
} from "@/data/auth-users";

export const { handlers, signIn, signOut, auth } = NextAuth({
  session: { strategy: "jwt" },
  pages: { signIn: "/login", error: "/login" },
  providers: [
    Credentials({
      credentials: { email: {}, password: {} },
      authorize: verifyCredentials,
    }),
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
      authorization: { params: { prompt: "select_account" } },
    }),
  ],
  callbacks: {
    async signIn({ account, user }) {
      if (account?.provider !== "google") return true;
      if (!user.email) return false;
      return Boolean(await findAuthUserByEmail(user.email));
    },
    async jwt({ token, user }) {
      const email = user?.email ?? token.email;
      if (email) {
        const databaseUser = await findAuthUserByEmail(email);
        if (databaseUser) {
          token.sub = String(databaseUser.id);
          token.role = databaseUser.role;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
        session.user.role = String(token.role ?? "CUSTOMER");
      }
      return session;
    },
  },
});
```

Create `src/types/next-auth.d.ts`:

```ts
import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }

  interface User {
    role?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: string;
  }
}
```

- [ ] **Step 5: Implement registration and role-aware login actions**

Create `src/app/(auth)/actions.ts` with Zod validation, `hash(password, 12)`,
`role: "CUSTOMER"`, duplicate-email handling, and:

```ts
"use server";

import { AuthError } from "next-auth";
import { hash } from "bcryptjs";
import { redirect } from "next/navigation";
import { z } from "zod";

import { signIn } from "@/auth";
import {
  findAuthUserByEmail,
  verifyCredentials,
} from "@/data/auth-users";
import { prisma } from "@/lib/prisma";

export type AuthActionState = {
  message: string;
  fields?: Record<string, string[] | undefined>;
};

export async function loginAction(
  _state: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const user = await verifyCredentials({ email, password });
  if (!user) return { message: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" };
  try {
    await signIn("credentials", { email, password, redirect: false });
  } catch (error) {
    if (error instanceof AuthError) {
      return { message: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" };
    }
    throw error;
  }
  redirect(user.role === "ADMIN" ? "/admin" : "/");
}

const registerSchema = z
  .object({
    firstName: z.string().trim().min(1),
    lastName: z.string().trim().min(1),
    email: z.string().trim().toLowerCase().email(),
    password: z.string().min(8).max(128),
    confirmPassword: z.string(),
  })
  .refine((value) => value.password === value.confirmPassword, {
    path: ["confirmPassword"],
    message: "รหัสผ่านไม่ตรงกัน",
  });

export async function registerAction(
  _state: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = registerSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return {
      message: "กรุณาตรวจสอบข้อมูล",
      fields: parsed.error.flatten().fieldErrors,
    };
  }
  const { firstName, lastName, email, password } = parsed.data;
  if (await findAuthUserByEmail(email)) {
    return { message: "ไม่สามารถสมัครด้วยอีเมลนี้ได้" };
  }
  await prisma.user.create({
    data: {
      name: `${firstName} ${lastName}`.trim(),
      email,
      password: await hash(password, 12),
      role: "CUSTOMER",
    },
  });
  redirect("/login?registered=1");
}
```

Move the existing visual markup into `LoginForm.tsx` and `RegisterForm.tsx`,
use `useActionState`, and make the two route pages Server Components that render
the forms. Remove all `localStorage`, `document.cookie`, `setTimeout`, and mock
login code.

- [ ] **Step 6: Replace proxy mock-cookie navigation**

Implement `src/proxy.ts` with Auth.js wrapping:

```ts
import { NextResponse } from "next/server";

import { auth } from "@/auth";

export const proxy = auth((request) => {
  const { pathname, search } = request.nextUrl;
  const protectedRoute =
    pathname.startsWith("/admin") ||
    pathname.startsWith("/checkout") ||
    pathname.startsWith("/profile");

  if (protectedRoute && !request.auth?.user) {
    const login = new URL("/login", request.url);
    login.searchParams.set("callbackUrl", `${pathname}${search}`);
    return NextResponse.redirect(login);
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|assets).*)",
  ],
};
```

- [ ] **Step 7: Run authentication tests and build**

Run:

```powershell
npm run test:run -- src/data/auth-users.test.ts src/proxy.test.ts
npm run build
```

Expected: tests pass and the production build exits 0.

- [ ] **Step 8: Commit real authentication**

```powershell
git add src/auth.ts src/proxy.ts src/proxy.test.ts src/types/next-auth.d.ts src/data/auth-users.ts src/data/auth-users.test.ts 'src/app/(auth)' src/components/auth
git rm src/features/auth/mock-auth.ts src/features/auth/mock-auth.test.ts
git commit -m "feat: replace mock auth with role-aware Auth.js"
```

---

### Task 4: Add The Administrator Authorization And Query Boundary

**Files:**
- Create: `src/data/admin/auth.ts`
- Create: `src/data/admin/auth.test.ts`
- Create: `src/features/admin/query.ts`
- Create: `src/features/admin/query.test.ts`

- [ ] **Step 1: Write failing authorization and query tests**

Create `src/data/admin/auth.test.ts`:

```ts
import { describe, expect, it } from "vitest";

import {
  AdminAccessError,
  resolveAdmin,
} from "@/data/admin/auth";

describe("resolveAdmin", () => {
  it("returns only the administrator DTO", async () => {
    const admin = await resolveAdmin(
      { user: { id: "3", role: "ADMIN" } },
      async () => ({
        id: 3,
        name: "Admin",
        email: "admin@example.com",
        role: "ADMIN",
        password: "must-not-leak",
      }),
    );
    expect(admin).toEqual({
      id: 3,
      name: "Admin",
      email: "admin@example.com",
      role: "ADMIN",
    });
  });

  it("rejects a customer even if a client value claims admin", async () => {
    await expect(
      resolveAdmin(
        { user: { id: "4", role: "ADMIN" } },
        async () => ({
          id: 4,
          name: "Customer",
          email: "customer@example.com",
          role: "CUSTOMER",
          password: "hidden",
        }),
      ),
    ).rejects.toBeInstanceOf(AdminAccessError);
  });
});
```

Create `src/features/admin/query.test.ts`:

```ts
import { describe, expect, it } from "vitest";

import { parseListQuery } from "@/features/admin/query";

describe("parseListQuery", () => {
  it("bounds page size and strips unknown sort keys", () => {
    expect(
      parseListQuery({
        page: "0",
        pageSize: "999",
        sort: "password",
        direction: "sideways",
      }),
    ).toEqual({
      page: 1,
      pageSize: 50,
      search: "",
      sort: "createdAt",
      direction: "desc",
    });
  });
});
```

- [ ] **Step 2: Run and verify failure**

Run:

```powershell
npm run test:run -- src/data/admin/auth.test.ts src/features/admin/query.test.ts
```

Expected: FAIL because both modules are missing.

- [ ] **Step 3: Implement the authorization boundary**

Create `src/data/admin/auth.ts`:

```ts
import "server-only";

import { cache } from "react";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export class AdminAccessError extends Error {
  constructor(public readonly reason: "UNAUTHENTICATED" | "FORBIDDEN") {
    super(reason);
  }
}

type SessionLike = {
  user?: { id?: string; role?: string } | null;
} | null;

type UserRecord = {
  id: number;
  name: string;
  email: string;
  role: string;
  password: string;
};

export async function resolveAdmin(
  session: SessionLike,
  findUser: (id: number) => Promise<UserRecord | null> = (id) =>
    prisma.user.findUnique({ where: { id } }),
) {
  const id = Number(session?.user?.id);
  if (!Number.isInteger(id) || id <= 0) {
    throw new AdminAccessError("UNAUTHENTICATED");
  }
  const user = await findUser(id);
  if (!user || user.role !== "ADMIN") {
    throw new AdminAccessError("FORBIDDEN");
  }
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: "ADMIN" as const,
  };
}

export const requireAdmin = cache(async () => resolveAdmin(await auth()));
```

- [ ] **Step 4: Implement bounded list parsing**

Create `src/features/admin/query.ts`:

```ts
import { z } from "zod";

const listQuerySchema = z.object({
  page: z.coerce.number().int().min(1).catch(1),
  pageSize: z.coerce.number().int().min(10).max(50).catch(10),
  search: z.string().trim().max(100).catch(""),
  sort: z.enum(["createdAt", "name", "total"]).catch("createdAt"),
  direction: z.enum(["asc", "desc"]).catch("desc"),
});

export type RawSearchParams = Record<
  string,
  string | string[] | undefined
>;

export function parseListQuery(raw: RawSearchParams) {
  const scalar = Object.fromEntries(
    Object.entries(raw).map(([key, value]) => [
      key,
      Array.isArray(value) ? value[0] : value,
    ]),
  );
  return listQuerySchema.parse(scalar);
}
```

- [ ] **Step 5: Run tests**

Run:

```powershell
npm run test:run -- src/data/admin/auth.test.ts src/features/admin/query.test.ts
```

Expected: PASS.

- [ ] **Step 6: Commit the authorization boundary**

```powershell
git add src/data/admin src/features/admin/query.ts src/features/admin/query.test.ts
git commit -m "feat: add admin authorization boundary"
```

---

### Task 5: Build The Protected Admin Shell And Shared Components

**Files:**
- Create: `src/app/admin/layout.tsx`
- Create: `src/app/admin/admin.css`
- Create: `src/app/admin/loading.tsx`
- Create: `src/app/admin/error.tsx`
- Create: `src/components/admin/AdminSidebar.tsx`
- Create: `src/components/admin/AdminNavLinks.tsx`
- Create: `src/components/admin/AdminMobileNav.tsx`
- Create: `src/components/admin/AdminPageHeader.tsx`
- Create: `src/components/admin/AdminKpiCard.tsx`
- Create: `src/components/admin/AdminDataTable.tsx`
- Create: `src/components/admin/AdminStatusBadge.tsx`
- Create: `src/components/admin/AdminPagination.tsx`
- Create: `src/components/admin/AdminSearch.tsx`
- Create: `src/components/admin/AdminConfirmDialog.tsx`
- Create: `src/components/admin/AdminForm.tsx`
- Create: `src/components/admin/admin-components.test.tsx`

- [ ] **Step 1: Write failing shared-component tests**

Create `src/components/admin/admin-components.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";

describe("admin shared UI", () => {
  it("renders a semantic page heading and breadcrumb", () => {
    render(
      <AdminPageHeader
        breadcrumb={["หน้าแรก", "รายการสั่งซื้อ"]}
        title="รายการสั่งซื้อ"
      />,
    );
    expect(
      screen.getByRole("heading", { level: 1, name: "รายการสั่งซื้อ" }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("เส้นทางนำทาง")).toBeInTheDocument();
  });

  it("does not communicate status by color alone", () => {
    render(<AdminStatusBadge status="PAID" />);
    expect(screen.getByText("ชำระแล้ว")).toHaveAccessibleName("สถานะ ชำระแล้ว");
  });
});
```

- [ ] **Step 2: Run and verify failure**

Run:

```powershell
npm run test:run -- src/components/admin/admin-components.test.tsx
```

Expected: FAIL because the components do not exist.

- [ ] **Step 3: Implement the shared presentational contract**

Implement `AdminPageHeader.tsx`:

```tsx
import type { ReactNode } from "react";

export function AdminPageHeader({
  actions,
  breadcrumb,
  title,
}: {
  actions?: ReactNode;
  breadcrumb: string[];
  title: string;
}) {
  return (
    <header className="admin-page-header">
      <div>
        <h1>{title}</h1>
        <nav aria-label="เส้นทางนำทาง">
          {breadcrumb.map((item, index) => (
            <span key={item}>
              {index > 0 ? " / " : ""}
              {item}
            </span>
          ))}
        </nav>
      </div>
      {actions ? <div className="admin-page-actions">{actions}</div> : null}
    </header>
  );
}
```

Implement `AdminStatusBadge.tsx`:

```tsx
const LABELS: Record<string, string> = {
  PENDING: "รอดำเนินการ",
  PAID: "ชำระแล้ว",
  COMPLETED: "สำเร็จ",
  CANCELLED: "ยกเลิก",
  ACTIVE: "ใช้งาน",
  INACTIVE: "ปิดใช้งาน",
  ARCHIVED: "เก็บถาวร",
};

export function AdminStatusBadge({ status }: { status: string }) {
  const label = LABELS[status] ?? status;
  return (
    <span
      aria-label={`สถานะ ${label}`}
      className={`admin-status admin-status--${status.toLowerCase()}`}
    >
      <span aria-hidden="true" className="admin-status__dot" />
      {label}
    </span>
  );
}
```

Implement `AdminDataTable.tsx`:

```tsx
import type { ReactNode } from "react";

export function AdminDataTable({
  children,
  label,
}: {
  children: ReactNode;
  label: string;
}) {
  return (
    <div
      aria-label={label}
      className="admin-table-scroll"
      role="region"
      tabIndex={0}
    >
      <table className="admin-table">{children}</table>
    </div>
  );
}
```

`AdminConfirmDialog.tsx` uses this public interface:

```ts
export type AdminConfirmDialogProps = {
  triggerLabel: string;
  title: string;
  description: string;
  confirmLabel: string;
  onConfirm: () => void | Promise<void>;
};
```

It renders a native `<dialog>`, stores the trigger element in a ref before
opening, closes on cancel/Escape, and restores focus to that trigger after
close.

Use these exact contracts for the remaining components:

```ts
export type AdminKpiCardProps = {
  label: string;
  value: string;
  supportingText?: string;
  icon: string;
};

export type AdminPaginationProps = {
  page: number;
  pageSize: number;
  totalRows: number;
  pathname: string;
  searchParams: Record<string, string>;
};

export type AdminSearchProps = {
  defaultValue: string;
  label: string;
  placeholder: string;
};
```

`AdminSidebar` uses one constant nav array with the six approved routes and
`usePathname()` only inside a tiny client `AdminNavLinks` child to set
`aria-current`. `AdminPagination` creates `next/link` URLs while preserving
filters. `AdminSearch` debounces 300 ms, updates `search`, resets `page=1`, and
uses `router.replace`. `AdminForm` renders `AdminActionState.message` in a live
region. Keep `AdminPageHeader`, `AdminKpiCard`, `AdminDataTable`,
`AdminStatusBadge`, and `AdminPagination` server-compatible. Add `"use client"`
only to active navigation, `AdminMobileNav`, `AdminSearch`,
`AdminConfirmDialog`, and the form wrapper.

- [ ] **Step 4: Implement the protected layout**

Create `src/app/admin/layout.tsx`:

```tsx
import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminAccessError, requireAdmin } from "@/data/admin/auth";

import "./admin.css";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let admin;
  try {
    admin = await requireAdmin();
  } catch (error) {
    if (error instanceof AdminAccessError) {
      redirect(error.reason === "UNAUTHENTICATED" ? "/login" : "/");
    }
    throw error;
  }

  return (
    <div className="admin-shell">
      <AdminSidebar />
      <div className="admin-shell__main">
        <div className="admin-shell__identity">
          <strong>{admin.name}</strong>
          <span>SUPER ADMINISTRATOR</span>
        </div>
        {children}
      </div>
    </div>
  );
}
```

Use `stitch_screens/admin/finance.html` and
`stitch_screens/admin/products.html` to reproduce sidebar width, navy, active
blue treatment, white cards, table density, and spacing in `admin.css`.

- [ ] **Step 5: Add shared loading and error states**

`loading.tsx` renders four KPI skeletons and a table skeleton. `error.tsx` is a
Client Component using the Next.js 16 `unstable_retry` prop:

```tsx
"use client";

import { useEffect } from "react";

export default function AdminError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <section className="admin-error" role="alert">
      <h1>ไม่สามารถโหลดข้อมูลแอดมินได้</h1>
      <p>กรุณาลองอีกครั้ง ข้อมูลของคุณยังไม่ถูกเปลี่ยนแปลง</p>
      <button className="ui-button ui-button--primary" onClick={unstable_retry}>
        ลองใหม่
      </button>
    </section>
  );
}
```

- [ ] **Step 6: Run component tests and lint**

Run:

```powershell
npm run test:run -- src/components/admin/admin-components.test.tsx
npm run lint
```

Expected: PASS.

- [ ] **Step 7: Commit the admin shell**

```powershell
git add src/app/admin src/components/admin
git commit -m "feat: add protected admin shell"
```

---

### Task 6: Persist Checkout Orders And Discount Usage Transactionally

**Files:**
- Create: `src/data/checkout.ts`
- Create: `src/data/checkout.test.ts`
- Create: `src/app/(storefront)/checkout/actions.ts`
- Modify: `src/components/checkout/CheckoutForm.tsx`
- Modify: `src/components/checkout/CheckoutForm.test.tsx`
- Modify: `src/data/products.ts`

- [ ] **Step 1: Write a failing checkout transaction test**

Create `src/data/checkout.test.ts` around an injected transaction repository:

```ts
import { describe, expect, it, vi } from "vitest";

import { createOrderFromCart } from "@/data/checkout";

describe("createOrderFromCart", () => {
  it("uses database prices and writes order plus discount usage once", async () => {
    const transaction = vi.fn(async (operation) =>
      operation({
        product: {
          findMany: vi.fn().mockResolvedValue([
            { id: 3, name: "Office", price: "1000.00", stock: 2, archivedAt: null },
          ]),
          update: vi.fn(),
        },
        discount: {
          findUnique: vi.fn().mockResolvedValue({
            id: 9,
            code: "SAVE10",
            type: "PERCENT",
            value: "10.00",
            minimumOrderAmount: null,
            maximumDiscountAmount: null,
            startsAt: new Date("2026-01-01"),
            endsAt: new Date("2026-12-31"),
            usageLimit: 10,
            perUserLimit: 1,
            isActive: true,
            archivedAt: null,
            _count: { usages: 0 },
            usages: [],
          }),
        },
        order: {
          create: vi.fn().mockResolvedValue({ id: 44 }),
        },
        discountUsage: { create: vi.fn() },
      }),
    );

    const result = await createOrderFromCart(
      {
        userId: 7,
        paymentMethod: "PROMPTPAY",
        promotionCode: "SAVE10",
        lines: [{ productId: 3, quantity: 1 }],
      },
      { transaction, now: () => new Date("2026-06-13") },
    );

    expect(result).toEqual({ orderId: 44, total: "900.00" });
    expect(transaction).toHaveBeenCalledOnce();
  });
});
```

- [ ] **Step 2: Run and verify failure**

Run:

```powershell
npm run test:run -- src/data/checkout.test.ts
```

Expected: FAIL because `createOrderFromCart` is missing.

- [ ] **Step 3: Implement the transaction service**

Create `src/data/checkout.ts` as a `server-only` service. It must:

1. Re-query active products by ID.
2. Reject missing, archived, or insufficient-stock products.
3. Calculate subtotal from Prisma Decimal database prices.
4. Validate discount date, amount, total usage, and per-user usage.
5. Create `Order` and `OrderItem` snapshots.
6. Decrement stock with guarded `updateMany({ where: { stock: { gte }}})`.
7. Create one `DiscountUsage` when a code applies.
8. Return only `{ orderId, total }`.

Expose this exact interface:

```ts
export type CheckoutCommand = {
  userId: number;
  paymentMethod: "PROMPTPAY" | "CREDIT_CARD";
  promotionCode: string | null;
  lines: Array<{ productId: number; quantity: number }>;
};

export type CheckoutSuccess = {
  orderId: number;
  total: string;
};

type CheckoutDependencies = {
  transaction<T>(
    operation: (transaction: Prisma.TransactionClient) => Promise<T>,
  ): Promise<T>;
  now(): Date;
};

const defaultDependencies: CheckoutDependencies = {
  transaction: (operation) => prisma.$transaction(operation),
  now: () => new Date(),
};

export async function createOrderFromCart(
  command: CheckoutCommand,
  dependencies = defaultDependencies,
): Promise<CheckoutSuccess>;
```

Use `calculateDiscount` from Task 1 and
`prisma.$transaction((transaction) => operation(transaction))`.
New checkout orders start as `PENDING`; only the approved admin transitions
move them to `PAID`, `COMPLETED`, or `CANCELLED`.

- [ ] **Step 4: Add an authenticated checkout Server Action**

Create `src/app/(storefront)/checkout/actions.ts`:

```ts
"use server";

import { auth } from "@/auth";
import { createOrderFromCart } from "@/data/checkout";

export async function submitCheckout(input: {
  paymentMethod: "PROMPTPAY" | "CREDIT_CARD";
  promotionCode: string | null;
  lines: Array<{ productId: number; quantity: number }>;
}) {
  const session = await auth();
  const userId = Number(session?.user?.id);
  if (!Number.isInteger(userId) || userId <= 0) {
    return { status: "error" as const, message: "กรุณาเข้าสู่ระบบอีกครั้ง" };
  }
  try {
    const order = await createOrderFromCart({ userId, ...input });
    return {
      status: "success" as const,
      message: "สร้างคำสั่งซื้อแล้ว",
      orderId: order.orderId,
    };
  } catch {
    return {
      status: "error" as const,
      message: "ไม่สามารถสร้างคำสั่งซื้อได้ กรุณาตรวจสอบตะกร้าแล้วลองใหม่",
    };
  }
}
```

- [ ] **Step 5: Replace the checkout simulator**

Modify `CheckoutForm.tsx` to call `submitCheckout` with product IDs and
quantities after existing contact validation. Preserve duplicate-submit
prevention, card-unavailable messaging, cart clearing, and profile redirect.
Remove `simulateCheckout` injection from production code, but keep pure
validation tests in `src/features/checkout/checkout.test.ts`.

Pass only `promotion.code`, product IDs, and quantities to the action. Keep
promotion state in `StoredCart`; the server never trusts client `unitPrice`,
discount, subtotal, or total values.

- [ ] **Step 6: Hide archived products from the storefront**

Modify `src/data/products.ts` list and detail queries to require:

```ts
where: { archivedAt: null }
```

Convert Prisma Decimal fields to numbers only in the existing storefront DTO:

```ts
price: product.price.toNumber(),
originalPrice: product.originalPrice?.toNumber() ?? null,
```

- [ ] **Step 7: Run checkout and storefront tests**

Run:

```powershell
npm run test:run -- src/data/checkout.test.ts src/components/checkout/CheckoutForm.test.tsx src/features/checkout/checkout.test.ts
npm run build
```

Expected: PASS and build exits 0.

- [ ] **Step 8: Commit transactional checkout**

```powershell
git add src/data/checkout.ts src/data/checkout.test.ts 'src/app/(storefront)/checkout/actions.ts' src/components/checkout/CheckoutForm.tsx src/components/checkout/CheckoutForm.test.tsx src/data/products.ts
git commit -m "feat: persist checkout orders transactionally"
```

---

### Task 7: Build The Financial Dashboard

**Files:**
- Create: `src/data/admin/dashboard.ts`
- Create: `src/data/admin/dashboard.test.ts`
- Create: `src/components/admin/AdminSalesChart.tsx`
- Create: `src/components/admin/AdminSalesChart.test.tsx`
- Create: `src/app/admin/page.tsx`

- [ ] **Step 1: Write failing aggregate tests**

Create `src/data/admin/dashboard.test.ts`:

```ts
import { describe, expect, it } from "vitest";

import { summarizeDashboardRows } from "@/data/admin/dashboard";

describe("dashboard summaries", () => {
  it("counts only paid and completed revenue", () => {
    const result = summarizeDashboardRows([
      { status: "PAID", total: "1000.00", createdAt: new Date("2026-01-10") },
      { status: "COMPLETED", total: "500.00", createdAt: new Date("2026-01-12") },
      { status: "PENDING", total: "900.00", createdAt: new Date("2026-01-15") },
      { status: "CANCELLED", total: "200.00", createdAt: new Date("2026-01-16") },
    ]);
    expect(result.revenue).toBe("1500.00");
    expect(result.orderCount).toBe(2);
    expect(result.averageOrderValue).toBe("750.00");
  });
});
```

- [ ] **Step 2: Run and verify failure**

Run:

```powershell
npm run test:run -- src/data/admin/dashboard.test.ts
```

Expected: FAIL because the dashboard module is missing.

- [ ] **Step 3: Implement dashboard DTOs and queries**

Create a `server-only` `dashboard.ts` exporting:

```ts
import { Prisma } from "@prisma/client";

export type DashboardQuery = {
  from: Date;
  to: Date;
};

export type DashboardDto = {
  revenue: string;
  orderCount: number;
  averageOrderValue: string;
  activeProductCount: number;
  monthlySales: Array<{ month: string; revenue: number; orders: number }>;
  recentOrders: Array<{
    id: number;
    customerName: string;
    total: string;
    status: string;
    createdAt: string;
  }>;
};

export function summarizeDashboardRows(
  rows: Array<{ status: string; total: string; createdAt: Date }>,
) {
  const included = rows.filter(
    (row) => row.status === "PAID" || row.status === "COMPLETED",
  );
  const revenue = included.reduce(
    (sum, row) => sum.plus(row.total),
    new Prisma.Decimal(0),
  );
  return {
    revenue: revenue.toFixed(2),
    orderCount: included.length,
    averageOrderValue:
      included.length === 0
        ? "0.00"
        : revenue.div(included.length).toFixed(2),
  };
}
```

`getDashboard(query)` must call `requireAdmin()`, query only `PAID` and
`COMPLETED` for financial totals, count products with `archivedAt: null`, and
return twelve zero-filled monthly buckets for the selected year.

- [ ] **Step 4: Implement the Recharts client boundary**

`AdminSalesChart.tsx` begins with `"use client"` and renders a responsive
`BarChart` with labeled axes, Thai-baht tooltip, and a visible fallback table
for screen readers. Do not query data from the client.

- [ ] **Step 5: Build `/admin` from the finance Stitch reference**

Use `stitch_screens/admin/finance.html` and `finance.png`. The page awaits
`searchParams`, validates `from` and `to`, calls `getDashboard`, and renders
four `AdminKpiCard`s, `AdminSalesChart`, and recent orders.

- [ ] **Step 6: Run tests and build**

Run:

```powershell
npm run test:run -- src/data/admin/dashboard.test.ts src/components/admin/AdminSalesChart.test.tsx
npm run build
```

Expected: PASS.

- [ ] **Step 7: Commit the dashboard**

```powershell
git add src/data/admin/dashboard.ts src/data/admin/dashboard.test.ts src/components/admin/AdminSalesChart.tsx src/components/admin/AdminSalesChart.test.tsx src/app/admin/page.tsx
git commit -m "feat: add admin financial dashboard"
```

---

### Task 8: Build Order Management And Guarded Status Transitions

**Files:**
- Create: `src/data/admin/orders.ts`
- Create: `src/data/admin/orders.test.ts`
- Create: `src/app/admin/orders/page.tsx`
- Create: `src/app/admin/orders/actions.ts`
- Create: `src/components/admin/OrderDetailsDialog.tsx`
- Create: `src/components/admin/OrderStatusForm.tsx`
- Create: `src/components/admin/OrderStatusForm.test.tsx`

- [ ] **Step 1: Write failing stale-transition tests**

Create `src/data/admin/orders.test.ts`:

```ts
import { describe, expect, it, vi } from "vitest";

import { transitionOrderStatus } from "@/data/admin/orders";

describe("transitionOrderStatus", () => {
  it("updates only when the current status still matches", async () => {
    const updateMany = vi.fn().mockResolvedValue({ count: 1 });
    await expect(
      transitionOrderStatus(
        { orderId: 10, expectedStatus: "PENDING", nextStatus: "PAID" },
        { requireAdmin: async () => ({ id: 1 }), updateMany },
      ),
    ).resolves.toEqual({ status: "PAID" });
    expect(updateMany).toHaveBeenCalledWith({
      where: { id: 10, status: "PENDING" },
      data: { status: "PAID" },
    });
  });

  it("rejects paid to cancelled", async () => {
    await expect(
      transitionOrderStatus(
        { orderId: 10, expectedStatus: "PAID", nextStatus: "CANCELLED" },
        { requireAdmin: async () => ({ id: 1 }), updateMany: vi.fn() },
      ),
    ).rejects.toThrow("INVALID_ORDER_TRANSITION");
  });
});
```

- [ ] **Step 2: Run and verify failure**

Run:

```powershell
npm run test:run -- src/data/admin/orders.test.ts
```

Expected: FAIL.

- [ ] **Step 3: Implement order listing, detail DTO, and transition**

`src/data/admin/orders.ts` must:

- Call `requireAdmin()` for list, detail, and mutation functions.
- Search order ID, customer name, and email.
- Filter by validated status and date range.
- Paginate with deterministic `createdAt desc, id desc`.
- Return item names, quantities, price snapshots, and license-key presence
  without returning license-key text in the list DTO.
- Use `updateMany` with `expectedStatus` to prevent stale writes.
- Throw `STALE_ORDER_STATUS` when update count is zero.

- [ ] **Step 4: Implement the Server Action**

Create `src/app/admin/orders/actions.ts`:

```ts
"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { transitionOrderStatus } from "@/data/admin/orders";
import type { AdminActionState } from "@/features/admin/action-state";

const schema = z.object({
  orderId: z.coerce.number().int().positive(),
  expectedStatus: z.enum(["PENDING", "PAID", "COMPLETED", "CANCELLED"]),
  nextStatus: z.enum(["PENDING", "PAID", "COMPLETED", "CANCELLED"]),
});

export async function updateOrderStatusAction(
  _state: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { status: "error", message: "ข้อมูลสถานะไม่ถูกต้อง" };
  }
  try {
    await transitionOrderStatus(parsed.data);
    revalidatePath("/admin/orders");
    revalidatePath("/admin");
    return { status: "success", message: "อัปเดตสถานะแล้ว" };
  } catch {
    return {
      status: "error",
      message: "สถานะถูกเปลี่ยนไปแล้ว กรุณาโหลดข้อมูลล่าสุด",
    };
  }
}
```

- [ ] **Step 5: Build the order page and dialog**

Use `stitch_screens/admin/orders.html` and `orders.png`. Render filters and
pagination from URL state, a semantic table, an accessible detail dialog, and
only the next valid transition controls. Do not render a refund button.

- [ ] **Step 6: Run tests and build**

Run:

```powershell
npm run test:run -- src/data/admin/orders.test.ts src/components/admin/OrderStatusForm.test.tsx
npm run build
```

Expected: PASS.

- [ ] **Step 7: Commit order management**

```powershell
git add src/data/admin/orders.ts src/data/admin/orders.test.ts src/app/admin/orders src/components/admin/OrderDetailsDialog.tsx src/components/admin/OrderStatusForm.tsx src/components/admin/OrderStatusForm.test.tsx
git commit -m "feat: add admin order management"
```

---

### Task 9: Add Safe XAMPP Product Image Storage

**Files:**
- Create: `src/lib/product-upload.ts`
- Create: `src/lib/product-upload.test.ts`
- Create: `.env.example`
- Modify: `next.config.ts`
- Modify: `src/lib/product-assets.ts`
- Modify: `src/lib/__tests__/product-assets.test.ts`

- [ ] **Step 1: Write failing upload tests**

Create `src/lib/product-upload.test.ts`:

```ts
import { describe, expect, it } from "vitest";

import {
  isManagedProductImageUrl,
  validateProductImageInput,
} from "@/lib/product-upload";

describe("product upload", () => {
  it("rejects files larger than 5 MB", () => {
    expect(() =>
      validateProductImageInput({
        size: 5 * 1024 * 1024 + 1,
        type: "image/png",
      }),
    ).toThrow("IMAGE_TOO_LARGE");
  });

  it("recognizes only URLs under the configured base", () => {
    expect(
      isManagedProductImageUrl(
        "http://localhost/softkeystore-uploads/products/a.webp",
        "http://localhost/softkeystore-uploads/products",
      ),
    ).toBe(true);
    expect(
      isManagedProductImageUrl(
        "http://example.com/a.webp",
        "http://localhost/softkeystore-uploads/products",
      ),
    ).toBe(false);
  });
});
```

- [ ] **Step 2: Run and verify failure**

Run:

```powershell
npm run test:run -- src/lib/product-upload.test.ts
```

Expected: FAIL.

- [ ] **Step 3: Implement the upload service**

Create `src/lib/product-upload.ts` with:

```ts
import "server-only";

import { randomUUID } from "node:crypto";
import { mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

export function validateProductImageInput(file: {
  size: number;
  type: string;
}) {
  if (file.size > MAX_IMAGE_BYTES) throw new Error("IMAGE_TOO_LARGE");
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
    throw new Error("IMAGE_TYPE_NOT_ALLOWED");
  }
}

export function isManagedProductImageUrl(url: string, baseUrl: string) {
  return url.startsWith(`${baseUrl.replace(/\/$/, "")}/`);
}

export async function storeProductImage(file: File) {
  validateProductImageInput(file);
  const directory = process.env.PRODUCT_UPLOAD_DIR;
  const baseUrl = process.env.PRODUCT_UPLOAD_BASE_URL;
  if (!directory || !baseUrl) throw new Error("UPLOAD_CONFIG_MISSING");
  const filename = `${randomUUID()}.webp`;
  const outputPath = path.resolve(directory, filename);
  if (!outputPath.startsWith(path.resolve(directory) + path.sep)) {
    throw new Error("UPLOAD_PATH_INVALID");
  }
  const bytes = await sharp(Buffer.from(await file.arrayBuffer()))
    .rotate()
    .resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 86 })
    .toBuffer();
  await mkdir(directory, { recursive: true });
  await writeFile(outputPath, bytes);
  return {
    path: outputPath,
    url: `${baseUrl.replace(/\/$/, "")}/${filename}`,
  };
}

export async function removeManagedProductImage(url: string) {
  const directory = process.env.PRODUCT_UPLOAD_DIR;
  const baseUrl = process.env.PRODUCT_UPLOAD_BASE_URL;
  if (!directory || !baseUrl || !isManagedProductImageUrl(url, baseUrl)) return;
  const filename = new URL(url).pathname.split("/").pop();
  if (!filename) return;
  const target = path.resolve(directory, filename);
  if (!target.startsWith(path.resolve(directory) + path.sep)) return;
  await rm(target, { force: true });
}
```

- [ ] **Step 4: Configure environment and image loading**

Add to `.env.example`:

```dotenv
PRODUCT_UPLOAD_DIR=C:\xampp\htdocs\softkeystore-uploads\products
PRODUCT_UPLOAD_BASE_URL=http://localhost/softkeystore-uploads/products
```

Update `next.config.ts`:

```ts
const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        pathname: "/softkeystore-uploads/products/**",
      },
    ],
  },
};
```

Update `getProductAsset` to return absolute
`http://localhost/softkeystore-uploads/products/` image URLs unchanged before
checking legacy asset keys.

- [ ] **Step 5: Run tests**

Run:

```powershell
npm run test:run -- src/lib/product-upload.test.ts src/lib/__tests__/product-assets.test.ts
npm run build
```

Expected: PASS.

- [ ] **Step 6: Commit upload infrastructure**

```powershell
git add src/lib/product-upload.ts src/lib/product-upload.test.ts src/lib/product-assets.ts src/lib/__tests__/product-assets.test.ts .env.example next.config.ts
git commit -m "feat: add safe XAMPP product uploads"
```

---

### Task 10: Build Product List, Add, Edit, And Archive

**Files:**
- Create: `src/data/admin/products.ts`
- Create: `src/data/admin/products.test.ts`
- Create: `src/app/admin/products/actions.ts`
- Create: `src/app/admin/products/page.tsx`
- Create: `src/app/admin/products/new/page.tsx`
- Create: `src/app/admin/products/[id]/edit/page.tsx`
- Create: `src/components/admin/ProductForm.tsx`
- Create: `src/components/admin/ProductForm.test.tsx`

- [ ] **Step 1: Write failing product persistence tests**

Test these exact behaviors in `products.test.ts` with injected repositories:

```ts
it("archives instead of deleting", async () => {
  const update = vi.fn().mockResolvedValue({ id: 3 });
  await archiveProduct(3, {
    requireAdmin: async () => ({ id: 1 }),
    update,
    now: () => new Date("2026-06-13T12:00:00Z"),
  });
  expect(update).toHaveBeenCalledWith({
    where: { id: 3 },
    data: { archivedAt: new Date("2026-06-13T12:00:00Z") },
  });
});
```

Also test that a failed database update removes the newly uploaded image and
does not remove the old image.

- [ ] **Step 2: Run and verify failure**

Run:

```powershell
npm run test:run -- src/data/admin/products.test.ts
```

Expected: FAIL.

- [ ] **Step 3: Implement product DTOs and mutations**

`products.ts` must call `requireAdmin()` in every exported operation and expose:

```ts
export type ProductInput = {
  name: string;
  description: string;
  category: string;
  price: string;
  originalPrice: string | null;
  stock: number;
};

export type ProductListQuery = {
  page: number;
  pageSize: number;
  search: string;
  category: string | null;
  state: "active" | "archived" | "all";
  sort: "createdAt" | "name" | "price" | "stock";
  direction: "asc" | "desc";
};

export type ProductRowDto = ProductInput & {
  id: number;
  image: string | null;
  archivedAt: string | null;
  createdAt: string;
};

export type ProductListDto = {
  rows: ProductRowDto[];
  totalRows: number;
};

export type ProductFormDto = ProductRowDto;

export async function listAdminProducts(query: ProductListQuery): Promise<ProductListDto>;
export async function getAdminProduct(id: number): Promise<ProductFormDto | null>;
export async function createProduct(input: ProductInput, image: File | null): Promise<{ id: number }>;
export async function updateProduct(id: number, input: ProductInput, image: File | null): Promise<void>;
export async function archiveProduct(
  id: number,
  dependencies?: ProductMutationDependencies,
): Promise<void>;
```

Use a Zod product schema with non-empty name/description/category, nonnegative
stock, positive price, and `originalPrice >= price` when present.
`ProductMutationDependencies` contains `requireAdmin`, Prisma create/update,
the clock, `storeProductImage`, and `removeManagedProductImage`; production
defaults use the real modules while tests inject spies.

- [ ] **Step 4: Implement Server Actions**

`actions.ts` uses `useActionState` signatures, parses `FormData`, handles image
errors as field errors, and revalidates:

```ts
revalidatePath("/admin/products");
revalidatePath("/");
revalidatePath("/category/office");
revalidatePath("/category/windows");
```

After update, also call:

```ts
revalidatePath(`/product/${id}`);
```

- [ ] **Step 5: Build the three product screens**

Use:

- `stitch_screens/admin/products.html`
- `stitch_screens/admin/product-add.html`
- `stitch_screens/admin/product-edit.html`

The list includes search, category, active/archive filter, page size,
pagination, edit link, and archive confirmation. The form includes current
image preview, file selection, all approved fields, inline errors, pending
state, and cancel navigation.

- [ ] **Step 6: Run tests and build**

Run:

```powershell
npm run test:run -- src/data/admin/products.test.ts src/components/admin/ProductForm.test.tsx
npm run build
```

Expected: PASS.

- [ ] **Step 7: Commit product management**

```powershell
git add src/data/admin/products.ts src/data/admin/products.test.ts src/app/admin/products src/components/admin/ProductForm.tsx src/components/admin/ProductForm.test.tsx
git commit -m "feat: add admin product management"
```

---

### Task 11: Build Discount List, Add, Edit, Disable, And Archive

**Files:**
- Create: `src/data/admin/discounts.ts`
- Create: `src/data/admin/discounts.test.ts`
- Create: `src/app/admin/discounts/actions.ts`
- Create: `src/app/admin/discounts/page.tsx`
- Create: `src/app/admin/discounts/new/page.tsx`
- Create: `src/app/admin/discounts/[id]/edit/page.tsx`
- Create: `src/components/admin/DiscountForm.tsx`
- Create: `src/components/admin/DiscountForm.test.tsx`

- [ ] **Step 1: Write failing immutable-code and archive tests**

Create tests proving:

```ts
it("does not change a code after first usage", async () => {
  await expect(
    updateDiscount(
      5,
      {
        code: "NEWCODE",
        type: "PERCENT",
        value: "10.00",
        minimumOrderAmount: null,
        maximumDiscountAmount: "300.00",
        startsAt: new Date("2026-01-01T00:00:00Z"),
        endsAt: new Date("2026-12-31T23:59:59Z"),
        usageLimit: 100,
        perUserLimit: 1,
        isActive: true,
      },
      {
        requireAdmin: async () => ({ id: 1 }),
        find: async () => ({ code: "OLDCODE", usageCount: 1 }),
        update: vi.fn(),
      },
    ),
  ).rejects.toThrow("DISCOUNT_CODE_IMMUTABLE");
});
```

And that archive sets `archivedAt` plus `isActive: false` without deleting.

- [ ] **Step 2: Run and verify failure**

Run:

```powershell
npm run test:run -- src/data/admin/discounts.test.ts
```

Expected: FAIL.

- [ ] **Step 3: Implement discount data functions**

Expose:

```ts
export type DiscountInput = {
  code: string;
  type: "PERCENT" | "FIXED";
  value: string;
  minimumOrderAmount: string | null;
  maximumDiscountAmount: string | null;
  startsAt: Date;
  endsAt: Date;
  usageLimit: number | null;
  perUserLimit: number | null;
  isActive: boolean;
};

export type DiscountListQuery = {
  page: number;
  pageSize: number;
  search: string;
  state: "active" | "inactive" | "archived" | "all";
  sort: "createdAt" | "code" | "endsAt";
  direction: "asc" | "desc";
};

export type DiscountFormDto = DiscountInput & {
  id: number;
  archivedAt: string | null;
  usageCount: number;
};

export type DiscountListDto = {
  rows: DiscountFormDto[];
  totalRows: number;
};

export async function listDiscounts(query: DiscountListQuery): Promise<DiscountListDto>;
export async function getDiscount(id: number): Promise<DiscountFormDto | null>;
export async function createDiscount(input: DiscountInput): Promise<{ id: number }>;
export async function updateDiscount(
  id: number,
  input: DiscountInput,
  dependencies?: DiscountMutationDependencies,
): Promise<void>;
export async function setDiscountActive(id: number, active: boolean): Promise<void>;
export async function archiveDiscount(id: number): Promise<void>;
```

Every function calls `requireAdmin()`. Normalize code to uppercase and use
`discountInputSchema`. Detect duplicate code without echoing database errors.
`DiscountMutationDependencies` contains `requireAdmin`, find, create, update,
and clock functions so tests can inject deterministic behavior.

- [ ] **Step 4: Implement actions and forms**

Use `useActionState`, type-specific field visibility, native date-time inputs,
and server-rendered current values. The archive action confirms the discount
code and revalidates `/admin/discounts`, `/admin/discounts/history`, and cart
or checkout paths that display promotion state.

- [ ] **Step 5: Build list/add/edit screens from Stitch**

Use:

- `stitch_screens/admin/discounts.html`
- `stitch_screens/admin/discount-add.html`
- `stitch_screens/admin/discount-edit.html`

Do not add bulk import, multiple-code stacking, or deletion.

- [ ] **Step 6: Run tests and build**

Run:

```powershell
npm run test:run -- src/data/admin/discounts.test.ts src/components/admin/DiscountForm.test.tsx
npm run build
```

Expected: PASS.

- [ ] **Step 7: Commit discount management**

```powershell
git add -- src/data/admin/discounts.ts src/data/admin/discounts.test.ts src/app/admin/discounts/actions.ts src/app/admin/discounts/page.tsx src/app/admin/discounts/new 'src/app/admin/discounts/[id]/edit' src/components/admin/DiscountForm.tsx src/components/admin/DiscountForm.test.tsx
git commit -m "feat: add admin discount management"
```

---

### Task 12: Build Read-Only Discount Usage History

**Files:**
- Modify: `src/data/admin/discounts.ts`
- Modify: `src/data/admin/discounts.test.ts`
- Create: `src/app/admin/discounts/history/page.tsx`

- [ ] **Step 1: Write a failing history DTO test**

Add a test that expects:

```ts
expect(
  toDiscountUsageDto({
    id: 1,
    codeSnapshot: "WELCOME10",
    discountAmount: new Prisma.Decimal("100.00"),
    totalSnapshot: new Prisma.Decimal("900.00"),
    createdAt: new Date("2026-06-13T05:00:00Z"),
    user: { name: "Mint", email: "mint@example.com" },
    orderId: 44,
  }),
).toEqual({
  id: 1,
  code: "WELCOME10",
  memberName: "Mint",
  memberEmail: "mint@example.com",
  orderId: 44,
  discountAmount: "100.00",
  total: "900.00",
  createdAt: "2026-06-13T05:00:00.000Z",
});
```

- [ ] **Step 2: Run and verify failure**

Run:

```powershell
npm run test:run -- src/data/admin/discounts.test.ts
```

Expected: FAIL because history mapping is missing.

- [ ] **Step 3: Implement history queries**

Add `listDiscountUsage(query)` with code, member name/email, order ID, and date
filters. Return total usage count and summed discount amount as KPI values.
Never expose an edit or delete function for `DiscountUsage`.

Implement the mapper with:

```ts
export function toDiscountUsageDto(record: {
  id: number;
  codeSnapshot: string;
  discountAmount: Prisma.Decimal;
  totalSnapshot: Prisma.Decimal;
  createdAt: Date;
  user: { name: string; email: string };
  orderId: number;
}) {
  return {
    id: record.id,
    code: record.codeSnapshot,
    memberName: record.user.name,
    memberEmail: record.user.email,
    orderId: record.orderId,
    discountAmount: record.discountAmount.toFixed(2),
    total: record.totalSnapshot.toFixed(2),
    createdAt: record.createdAt.toISOString(),
  };
}
```

- [ ] **Step 4: Build the history page**

Use `stitch_screens/admin/discount-history.html` and `.png`. Render two KPI
cards, URL-backed filters, a read-only table, order links or dialog triggers,
and pagination.

- [ ] **Step 5: Run tests and build**

Run:

```powershell
npm run test:run -- src/data/admin/discounts.test.ts
npm run build
```

Expected: PASS.

- [ ] **Step 6: Commit discount history**

```powershell
git add src/data/admin/discounts.ts src/data/admin/discounts.test.ts src/app/admin/discounts/history/page.tsx
git commit -m "feat: add discount usage history"
```

---

### Task 13: Build The Strictly Read-Only Member Report And CSV Export

**Files:**
- Create: `src/data/admin/members.ts`
- Create: `src/data/admin/members.test.ts`
- Create: `src/app/admin/members/page.tsx`
- Create: `src/app/admin/members/export/route.ts`
- Create: `src/components/admin/MembersReport.tsx`
- Create: `src/components/admin/MembersReport.test.tsx`

- [ ] **Step 1: Write failing member aggregate and export tests**

Create `src/data/admin/members.test.ts`:

```ts
import { describe, expect, it } from "vitest";

import { memberRowsToCsv, summarizeMember } from "@/data/admin/members";

describe("read-only members", () => {
  it("includes only paid and completed orders", () => {
    expect(
      summarizeMember({
        id: 1,
        name: "Mint",
        email: "mint@example.com",
        createdAt: new Date("2026-01-15"),
        orders: [
          { status: "PAID", total: "1000.00" },
          { status: "COMPLETED", total: "500.00" },
          { status: "PENDING", total: "999.00" },
        ],
      }),
    ).toMatchObject({ orderCount: 2, totalSpend: "1500.00" });
  });

  it("escapes CSV cells and starts with a UTF-8 BOM", () => {
    const csv = memberRowsToCsv([
      {
        name: 'Mint, "MJ"',
        email: "mint@example.com",
        createdAt: "2026-01-15T00:00:00.000Z",
        orderCount: 2,
        totalSpend: "1500.00",
      },
    ]);
    expect(csv.startsWith("\uFEFF")).toBe(true);
    expect(csv).toContain('"Mint, ""MJ"""');
  });
});
```

Create `src/components/admin/MembersReport.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { MembersReport } from "@/components/admin/MembersReport";

describe("MembersReport", () => {
  it("contains reporting controls but no member mutation control", () => {
    render(
      <MembersReport
        filters={{ page: 1, pageSize: 10, search: "" }}
        result={{
          totalMembers: 1,
          totalRows: 1,
          rows: [
            {
              id: 1,
              name: "Mint",
              email: "mint@example.com",
              createdAt: "2026-01-15T00:00:00.000Z",
              orderCount: 2,
              totalSpend: "1500.00",
            },
          ],
        }}
      />,
    );
    expect(
      screen.getByRole("link", { name: "ส่งออกข้อมูล CSV" }),
    ).toBeInTheDocument();
    for (const forbidden of [
      "เพิ่มสมาชิก",
      "แก้ไข",
      "ระงับ",
      "เปิดใช้งาน",
      "เปลี่ยนสิทธิ์",
    ]) {
      expect(screen.queryByText(forbidden)).not.toBeInTheDocument();
    }
  });
});
```

- [ ] **Step 2: Run and verify failure**

Run:

```powershell
npm run test:run -- src/data/admin/members.test.ts src/components/admin/MembersReport.test.tsx
```

Expected: FAIL.

- [ ] **Step 3: Implement read-only member queries**

`members.ts` must export only:

```ts
import type { RawSearchParams } from "@/features/admin/query";

export type MemberListQuery = {
  page: number;
  pageSize: number;
  search: string;
  registeredFrom: Date | null;
  registeredTo: Date | null;
  minimumOrderCount: number | null;
  minimumSpend: string | null;
  sort: "createdAt" | "name" | "orderCount" | "totalSpend";
  direction: "asc" | "desc";
};

export type MemberAggregateRecord = {
  id: number;
  name: string;
  email: string;
  createdAt: Date;
  orders: Array<{ status: string; total: string }>;
};

export type MemberRowDto = {
  id: number;
  name: string;
  email: string;
  createdAt: string;
  orderCount: number;
  totalSpend: string;
};

export type MemberListDto = {
  totalMembers: number;
  totalRows: number;
  rows: MemberRowDto[];
};

export function parseMemberListQuery(raw: RawSearchParams): MemberListQuery;
export async function listMembers(query: MemberListQuery): Promise<MemberListDto>;
export async function exportMembers(query: MemberListQuery): Promise<string>;
export function summarizeMember(record: MemberAggregateRecord): MemberRowDto;
export function memberRowsToCsv(rows: MemberRowDto[]): string;
```

There must be no create, update, delete, suspend, reactivate, or role function.
Both table and export use the same filter builder and count only `PAID` and
`COMPLETED`.

Use parameterized `Prisma.sql` fragments and a whitelist for sortable columns;
do not concatenate raw search, date, count, spend, sort, or direction values
into SQL.

- [ ] **Step 4: Implement the authorized CSV Route Handler**

Create `src/app/admin/members/export/route.ts`:

```ts
import type { NextRequest } from "next/server";

import { AdminAccessError } from "@/data/admin/auth";
import {
  exportMembers,
  parseMemberListQuery,
} from "@/data/admin/members";

export async function GET(request: NextRequest) {
  try {
    const query = parseMemberListQuery(
      Object.fromEntries(request.nextUrl.searchParams.entries()),
    );
    const csv = await exportMembers(query);
    return new Response(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition":
          'attachment; filename="softkeystore-members.csv"',
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    if (error instanceof AdminAccessError) {
      return new Response("Unauthorized", {
        status: error.reason === "UNAUTHENTICATED" ? 401 : 403,
      });
    }
    throw error;
  }
}
```

- [ ] **Step 5: Build the member page from the latest screenshot**

Use the user-provided screenshot as the primary visual reference and
`stitch_screens/admin/members.html` only for shared shell details. Render:

- One total-member KPI card.
- Search by name/email.
- Registration date filter.
- Minimum order count and spend filters.
- CSV export link preserving current URL filters.
- Columns: name, email, registration date, order count, total spend.
- Page-size selector and pagination.

Render no row-action column and no member mutation control.
Implement that markup in `MembersReport.tsx`; `page.tsx` only awaits
`searchParams`, calls `listMembers`, and passes the DTO to the component.
Use this component contract:

```ts
export type MembersReportProps = {
  filters: Pick<MemberListQuery, "page" | "pageSize" | "search"> &
    Partial<MemberListQuery>;
  result: MemberListDto;
};
```

- [ ] **Step 6: Run tests and build**

Run:

```powershell
npm run test:run -- src/data/admin/members.test.ts src/components/admin/MembersReport.test.tsx
npm run build
```

Expected: PASS.

- [ ] **Step 7: Commit read-only members**

```powershell
git add src/data/admin/members.ts src/data/admin/members.test.ts src/app/admin/members src/components/admin/MembersReport.tsx src/components/admin/MembersReport.test.tsx
git commit -m "feat: add read-only member reporting"
```

---

### Task 14: Complete Responsive, Error, Empty, And Accessibility States

**Files:**
- Modify: `src/app/admin/admin.css`
- Modify: `src/app/admin/loading.tsx`
- Modify: `src/app/admin/error.tsx`
- Modify: `src/components/admin/AdminMobileNav.tsx`
- Modify: `src/components/admin/AdminConfirmDialog.tsx`
- Modify: all `src/app/admin/**/page.tsx`
- Create: `src/components/admin/admin-accessibility.test.tsx`

- [ ] **Step 1: Write failing accessibility/state tests**

Create `src/components/admin/admin-accessibility.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { AdminConfirmDialog } from "@/components/admin/AdminConfirmDialog";
import { AdminDataTable } from "@/components/admin/AdminDataTable";

function ArchiveHarness() {
  return (
    <AdminConfirmDialog
      confirmLabel="ยืนยันเก็บถาวร"
      description="สินค้าจะไม่แสดงในหน้าร้าน"
      onConfirm={vi.fn()}
      title="เก็บสินค้า Office ถาวร"
      triggerLabel="เก็บสินค้า Office ถาวร"
    />
  );
}

describe("admin accessibility", () => {
it("restores focus after cancelling a confirmation dialog", async () => {
  const user = userEvent.setup();
  render(<ArchiveHarness />);
  const trigger = screen.getByRole("button", {
    name: "เก็บสินค้า Office ถาวร",
  });
  await user.click(trigger);
  await user.click(screen.getByRole("button", { name: "ยกเลิก" }));
  expect(trigger).toHaveFocus();
});

it("exposes table overflow inside the table region, not the page", () => {
  render(
    <AdminDataTable label="ตารางข้อมูล">
      <tbody>
        <tr>
          <td>ข้อมูล</td>
        </tr>
      </tbody>
    </AdminDataTable>,
  );
  expect(
    screen.getByRole("region", { name: "ตารางข้อมูล" }),
  ).toHaveClass("admin-table-scroll");
});
});
```

- [ ] **Step 2: Run and verify failure**

Run:

```powershell
npm run test:run -- src/components/admin/admin-accessibility.test.tsx
```

Expected: FAIL until focus restoration and table-region semantics are added.

- [ ] **Step 3: Implement the responsive contracts**

In `admin.css` add exact breakpoints:

- `>= 1280px`: 264px sidebar, four KPI columns.
- `768px-1279px`: 88px compact sidebar or drawer trigger, two KPI columns.
- `< 768px`: drawer navigation, one KPI column, stacked filters, table-local
  horizontal scroll.

Set:

```css
.admin-shell {
  min-width: 0;
  min-height: 100vh;
  background: #f7f9fc;
}

.admin-table-scroll {
  max-width: 100%;
  overflow-x: auto;
  overscroll-behavior-inline: contain;
}

@media (max-width: 767px) {
  .admin-sidebar {
    display: none;
  }

  .admin-kpi-grid {
    grid-template-columns: 1fr;
  }

  .admin-filters {
    align-items: stretch;
    flex-direction: column;
  }
}
```

- [ ] **Step 4: Complete state coverage**

Each page must render:

- Honest no-data empty state.
- Filtered-empty state with reset link.
- Shared loading skeleton.
- Route error fallback.
- Mutation success/error live region.

Use Thai recovery copy and never expose `error.message` from server failures.

- [ ] **Step 5: Run component tests, lint, and build**

Run:

```powershell
npm run test:run -- src/components/admin
npm run lint
npm run build
```

Expected: PASS.

- [ ] **Step 6: Commit responsive and accessibility completion**

```powershell
git add src/app/admin src/components/admin
git commit -m "fix: complete admin responsive and accessible states"
```

---

### Task 15: Run Full Verification And Visual Comparison

**Files:**
- Create: `scripts/create-visual-comparison.mjs`
- Create: `docs/design-qa/admin-dashboard.md`
- Modify: any admin file with a verified visual or behavioral defect

- [ ] **Step 1: Create the comparison helper**

Create `scripts/create-visual-comparison.mjs`:

```js
import { mkdir } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const [referencePath, implementationPath, outputPath] = process.argv.slice(2);
if (!referencePath || !implementationPath || !outputPath) {
  throw new Error(
    "Usage: node scripts/create-visual-comparison.mjs reference.png implementation.png output.png",
  );
}

const [reference, implementation] = await Promise.all([
  sharp(referencePath).png().toBuffer({ resolveWithObject: true }),
  sharp(implementationPath).png().toBuffer({ resolveWithObject: true }),
]);
const width = Math.max(reference.info.width, implementation.info.width);
const height = Math.max(reference.info.height, implementation.info.height);
await mkdir(path.dirname(outputPath), { recursive: true });
await sharp({
  create: {
    width: width * 2,
    height,
    channels: 4,
    background: "#ffffff",
  },
})
  .composite([
    { input: reference.data, left: 0, top: 0 },
    { input: implementation.data, left: width, top: 0 },
  ])
  .png()
  .toFile(outputPath);
```

- [ ] **Step 2: Run all automated engineering gates**

Run:

```powershell
npx prisma validate
npx prisma generate
npm run test:run
npm run lint
npm run build
```

Expected: every command exits 0. Fix failures before opening the Browser.

- [ ] **Step 3: Start the local app and verify XAMPP**

Confirm Apache is serving:

```powershell
Invoke-WebRequest -UseBasicParsing 'http://localhost/softkeystore-uploads/products/' -TimeoutSec 5
```

A 200 or directory-listing-disabled 403 proves Apache reached the configured
path; connection refusal means XAMPP must be started before upload verification.

Start Next.js:

```powershell
npm run dev
```

Keep the process running for Browser verification.

- [ ] **Step 4: Verify complete flows in the Codex in-app Browser**

Use the in-app Browser, not Playwright CLI, because it is the user's selected
browser. Verify:

1. `admin@softkeystore.com` reaches `/admin`.
2. `customer@example.com` is redirected away from `/admin`.
3. Product create, image load from XAMPP, edit, image replacement, and archive.
4. Discount create, edit, disable, archive, and immutable used code.
5. PENDING -> PAID -> COMPLETED and PENDING -> CANCELLED order transitions.
6. Dashboard totals match paid/completed orders.
7. Discount history shows the correct snapshots.
8. Members support only view, filter, paginate, and CSV export.
9. Direct URLs and repeated action submissions do not bypass authorization.
10. Mobile drawer and forms work at 390px.

- [ ] **Step 5: Capture and compare every screen**

Preserve the user member reference in the untracked QA workspace:

```powershell
New-Item -ItemType Directory -Force '.superpowers\qa\admin' | Out-Null
Copy-Item -LiteralPath 'C:\Users\DeLL\AppData\Local\Temp\codex-clipboard-24fb5653-c909-4f11-b995-eafd5d2c856f.png' -Destination '.superpowers\qa\admin\members-reference.png'
```

Capture implementation screenshots at the reference viewport for:

- Dashboard vs `stitch_screens/admin/finance.png`
- Orders vs `stitch_screens/admin/orders.png`
- Products vs `stitch_screens/admin/products.png`
- Product add vs `stitch_screens/admin/product-add.png`
- Product edit vs `stitch_screens/admin/product-edit.png`
- Discounts vs `stitch_screens/admin/discounts.png`
- Discount add vs `stitch_screens/admin/discount-add.png`
- Discount edit vs `stitch_screens/admin/discount-edit.png`
- Discount history vs `stitch_screens/admin/discount-history.png`
- Members vs the user-provided read-only screenshot

For the dashboard comparison, run:

```powershell
node scripts/create-visual-comparison.mjs stitch_screens/admin/finance.png .superpowers/qa/admin/dashboard-implementation.png .superpowers/qa/admin/dashboard-comparison.png
```

Repeat the same command with the matching filenames listed above for the other
nine surfaces. Open each comparison image and fix visible P0-P2 differences in layout,
spacing, typography, colors, borders, radii, image sizing, and table density.
Repeat the comparison after fixes.

- [ ] **Step 6: Record the QA result**

Create `docs/design-qa/admin-dashboard.md`:

```markdown
# SoftKeyStore Admin Dashboard QA

## Automated Gates

- Prisma validate/generate: passed
- Vitest: passed
- ESLint: passed
- Production build: passed

## Browser Flows

- Role-aware login and authorization: passed
- Dashboard and orders: passed
- Product CRUD and XAMPP upload: passed
- Discount CRUD and history: passed
- Read-only members and CSV: passed

## Visual Comparisons

- 1440px desktop references: passed
- 1024px tablet: passed
- 768px compact layout: passed
- 390px mobile: passed

final result: passed
```

Do not write `passed` for any line until its command or Browser flow has
actually passed.

- [ ] **Step 7: Re-run final verification after visual fixes**

Run:

```powershell
npx prisma validate
npm run test:run
npm run lint
npm run build
git diff --check
git status --short
```

Expected: all checks pass. `git status` lists only intended admin files plus
any pre-existing untracked `stitch_screens/admin/`.

- [ ] **Step 8: Commit final QA and verified fixes**

Stage exact intended files only:

```powershell
git add scripts/create-visual-comparison.mjs docs/design-qa/admin-dashboard.md src/app/admin src/components/admin src/data/admin
git commit -m "test: verify SoftKeyStore admin dashboard"
```

Do not add `stitch_screens/admin/` unless separately approved.

---

## Completion Contract

Implementation is complete only when:

- All ten approved admin surfaces are present.
- Product, discount, order, dashboard, history, and member data come from
  Prisma.
- Every admin query, action, and export route re-verifies `ADMIN` against the
  database.
- The member page contains no mutation path.
- Money uses Decimal storage and Thai-baht presentation.
- Product images upload to and load from the configured XAMPP directory.
- No hard-delete or refund operation exists.
- Automated gates pass.
- Browser flows pass.
- Side-by-side visual comparisons pass.
- `docs/design-qa/admin-dashboard.md` ends with `final result: passed`.
