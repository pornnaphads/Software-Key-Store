# Password Reset OTP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the mock forgot-password page with a secure MySQL-backed OTP reset flow delivered through Brevo.

**Architecture:** A focused server-only OTP module owns generation, hashing, expiry, cooldown, and comparison. Prisma stores one-time reset requests, Server Actions coordinate user lookup and password mutation, and the client page renders a three-step form without receiving secrets.

**Tech Stack:** Next.js 16 Server Actions, React 19, Prisma 7, MariaDB/MySQL, Brevo HTTP API, bcryptjs, Zod, Vitest

---

### Task 1: OTP security primitives

**Files:**
- Create: `src/lib/password-reset.ts`
- Create: `src/lib/password-reset.test.ts`

- [ ] Write tests for six-digit generation, SHA-256 hashing, timing-safe matching,
  ten-minute expiry, sixty-second cooldown, and five-attempt locking.
- [ ] Run `npm test -- --run src/lib/password-reset.test.ts` and verify RED.
- [ ] Implement constants and pure helper functions with Node `crypto`.
- [ ] Re-run the focused test and verify GREEN.

### Task 2: Prisma reset request model

**Files:**
- Modify: `prisma/schema.prisma`
- Create: `prisma/migrations/20260613_password_reset_otp/migration.sql`

- [ ] Add a failing schema assertion test or Prisma validation command that
  demonstrates the model is absent.
- [ ] Add `PasswordResetOtp` and its optional `User` relation with indexes for
  email, expiry, and active request lookup.
- [ ] Run `npx prisma validate` and `npx prisma generate`.
- [ ] Apply the migration with `npx prisma migrate deploy`.

### Task 3: Brevo email boundary

**Files:**
- Create: `src/lib/email/brevo.ts`
- Create: `src/lib/email/brevo.test.ts`

- [ ] Test request URL, required `api-key` header, verified sender fields, OTP
  subject/body, and safe failure behavior using an injected fetch function.
- [ ] Run the focused test and verify RED.
- [ ] Implement a server-only `sendPasswordResetOtp` using the Brevo v3 HTTP API.
- [ ] Re-run the focused test and verify GREEN.

### Task 4: Password reset service and actions

**Files:**
- Create: `src/lib/password-reset-service.ts`
- Create: `src/lib/password-reset-service.test.ts`
- Create: `src/app/(auth)/forgot-password/actions.ts`

- [ ] Write failing tests for known user request, unknown email generic response,
  OTP verification, invalid attempt counting, expiry, resend cooldown, one-time
  reset, and bcrypt password replacement.
- [ ] Implement an injectable service coordinating Prisma and email delivery.
- [ ] Add Zod-validated Server Actions returning serializable action state.
- [ ] Run service/action tests and verify GREEN.

### Task 5: Three-step forgot-password UI

**Files:**
- Modify: `src/app/(auth)/forgot-password/page.tsx`
- Modify: `src/app/(auth)/forgot-password/forgot-password.module.css`
- Create: `src/app/(auth)/forgot-password/page.test.tsx`

- [ ] Write a failing UI test proving the page no longer reads `localStorage`
  and advances through email, OTP, and password steps from action states.
- [ ] Replace mock handlers with `useActionState` forms for request, verify,
  resend, and reset.
- [ ] Keep accessible labels, pending states, generic account messaging, and
  login redirect after success.
- [ ] Run focused UI tests and verify GREEN.

### Task 6: Configuration and end-to-end verification

**Files:**
- Modify: `.env.example`
- Verify: `.env.local`

- [ ] Document `BREVO_API_KEY`, `BREVO_SENDER_EMAIL`, and
  `BREVO_SENDER_NAME` without adding secrets.
- [ ] Run focused tests, full tests, ESLint, and `npm run build`.
- [ ] Verify database migration and browser UI at `/forgot-password`.
- [ ] Perform one authorized Brevo delivery test to an existing account email,
  verify the OTP, reset the password, and verify login with the new password.
- [ ] Review `git diff --check` and keep unrelated working-tree changes intact.
