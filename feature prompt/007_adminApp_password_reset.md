# adminApp — Reset Resident Account Password

## Overview
Lets a super admin set a new password for any resident account from the Accounts page. Triggered by the KeyRound icon on each row; opens a modal, validates ≥ 6 chars, then PATCHes the backend (bcrypt-hashed server-side).

## UI
- Trigger: small outline `<Button size="sm" title="Reset password"><KeyRound size={12} /></Button>` per row.
- Modal title: `Reset password — <username>`.
- Body: `<Label>New password (min 6 characters)</Label>` + `<Input type="text">` so the admin can read what they're typing.
- Footer:
  - `Cancel` (ghost) — closes the modal.
  - `Reset` (primary) — disabled while `pw.length < 6 || busy`.

## Behavior
- `useEffect(() => { if (acc) setPw(''); }, [acc])` — clear input when switching to a different account.
- On Reset:
  ```js
  await Admin.resetPassword(acc.account_id, pw);
  onClose();
  onDone(`Password reset for ${acc.username}.`);
  ```
- Errors surface via the parent's banner (`onError`).

## Backend
- `PATCH /api/admin/accounts/:id/password` body `{ password }`.
- Server: `AdminController.resetPassword`:
  - Rejects with 400 if `password.length < 6`.
  - `bcrypt.hash(password, 10)` → `AccountModel.updatePassword(id, hashed)`.
  - Returns the updated account (no password field).

## Implementation
- `PasswordModal` is defined at the bottom of `src/pages/Accounts.jsx` and used from the row actions.
- Reuses `<Modal />`, `<Input />`, `<Label />`, `<Button />` from `components/ui/`.

## Acceptance criteria
- Modal cannot be submitted with an empty / short password.
- After success the admin sees a green banner with the username, and the modal closes automatically.
- The page reloads so the "last action" UI is consistent with other actions.
- The password is not echoed back from the server, and nothing is stored client-side.
