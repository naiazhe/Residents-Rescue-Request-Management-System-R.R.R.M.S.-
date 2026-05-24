# ResidentApp — Profile & Household Management

## Overview
Profile screen reachable from the header. Shows the logged-in resident's info, a verification badge, and (for Household Heads) a list of household members with QR codes that members can scan during registration.

## User flow
1. Tap profile icon in `<Header />`.
2. Screen shows:
   - Avatar + full name.
   - Badge below name:
     - Green "Verified by Barangay" if `user.isVerified === true`
     - Orange "Pending Verification" if false
   - Personal details (mobile, birthdate, address).
   - "Household members" section (only for Household Heads):
     - Card per member: name, age, vulnerabilities.
     - Status pill: green "Has Account" or gray "No Account" based on `member.hasAccount`.
     - Action: "Show QR" button → modal renders `react-native-qrcode-svg` of the member's `memberCode` (e.g. `BO - 123456`).
     - Edit (✎) and Delete (🗑) icons.
   - "Add Member" floating button → modal form (same fields as `/householdMember`).
   - "Logout" button at bottom (uses `assets/icons/logout-rounded.png`).

## Implementation
- **File:** `app/profile.jsx`, stylesheet `styles/profile.js`.
- **Deps:** `react-native-qrcode-svg`, `react-native-svg`, `expo-router`, `services/api.js`, `services/session.js`, `services/memberStore.js`.
- **APIs:**
  - `getResidentProfile(residentId)` → `GET /residents/:id/profile`
  - `getHouseholdMembers(householdId)` → `GET /residents/household/:id/full`
- **QR payload:** plain string `memberCode` (so the scanner in `memberCode.jsx` can compare directly).
- **Logout:** `clearSession()` then `router.replace('/')`.

## Acceptance criteria
- Non-heads (Tenant / Boarder / Member) never see the household members section.
- New members added via the modal default to `hasAccount: false` and appear immediately in the list.
- Deleting a member requires confirmation (`Alert.alert`).
- The QR modal must work without an internet connection (purely client-side rendering).
