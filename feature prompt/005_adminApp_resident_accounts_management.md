# adminApp — Resident Accounts Management (CRUD + Approvals)

## Overview
Primary moderation page. Lists every resident account with its status (Pending / Verified / Disabled) and exposes per-row actions to approve, reject, toggle active, and reset password. Includes search, status filter, and bulk approval.

## Layout
- `PageHeader` with title "Resident Accounts" and a right-aligned **Bulk approve (N)** button (disabled until rows are selected).
- Filter card row: Search input (placeholder "username or name"), Status `<Select>` (`All / Pending / Verified / Disabled`), Refresh button.
- Banner row (green/amber/red) for last action result.
- `<Table>`:
  - Columns: ☐ (select), Username, Name, Mobile, Barangay, Status, Created, Actions.
  - Per-row actions (only when applicable):
    - **Approve** (Check icon) — visible if `!is_verified && is_active`.
    - **Reset password** (KeyRound icon) — always visible → opens `<PasswordModal>`.
    - **Toggle active** (Power icon) — always visible.
    - **Reject** (X icon, danger variant) — visible while `is_active`.

## Data + actions
- `useAsync(() => Admin.accounts({ status, q }), [status, debouncedQ])`.
- Reset selection set whenever filters change (`useEffect`).
- Actions:
  - `Admin.approve(id)` → `PATCH /admin/accounts/:id/approve`.
  - `Admin.reject(id)` → `PATCH /admin/accounts/:id/reject` (asks `confirm()` first).
  - `Admin.setActive(id, !is_active)` → `PATCH /admin/accounts/:id/active`.
  - `Admin.resetPassword(id, password)` → `PATCH /admin/accounts/:id/password` (min 6).
- Wrap each row action in `runRow(id, fn, successText)` to set `busyRow`, await, set banner, reload.

## Status badge
```js
if (!a.is_active)   → <Badge tone="slate">Disabled</Badge>
if (!a.is_verified) → <Badge tone="amber">Pending</Badge>
                    → <Badge tone="green">Verified</Badge>
```

## PasswordModal
- Subcomponent at the bottom of `Accounts.jsx`.
- Input is `type="text"` (so the admin can see what they're typing — visible per UX intent).
- Save disabled while `pw.length < 6` or busy.
- On success: close + `onDone(message)` (banner green), reload list.

## Implementation files
- `src/pages/Accounts.jsx`
- `src/components/ui/{Button,Input,Modal,Table,Badge,Card}.jsx`
- `src/hooks/{useAsync,useDebounced,useMutation}.js`

## Backend
- `GET /api/admin/accounts?status=pending|verified|disabled&q=foo` — always restricted to `role='resident'` server-side.
- `PATCH .../approve` calls `AccountModel.verify(id)` which also maintains `resident.category` (resident/non-resident).
- `PATCH .../reject` sets `is_active=false` (does not delete).

## Acceptance criteria
- A pending row shows Approve, Reset, Toggle, and Reject buttons.
- A disabled row shows only Reset and Toggle (no Approve, no Reject).
- Bulk approve sends `{ ids: number[] }`; the server returns `[{ id, ok, error? }, ...]` — surface "X approved, Y failed".
- The action buttons of the row currently mutating are disabled (`busyRow === a.account_id`).
- Banner can be dismissed via the X icon.
