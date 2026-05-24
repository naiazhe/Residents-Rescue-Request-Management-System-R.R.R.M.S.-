# ResidentApp — OTP Verification

## Overview
6-digit one-time-password screen shown immediately after `POST /auth/register` returns 201. Currently mocked (any 6 digits accepted) pending SMS provider integration.

## User flow
1. Reached via `router.replace('/otp')` from `/register` (back navigation MUST NOT return to register).
2. Screen shows:
   - Header with phone number masked (e.g., "Code sent to 0917•••4567").
   - 6 separate text inputs, auto-advance to next on each digit, auto-backspace to previous on delete.
   - Resend link with 60-second cooldown timer.
   - "Verify" button enabled only when all 6 boxes have digits.
3. On Verify:
   - Currently: accept any 6-digit code, mark `isVerified` on session locally as needed, then `router.replace('/pending-verification')`.
   - When SMS is wired: `POST /auth/verify-otp { accountId, code }`.

## Implementation
- **File:** `app/otp.jsx`, stylesheet `styles/otp.js`.
- **Deps:** `expo-router`, `react-native` (`TextInput` refs array).
- **Auto-advance pattern:** maintain an array of `TextInput` refs. `onChangeText(i, v)` writes one digit, then `refs[i+1]?.focus()`.

## Backend gap
- No `/api/auth/send-otp` or `/api/auth/verify-otp` endpoints exist. Add them when an SMS provider (e.g., Semaphore PH, Globe Labs, Twilio) is chosen. Schema additions:
  - `otp_code` table or transient field on `account` with `code_hash`, `expires_at`, `attempts`.
  - Rate-limit middleware to prevent code-brute-force.

## Acceptance criteria
- Pressing back from OTP must NOT return to `/register` (use `router.replace`).
- Verify button is disabled until all 6 digits are present.
- Resend is disabled during the 60s cooldown and re-armed afterward.
- After success, navigation lands on `/pending-verification` — never `/home` directly, because the BDRRMC must still approve the account.
