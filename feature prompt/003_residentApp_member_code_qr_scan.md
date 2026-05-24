# ResidentApp — Member Code Entry (Type or QR Scan)

## Overview
Only for users registering as **Household Member**. They must prove they belong to an existing household either by typing a 6-character Member Code (format `BO - 123456`) or by scanning a QR code shown on the Household Head's profile.

## User flow
1. Triggered from `/householdRole` when role = Household Member.
2. Screen shows two options stacked:
   - Text input for the Member Code, formatted as `XX - 123456`.
   - "Scan QR" button → opens fullscreen camera view (`expo-camera`).
3. On valid code (typed or scanned):
   - Validate the code exists by hitting a backend lookup (currently mocked — see "Backend gap" below).
   - Navigate to `/signup` with route params `{ isMember: 'true', memberCode: <value> }`.
4. The signup screen recognizes `isMember=true` and routes the user straight from personal-details → `/register`, skipping address/documents.

## Implementation
- **File:** `app/memberCode.jsx`, stylesheet `styles/householdRole.js` (reused).
- **Deps:** `expo-camera` (`CameraView`, `useCameraPermissions`, `onBarcodeScanned`).
- **State:** `code` (string), `scanning` (bool — toggles camera modal), `error` (string).
- **Camera:**
  - Request permission with `useCameraPermissions()` on first scan attempt.
  - Render `<CameraView barcodeScannerSettings={{ barcodeTypes: ['qr'] }} onBarcodeScanned={onScan} />`.
  - On scan, validate the payload matches expected format (`/^[A-Z]{2}\s-\s\d{6}$/`), then close camera and fill the input.
- **Input mask:** auto-uppercase the first 2 chars, insert ` - `, then digits only, max length 12.

## Backend gap
- No `/api/households/lookup-by-code` endpoint exists today. For now, accept any code matching the regex and pass it through. Add a real backend lookup when household codes are persisted.

## Acceptance criteria
- Camera permission denial shows a friendly message + a button to re-request.
- Manual code and scanned code follow the same downstream path.
- Pressing back returns to `/householdRole` without losing the role selection.
- The route param `isMember: 'true'` MUST be a string (not boolean) — Expo Router serializes to query string.
