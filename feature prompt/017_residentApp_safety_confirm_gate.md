# ResidentApp — Safety Confirm Gate (Phase 2 of SOS)

## Overview
App-wide modal that blocks every screen until the resident taps "I am Safe ✓" after their SOS lifecycle reaches the `PendingCompletion` state on the backend. Mounted once at the root layout; it owns all safe-confirm state — never duplicate this logic in a screen.

## How it triggers
- **Primary trigger — push:** the backend sends a notification with `data.type === 'verify-safe'` when an SOS transitions to `PendingCompletion`. The gate listens via `Notifications.addNotificationReceivedListener` and `addNotificationResponseReceivedListener`, and on hit re-fetches `getSOSHistory(residentId)`.
- **Fallback — poll:** every 30 s (`POLL_INTERVAL_MS = 30_000`) the gate calls `getSOSHistory` and looks for a row with `status === 'PendingCompletion'`. Network errors are swallowed silently.

## Modal UI
- Full-screen `<Modal animationType="fade" transparent={false}>`.
- Bold heading: "Are you safe?"
- Body: "Your responder has reported the mission complete. Please confirm that you are safe."
- Single primary button "I am Safe ✓".
- While submitting: button disabled + `<ActivityIndicator />`.

## Submit behavior
- Tap "I am Safe ✓" → `confirmSos(pendingSosId)` → `PATCH /sos/:id/confirm-safe`.
- On success → close modal (clear `pendingSosId`), allow the next poll to confirm the status is no longer `PendingCompletion`.
- On error → `Alert.alert('Could not confirm — please try again.')` and leave the modal open.

## Implementation
- **File:** `components/SafetyConfirmGate.jsx`.
- **Mounted in:** `app/_layout.jsx`.
- **Deps:** `expo-notifications`, `services/api.js (getSOSHistory, confirmSos)`, `services/session.js`.
- **Cleanup:** clear `setInterval` and both notification listeners on unmount.

## Acceptance criteria
- The modal supersedes ALL navigation — the user cannot interact with any screen while it is open.
- If no session is active (`getSession()` returns null) the gate does nothing.
- Only ONE `PendingCompletion` SOS is shown at a time (use the first match from history).
- Polling continues even if push notifications are denied or unavailable.

## Out of scope
- The backend-side status machine (`Dispatched → Arrived → PendingCompletion → Resolved`) lives in `sosController.js` and is not the gate's concern.
