# ResidentApp — Add Household Members (Optional Sub-Flow)

## Overview
Only the **Household Head** sees this sub-flow. It lets the head pre-register the names of the people living in the same household, who will later be issued Member Codes. Three screens chained together: prompt → add form → review.

## User flow
1. `/addMembersPrompt` — "Would you like to add household members now?" Yes / No.
   - No → `/register`
   - Yes → `/householdMember`
2. `/householdMember` — form for one member: first name, middle, last, sex, birthdate, relationship to head, vulnerabilities.
   - "Save & add another" → reset form, increment counter.
   - "Done" → `/householdConfirm`.
3. `/householdConfirm` — list view of all added members with edit (✎) and delete (🗑) per row. "Confirm" → `/register`. Has a blue-tinted back button (`tintColor: '#3FA9F5'`).

## Implementation
- **Files:**
  - `app/addMembersPrompt.jsx` (shares `styles/householdRole.js`)
  - `app/householdMember.jsx` (shares `styles/signup.js`)
  - `app/householdConfirm.jsx` + `styles/householdConfirm.js`
- **Storage:** `services/memberStore.js` — module-level array. Exposes:
  - `addLocalMember(member)`
  - `getLocalMembers()`
  - `updateLocalMember(id, patch)`
  - `removeLocalMember(id)`
  - `clearLocalMembers()`
- **Member object shape:**
  ```js
  {
    id: <client uuid>,
    first_name, middle_name, last_name,
    sex, birthdate, mobile_number,
    relationship,
    vulnerabilities: [],
    hasAccount: false,   // always false here — accounts are created when the member registers themselves
  }
  ```

## Backend integration
- The list is sent to the backend in a later phase (currently there is no `/api/households/:id/members/bulk` endpoint). Until that exists, members live in-memory only and are recreated on the profile page after login.

## Acceptance criteria
- Tenant/Renter and Boarder roles never see any of these three screens.
- Deleting a member updates the confirm list immediately.
- "Done" from `/householdMember` must not push when the current form is dirty/invalid — show validation errors instead.
- All new members default to `hasAccount: false`.
