# ResidentApp — Login & Session Bootstrap

## Overview
The entry screen (`app/index.jsx`) lets a resident sign in with username + password, or open a modal that starts the registration flow. On successful login it bootstraps the in-memory session, registers an Expo push token, and routes the user based on their verification state.

## User flow
1. User opens the app → lands on Login screen with a `LANDING.jpg` background, logo, username field, password field (with eye toggle), and "Sign In" button.
2. Below the form: a "Don't have an account? **Register**" link that opens a role-selection modal (Household Head / Tenant-Renter / Boarder / Household Member). Choosing a role navigates to `/householdRole` with the role as a route param.
3. On Sign In tap:
   - Validate both fields are non-empty.
   - Show full-screen `ActivityIndicator`.
   - POST `username, password` to `/api/auth/login`.
   - On 401 → display "Invalid username or password" inline.
   - On success → call `setSession({ accountId, residentId, username, role, isVerified, ... })`, then `registerPushToken(accountId)`.
   - Route: if `isVerified === true` → `router.replace('/home')`, else `router.replace('/pending-verification')`.

## Implementation
- **File:** `app/index.jsx`, stylesheet `styles/index.js`.
- **Deps:** `expo-router`, `expo-notifications`, `react-native` core, `services/api.js`, `services/session.js`.
- **API:** `loginUser(username, password)` → `POST /auth/login` returns `{ token, accountId, residentId, username, role, isVerified, fullName, barangayName, ... }`. Use `data.success` envelope (auto-unwrapped by `request()` in `services/api.js`).
- **Push token registration:** request notification permission, get Expo push token via `Notifications.getExpoPushTokenAsync()`, then `savePushToken(accountId, token)` → `PATCH /accounts/:id/push-token` body `{ expo_push_token }`. Silently swallow failures (don't block login).
- **Session storage:** the in-memory store in `services/session.js` (`setSession`, `getSession`, `clearSession`). No AsyncStorage — session dies when app is killed; this is intentional per project pattern (no global state).

## Validation rules
- Trim both fields before submit.
- Disable Sign In button while `isLoading === true`.
- Clear previous error string each new submit.

## Acceptance criteria
- Wrong credentials show a red inline message and never navigate.
- Correct credentials with `isVerified=false` always land on `/pending-verification`, not `/home`.
- Push token request never blocks login if the user denies permission.
- Back-navigating to `/` after login is impossible because the post-login route uses `router.replace`.

## Out of scope
- "Forgot password" flow (super admin handles via `Admin.resetPassword`).
- Persistent login across app restarts (intentional).
