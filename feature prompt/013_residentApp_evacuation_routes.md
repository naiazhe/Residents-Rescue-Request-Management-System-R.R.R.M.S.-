# ResidentApp — Evacuation Routes & Centers

## Overview
Third tab on the bottom navbar. Shows the recommended evacuation center for the user's barangay and an outlined route from their current location to that center.

## User flow
1. Tap "Evacuation" tab.
2. Screen shows:
   - Header: "Recommended evacuation center".
   - Card with the assigned center name, capacity, current occupancy, and address.
   - Map below with a polyline from user pin → center pin.
   - "Open in Google Maps" button (Linking → `https://www.google.com/maps/dir/?api=1&destination=<lat>,<lng>`).
3. If a `warning_alert` (typhoon / flood) is active for the user's barangay, the alert level banner appears at the top.

## Implementation
- **File:** `app/evacuation.jsx`, stylesheet `styles/evacuation.js`.
- **Deps:** `react-native-maps` (Polyline), `expo-location`, `services/api.js`, `services/session.js`.
- **APIs:**
  - `GET /api/evacuation-centers?barangay=<name>` → assigned center.
  - `GET /api/warning-alerts/active?barangay=<name>` → active alert (if any).
- **Polyline source:** for now, draw a straight line between two points. To get a real walking/driving route, integrate Google Directions API later.

## Acceptance criteria
- If the user has no assigned evacuation center, show an empty state with a "Contact your barangay" button.
- Alert banner color matches the alert level (Green / Yellow / Orange / Red).
- Map respects user permission denial gracefully.
