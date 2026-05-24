# adminApp — Super Admin Login

## Overview
Single-page login form that authenticates against the shared backend and gates entry to the console. Only accounts with `role === 'super_admin'` are allowed; any other role is rejected client-side with a clear error.

## User flow
1. User opens the console → `RequireAuth` redirects unauthenticated visitors to `/login`.
2. Login page shows:
   - Naga Rescue logo + "Super Admin Console" tagline.
   - Username + password inputs.
   - "Sign in" button (disabled while busy).
   - Helper text: "Seeded default: `admin` / `admin12345`".
3. On submit:
   - `Auth.login(username.trim(), password)` → `POST /api/auth/login`.
   - If `data.role !== 'super_admin'` → throw "This account is not a super admin."
   - On success → `setToken(data.token)`, persist user JSON to `localStorage('naga_admin_user')`, navigate to `/` (Dashboard).
4. On error → red banner above the button with the server's `error` field.

## Implementation
- **Files:**
  - `src/pages/Login.jsx` — form + submit handler.
  - `src/auth/AuthContext.jsx` — `login`, `logout`, `user`, `ready` state.
  - `src/auth/RequireAuth.jsx` — route guard.
  - `src/api/client.js` — `setToken`, `getToken`, axios instance.
  - `src/api/endpoints.js` → `Auth.login`.
- **Deps:** `react-router-dom`, `lucide-react` (ShieldCheck icon).
- **Storage keys:**
  - Token: `localStorage('naga_admin_token')`.
  - User profile: `localStorage('naga_admin_user')`.

## Backend contract
- `POST /api/auth/login` body `{ username, password }`.
- Returns `{ success, data: { token, accountId, residentId, username, role, isVerified, firstName, lastName, fullName, ... } }`.

## Acceptance criteria
- A barangay_employee / resident / cdrrmo account is rejected with the role-mismatch message, NOT logged in.
- The token is sent on every subsequent request via the axios interceptor (`Authorization: Bearer <token>`).
- A 401 from any later request clears the token and redirects to `/login` automatically.
- Pressing back after login does not return to `/login` (use `navigate('/', { replace: true })`).
- A logged-in user landing on `/login` is auto-redirected to `/` via the `useEffect` in `Login.jsx`.
