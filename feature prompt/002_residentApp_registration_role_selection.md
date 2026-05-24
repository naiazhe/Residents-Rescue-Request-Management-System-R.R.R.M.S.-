# ResidentApp — Registration Step 1: Household Role Selection

## Overview
First step of the multi-screen registration flow. The user chooses one of four household roles; the choice controls which downstream screens appear (document upload, member-code entry, add-members prompt).

## User flow
1. Triggered from the "Register" link on `app/index.jsx` (modal pre-selects a role), or by navigating directly to `/householdRole`.
2. Screen shows four radio options:
   - **Household Head** — Primary account holder of the household.
   - **Tenant / Renter** — Renting a property in the barangay.
   - **Boarder** — Boarding inside a household.
   - **Household Member** — Member of an existing household; requires a Member Code.
3. User taps "Continue". The selected role is passed forward as a route param.

## Role routing logic
| Role | Next screen | Notes |
|---|---|---|
| Household Head | `/signup` → `/signupAddress` → `/uploadDocuments` → `/addMembersPrompt` → `/register` | Full flow |
| Tenant / Renter | `/signup` → `/signupAddress` → `/uploadDocuments` → `/register` | Skips add-members |
| Boarder | `/signup` → `/signupAddress` → `/uploadDocuments` → `/register` | Skips add-members |
| Household Member | `/memberCode` → `/signup` (with `isMember=true`) → `/register` | Skips documents & add-members |

## Implementation
- **File:** `app/householdRole.jsx`, stylesheet `styles/householdRole.js` (shared with `memberCode.jsx` and `addMembersPrompt.jsx`).
- **Deps:** `expo-router` (`useRouter`, `useLocalSearchParams`).
- **State:** single `selectedRole` string.
- **Layout:** `LANDING.jpg` ImageBackground, `BADGE.png` header, custom radio buttons (outer + inner circle).
- **Back button:** absolute-positioned top-left (`top: 50, left: 20, zIndex: 10`) using `assets/icons/back.png`.

## Acceptance criteria
- Continue button is disabled until a role is selected.
- Household Member route must include `{ isMember: 'true' }` so `signup.jsx` knows to skip address/documents.
- Selecting Tenant/Renter or Boarder must not show the add-members prompt.
- Back button returns to `/` (login).

## Out of scope
- Account creation is a separate screen (`register.jsx`).
- Role-specific server-side handling (the backend only branches by `residentType` value).
