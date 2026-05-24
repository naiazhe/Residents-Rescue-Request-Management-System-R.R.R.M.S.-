# ResidentApp — Upload Proof of Residency

## Overview
Lets the user attach proof-of-residency document images (barangay clearance, valid ID, lease contract, etc.). Required for Household Head / Tenant / Boarder roles; skipped entirely for Household Members.

## User flow
1. Reached from `/signupAddress`.
2. Screen shows:
   - Brief instruction text ("Please upload one valid ID and one proof of residency").
   - "Pick from gallery" / "Take a photo" buttons.
   - Thumbnail grid of selected files with a delete icon per item.
3. Each pick uses `expo-image-picker`. Resize/compress before storing (target ≤ 1 MB each — backend limit is 15 MB per request).
4. On Continue:
   - Household Head → `/addMembersPrompt`
   - Tenant / Boarder → `/register`

## Implementation
- **File:** `app/uploadDocuments.jsx`, stylesheet `styles/uploadDocuments.js`.
- **Deps:** `expo-image-picker`, `expo-file-system` (optional, for compression).
- **Permission flow:** `ImagePicker.requestMediaLibraryPermissionsAsync()` for gallery, `requestCameraPermissionsAsync()` for camera. Surface a denial alert with "Open Settings" if needed.
- **Storage:** keep documents as `{ uri, base64, mimeType }[]` in screen state, forward via route params or scratch store. The backend currently doesn't have a documents column for residents — these are kept client-side until that endpoint exists.

## Validation
- Require at least 1 document before Continue is enabled.
- File size: warn if any item is > 5 MB raw.

## Backend gap
- No `/api/residents/:id/documents` endpoint exists. Until then, documents are not actually persisted — the screen is a UX placeholder. Either:
  - Add a `documents JSONB` column to `resident`, or
  - Build a dedicated upload endpoint that writes to disk / object storage.

## Acceptance criteria
- Household Member role NEVER sees this screen.
- Continue button stays disabled until at least one document is added.
- Back button returns to `/signupAddress` with the address fields intact.
