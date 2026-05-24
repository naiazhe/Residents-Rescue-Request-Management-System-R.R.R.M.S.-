# ResidentApp — Home Screen & SOS Trigger

## Overview
Main post-login screen. Hosts the SOS panic button, a small map preview of the user's area, and the bottom navbar. SOS uses a "tap counter" pattern: each tap escalates the urgency level (1 → 2 → 3) within a 2-second window, then fires.

## User flow
1. Reached via `router.replace('/home')` after login (only if `isVerified === true`).
2. Layout:
   - Top: `<Header />` with greeting & menu.
   - Middle: large round SOS button on `LANDING.jpg`, with current urgency level badge.
   - Lower: `MapView` showing user pin + assigned barangay unit.
   - Bottom: `<BottomNavbar />` — three tabs: Locator | SOS (active) | Evacuation.
3. SOS interaction (`TAP_WINDOW_MS = 2000`):
   - Tap 1 → urgency 1, start countdown.
   - Tap 2 within 2 s → urgency 2.
   - Tap 3 within 2 s → urgency 3.
   - When countdown elapses without another tap, fire `sendSOS({ residentId, urgencyLevel, latitude, longitude })`.
4. Before sending:
   - Pull adaptive location via `services/location.js → fetchAdaptiveLocation()`.
   - Pull household profile + members via `getResidentProfile(residentId)` and `getHouseholdMembers(householdId)` (used to confirm who to include).
5. Confirmation modal lists members marked "selected" so the user can deselect anyone who isn't with them. Tap Confirm → POST.
6. On 403 ("pending verification") → kick user to `/pending-verification`.
7. On 201 → toast "Help is on the way" + dispatch summary (target unit name).

## Implementation
- **File:** `app/home.jsx`, stylesheet `styles/home.js`.
- **Deps:** `react-native-maps`, `expo-router`, `services/api.js (sendSOS, getResidentProfile, getHouseholdMembers)`, `services/location.js`, `services/session.js`.
- **Animations:** `Animated.timing` for the SOS pulse ring; reset on countdown completion.
- **Helpers in file:** `calcAge(birthdate)`, `buildMemberRow(m)`.

## Backend contract
- `POST /sos/send` body: `{ residentId, urgencyLevel: 1|2|3, latitude, longitude }`.
- Returns SOS row + `barangay_name`, `barangay_unit_id`, `unit_name` (the auto-assigned responder unit).

## Acceptance criteria
- A single accidental tap can be cancelled if no follow-up tap arrives within 2 s — actually it should still escalate to level-1; reconsider if PM requires explicit confirmation before firing.
- The screen handles the `SafetyConfirmGate` modal automatically (mounted in `_layout.jsx`); do not re-implement safe-confirm here.
- Location permission denial blocks SOS with a clear error.
- After a successful SOS, the button enters a 30-second cooldown to prevent duplicates.
