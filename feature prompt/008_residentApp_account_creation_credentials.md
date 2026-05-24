# ResidentApp — Account Credentials & Backend Submission

## Overview
Final form in the registration funnel. Collects username, password, and optional profile photo, then submits the entire accumulated payload to `POST /api/auth/register`. On success it routes to OTP verification.

## User flow
1. Reached as the last step from every role's flow (`/uploadDocuments`, `/householdConfirm`, or `/memberCode` → `/signup` → here).
2. Form:
   - Profile photo (round tap-to-pick using `expo-image-picker`).
   - Username — max 20 chars, unique.
   - Password — min 6 chars, eye toggle.
   - Confirm password — must match.
3. On "Create Account":
   - Validate all fields.
   - Assemble payload by merging route params + memberStore + form values.
   - `await registerResident(payload)` → `POST /auth/register`.
   - On 409 (`Username already taken`) → highlight username field, show error.
   - On 201 → `router.replace('/otp')` with `{ accountId }`.

## Payload contract (must match `authController.register`)
```json
{
  "province": "Camarines Sur",
  "city": "Naga City",
  "barangay": "...",
  "street": "...",
  "latitude": 13.6234,
  "longitude": 123.1944,
  "firstName": "...",
  "middleName": "...",
  "lastName": "...",
  "sex": "MALE",
  "birthdate": "1995-06-15",
  "mobileNumber": "09171234567",
  "emergencyMobileNumber": "09181234567",
  "residentType": "Household Head | Tenant/Renter | Boarder | Household Member",
  "isRepresentative": true,
  "username": "...",
  "password": "...",
  "vulnerabilities": ["Pregnant", "PWD"]
}
```

## Implementation
- **File:** `app/register.jsx`, stylesheet `styles/register.js`.
- **Deps:** `expo-image-picker`, `services/api.js` → `registerResident`.
- **Logo:** uses `assets/img/LOGO.png` (other registration screens use `BADGE.png`).
- **Loading state:** disable button + show inline spinner while POST is in flight.

## Acceptance criteria
- Username collision returns a clear inline error; user can edit and retry without losing the rest of the form.
- A `residentType` value must always be present on the wire — derive it from the role param.
- Latitude/longitude are sent as numbers, not strings.
- Password is never logged.

## Out of scope
- Hashing happens server-side with bcrypt (cost 10) in `authController.register`.
