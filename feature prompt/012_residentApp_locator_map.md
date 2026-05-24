# ResidentApp — Barangay Locator Map

## Overview
Map screen reachable from the bottom navbar. Shows the user's current location and a list of nearby barangay halls / response units so they know who covers their area.

## User flow
1. Tap "Locator" tab in `<BottomNavbar />`.
2. Screen mounts with full-screen `MapView`:
   - Centers on the user's GPS position (request via `expo-location`).
   - Drops markers for every barangay unit / response unit returned by the backend.
   - Tapping a marker opens a callout: unit name, barangay, contact number, distance.
3. Bottom sheet (collapsible) lists the same units as scrollable rows, sorted by distance.

## Implementation
- **File:** `app/locator.jsx`, stylesheet `styles/locator.js`.
- **Deps:** `react-native-maps`, `expo-location`, `services/api.js`.
- **API:** `GET /api/barangay-units` and/or `GET /api/locations` (use whichever returns lat/lng). If a curated "locator" endpoint doesn't exist yet, compose client-side.
- **Distance:** Haversine helper, formatted as `0.4 km` / `1.2 km`.
- **Performance:** debounce marker re-render on region change; cap to nearest 30 units.

## Acceptance criteria
- If location permission is denied, the map centers on Naga City Hall (`13.6234, 123.1944`) and shows all units city-wide.
- Markers must use a distinct icon for the user's home barangay vs. others.
- Tapping a phone number in the callout opens the dialer (`Linking.openURL('tel:...')`).
