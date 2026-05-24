# ResidentApp — Push Notifications (Expo)

## Overview
Cross-cutting feature: the app registers an Expo push token on login, persists it to the backend, and listens for notifications used by the SafetyConfirmGate, SOS lifecycle, and warning alerts.

## Wiring
1. **On login (`app/index.jsx`):**
   - Set the global notification handler so foreground notifications still show:
     ```js
     Notifications.setNotificationHandler({
       handleNotification: async () => ({
         shouldShowAlert: true, shouldPlaySound: true, shouldSetBadge: true,
       }),
     });
     ```
   - Call `registerPushToken(accountId)`:
     - Request notification permission.
     - Get token via `Notifications.getExpoPushTokenAsync()`.
     - `savePushToken(accountId, token)` → `PATCH /accounts/:id/push-token`.
   - Failures are swallowed silently (don't block login).

2. **Backend (`NagaRescueBackend/src/utils/pushNotification.js`):**
   - Uses `expo-server-sdk` to chunk & deliver notifications.
   - Reads token from `account.expo_push_token` (added by migration).
   - Sends from controllers when status transitions warrant a push.

3. **Notification types** (`notification.request.content.data.type`):
   - `verify-safe` — picked up by `components/SafetyConfirmGate.jsx`; triggers an immediate poll of `getSOSHistory`.
   - `sos-status` — informational toast / silent refresh.
   - `warning-alert` — push for active barangay warnings.

## Implementation files
- `app/index.jsx` — handler registration + token save.
- `components/SafetyConfirmGate.jsx` — listens for `verify-safe`, polls every 30 s as fallback.
- `services/api.js` → `savePushToken`, `getResidentNotifications`, `markNotificationRead`.
- `NagaRescueBackend/src/utils/pushNotification.js` — server send helper.

## Acceptance criteria
- Permission denial must NOT crash the app or block login.
- Tokens refreshed on every login (overwrite previous value for that account).
- `SafetyConfirmGate` resolves a pending completion modal within 30 s even without push (poll fallback).
- Notification taps deep-link to the relevant screen (`/home` for SOS, `/profile` for verification, `/evacuation` for warnings).

## Out of scope
- iOS APNS certificates / Android FCM keys configuration (handled in Expo project settings, not in code).
- A "notification center" screen (not currently implemented).
