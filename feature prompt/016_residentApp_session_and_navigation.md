# ResidentApp — Session Store, Root Layout & Bottom Navbar

## Overview
Three small pieces of infrastructure shared by every screen:
1. In-memory session store (`services/session.js`).
2. Root layout that wraps the Expo Router stack and mounts the `SafetyConfirmGate`.
3. Bottom navbar shown on all post-login screens.

## 1. Session store
- **File:** `services/session.js`.
- API:
  ```js
  setSession(data)    // merges patch into the singleton
  getSession()        // returns the current session or null
  clearSession()      // wipes (used by Logout)
  ```
- **Shape:** `{ accountId, residentId, username, role, isVerified, firstName, lastName, barangayName, ... }` — populated from `/auth/login` response.
- **Lifetime:** module-level variable, lost on app kill. No persistence. Project policy forbids Redux/Context — keep it that way.

## 2. Root layout
- **File:** `app/_layout.jsx`.
- Wraps `<Stack screenOptions={{ headerShown: false }} />` (Expo Router file-based stack).
- Mounts `<SafetyConfirmGate />` at the root so the safe-confirm modal can overlay any screen.

## 3. Bottom navbar
- **File:** `components/navbar.jsx`.
- Three tabs:
  - Locator (`assets/icons/location-normal.png`) → `/locator`
  - SOS (`assets/icons/sos-active.png`, center, larger) → `/home`
  - Evacuation (`assets/icons/house-normal.png`) → `/evacuation`
- Background: `assets/img/NAVBAR.png`.
- Highlights the active tab based on `usePathname()`.
- Hidden on all auth/registration screens (do not render in `index`, `householdRole`, `signup`, `register`, `otp`, `pending-verification`, etc.).

## Header
- **File:** `components/header.jsx`.
- Shown on `/home`, `/locator`, `/evacuation`, `/profile`.
- Left: hamburger / menu, right: profile avatar tap → `/profile`.

## Acceptance criteria
- The session store is the ONLY source of truth for the logged-in user's id / role / barangay.
- The navbar is never visible during registration or login.
- `SafetyConfirmGate` is mounted exactly once, in `_layout.jsx`.
- All post-login navigations use `router.replace` (not `push`) when moving between top-level tabs to keep the back-stack clean.
