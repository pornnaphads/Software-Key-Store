# Password Reset OTP

## Goal

Replace the mock localStorage password reset with a secure, database-backed
email OTP flow that updates the real MySQL user account.

## Current Problem

The current `/forgot-password` page reads `localStorage.mock_users`. Registered
accounts are stored in MySQL through Prisma, so real users are never found by
the mock page. User passwords in MySQL are bcrypt hashes such as `$2b$12$...`;
this is correct and must remain unchanged because plaintext passwords must
never be stored.

## User Flow

1. The user submits the email used during registration.
2. The server normalizes the email and looks up the real `User` row.
3. If the account supports password login, the server generates a six-digit
   OTP and sends it through the Brevo transactional email API.
4. The user enters the OTP.
5. After successful verification, the user enters and confirms a new password.
6. The server hashes the password with bcrypt and updates `User.password`.
7. The reset request is consumed and the user returns to login.

Every email request returns the same public message whether or not an account
exists. This prevents account enumeration.

## Data Model

Add `PasswordResetOtp` with:

- A unique request identifier safe to return to the browser.
- The normalized email and optional related user.
- A SHA-256 hash of the OTP, never the plaintext OTP.
- Expiration time, defaulting to ten minutes after issue.
- Attempt count and a maximum of five failed verification attempts.
- Last-sent timestamp enforcing a sixty-second resend cooldown.
- Verification and consumption timestamps.
- Created and updated timestamps.

Creating a new request invalidates previous active requests for the same user.
Expired, locked, verified, or consumed requests cannot be reused.

## Server Boundaries

- Use Server Actions for request, verification, resend, and reset mutations.
- Validate all inputs with Zod on the server.
- Generate OTPs with `crypto.randomInt`.
- Hash OTPs with SHA-256 and compare with timing-safe equality.
- Hash new passwords with bcrypt cost 12.
- Call Brevo from a server-only email module using `BREVO_API_KEY`,
  `BREVO_SENDER_EMAIL`, and `BREVO_SENDER_NAME`.
- Never expose secrets, OTP values, password hashes, or Brevo responses to the
  browser.

## Security

- OTP: six digits, ten-minute lifetime, five verification attempts.
- Resend cooldown: sixty seconds.
- Password: 8–128 characters and must match confirmation.
- Generic response for unknown email addresses.
- No email is sent for accounts created only through Google with an empty
  password; the public response remains generic.
- Reset requests are one-time use.
- Brevo configuration failures return a recoverable generic error without
  changing the user's password.

## Interface

Keep the existing forgot-password visual shell but replace local state logic
with three server-backed steps:

1. Email form.
2. OTP verification form with resend control.
3. New password and confirmation form.

Pending, validation, expired, locked, and success states are announced
accessibly. The browser stores only the opaque reset request ID and current
step, never the OTP hash or account identity.

## Testing

- Unit-test OTP generation, hashing, expiration, attempt limits, and cooldown.
- Test Server Actions using injected database/email dependencies where
  practical.
- Test the three-step UI behavior and generic email response.
- Run Prisma migration, focused tests, full tests, ESLint, and production build.
- Verify the page in the browser without sending to an unintended recipient.
