# ResidentApp — Pending Verification Holding Screen

## Overview
Holding screen shown when a resident logs in (or completes OTP) but `is_verified === false`. The super admin must approve the account from the admin console before SOS and other authenticated features unlock. The screen polls the backend so the user automatically moves to `/home` the moment the admin approves them.

## User flow
1. Reached via `router.replace('/pending-verification')` from:
   - `/index.jsx` after login if `isVerified === false`.
   - `/otp.jsx` after successful OTP.
2. Screen content:
   - Centered illustration / clock icon.
   - Heading: "Account pending approval".
   - Body: "Your details are being reviewed by the BDRRMC. You'll be notified when your account is approved."
   - "Sign out" link at the bottom.
3. Background:
   - Poll `getAccountStatus(accountId)` → `GET /accounts/:id` every 15 seconds.
   - When `is_verified === true`, update session (`setSession({ isVerified: true })`) and `router.replace('/home')`.

## Implementation
- **File:** `app/pending-verification.jsx`, stylesheet `styles/pendingVerification.js`.
- **Deps:** `services/api.js → getAccountStatus`, `services/session.js`, `expo-router`.
- **Polling:** `setInterval` cleared in the `useEffect` cleanup. Use a ref to skip overlapping requests.
- **Sign out:** `clearSession()` then `router.replace('/')`.

## Edge cases
- If `is_active === false` (admin rejected), show a hard-stop screen "Your account was rejected. Contact your barangay." with sign-out only — never auto-advance.
- Network failures during poll should be silent; the next tick retries.

## Acceptance criteria
- The user cannot navigate to `/home` while `is_verified === false`.
- Polling pauses while the app is backgrounded (use `AppState` listener) to save battery.
- Approval by the admin must let the user in within ≤ 15 seconds.
