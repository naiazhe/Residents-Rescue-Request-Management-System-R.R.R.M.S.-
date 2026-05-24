# ResidentApp — Signup: Personal Details

## Overview
Second step of registration. Collects the resident's personal information that goes into the `resident` table on the backend, plus an optional list of vulnerabilities.

## User flow
1. Reached from `/householdRole` (Head/Tenant/Boarder) or `/memberCode` (Member with `isMember=true`).
2. Form fields:
   - First name (required)
   - Middle name (optional)
   - Last name (required)
   - Sex — radio: Male / Female (required, enum `gender_type`)
   - Birthdate — `@react-native-community/datetimepicker` (required)
   - Mobile number — digits-only, 11 digits, required
   - Emergency mobile number — digits-only, 11 digits, optional
   - Vulnerabilities — multi-select checkboxes: Pregnant, PWD, Senior Citizen, Infant, Bedridden, Chronic Illness (free additions allowed)
3. On Continue:
   - Validate all required fields, mark errors with red border (`styles.inputError`).
   - Save the in-memory payload (route params or local store).
   - Route based on `isMember` param:
     - `isMember === 'true'` → `/register`
     - else → `/signupAddress`

## Implementation
- **File:** `app/signup.jsx`, stylesheet `styles/signup.js` (shared with `householdMember.jsx`).
- **Deps:** `@react-native-community/datetimepicker`, `@react-native-picker/picker` (optional for sex), `expo-router`.
- **Mobile number handling:** strip with `.replace(/[^0-9]/g, '')`, cap length 11.
- **Error pattern:** maintain `errors` object `{ fieldName: true }`; in `handleChange(field, value)`, clear `errors[field]` as user types.
- **Forward payload:** pass via route params (`router.push({ pathname: '/signupAddress', params: { ... } })`) or a module-level scratch store (since project policy is no Redux/Context).

## Acceptance criteria
- Required validation blocks navigation and shows red borders.
- Mobile number cannot exceed 11 digits and cannot contain letters.
- Birthdate picker presents a max date of today (no future dates).
- Household Members skip address & document upload.

## Out of scope
- Backend submission happens in `/register` (account credentials step), not here.
