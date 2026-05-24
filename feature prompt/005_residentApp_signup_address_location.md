# ResidentApp — Signup: Address + GPS Location

## Overview
Collects the resident's address fields that the backend uses to create the `location` and `household` rows. Captures latitude/longitude via `expo-location` so dispatch can find the address quickly.

## User flow
1. Reached from `/signup` (Household Head / Tenant / Boarder only).
2. Form fields:
   - Province (default: "Camarines Sur", editable)
   - City (default: "Naga City", editable)
   - Barangay (dropdown populated from backend or text)
   - Street name (required)
3. "Use my current location" button:
   - Request `expo-location` foreground permission.
   - Call `getCurrentPositionAsync({ accuracy: High })`.
   - Optionally reverse-geocode via `Location.reverseGeocodeAsync` to auto-fill barangay/street.
   - Store `latitude` and `longitude` in form state.
4. On Continue → `/uploadDocuments`.

## Implementation
- **File:** `app/signupAddress.jsx`, stylesheet `styles/signupAddress.js` (or reuse `styles/signup.js`).
- **Deps:** `expo-location`, `expo-router`.
- **Helper:** `services/location.js` exposes `fetchAdaptiveLocation()` and `reverseGeocode(lat, lon)` — reuse those instead of calling `Location.*` directly. Throws `LocationPermissionError` if denied.
- **Coordinate storage:** must be passed through to `/register` so they reach `/auth/register` payload as `latitude` / `longitude`.

## Validation
- Street and barangay required.
- If GPS pull fails or permission denied, show a non-blocking warning ("Saving without coordinates") but allow Continue.

## Acceptance criteria
- Address fields persist when navigating back from the next screen.
- Latitude/longitude are numeric (or null) — never strings.
- Reverse-geocoded values must be confirmable/editable, not silently overwritten.

## Out of scope
- Address autocomplete via Google Places (not currently used).
