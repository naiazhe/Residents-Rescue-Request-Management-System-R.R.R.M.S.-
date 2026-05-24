# adminApp — Bulk Approve Pending Accounts

## Overview
Sub-feature of the Resident Accounts page that lets a super admin approve many pending accounts at once. Uses row checkboxes + a header button.

## UI
- Row checkbox column (`☐ / ☑` via `Square` / `CheckSquare` lucide icons) — left-most column in the table.
- Header "select all" checkbox that mirrors the filtered result set:
  ```js
  const allSelected = rows.length > 0 && rows.every(r => selected.has(r.account_id));
  ```
- Header action button: `Bulk approve (N)` — disabled when nothing is selected or `bulk.busy`.

## Behavior
1. `setSelected` is a `Set<number>` of `account_id`.
2. `toggle(id)` adds/removes; `toggleAll()` flips between empty and all-rows.
3. Filter or search change → `setSelected(new Set())` (avoid approving rows the admin can no longer see).
4. `bulkApprove()` runs:
   ```js
   const results = await Admin.bulkApprove([...selected]);
   const ok = results.filter(r => r.ok).length;
   const failed = results.length - ok;
   setBanner({ tone: failed === 0 ? 'green' : 'amber',
               text: `Bulk approve: ${ok} approved${failed ? `, ${failed} failed` : ''}.` });
   setSelected(new Set());
   await reload();
   ```

## Backend
- `PATCH /api/admin/accounts/bulk-approve` body `{ ids: [1,2,3] }`.
- Server loops `AccountModel.verify(id)` per id, returns `[{id, ok}, {id, ok:false, error: '...'}]`.

## Implementation
- Same file as Accounts page (`src/pages/Accounts.jsx`).
- Uses `useMutation(Admin.bulkApprove)` for the busy flag.

## Acceptance criteria
- Selecting rows that are already verified is allowed but each will return `ok: false` from the server — count them as failures in the banner.
- The button label always reflects the current selection size: `Bulk approve (12)`.
- After completion the selection is cleared and the list is refreshed.
- Concurrent row-level actions (Approve/Reject) and bulk-approve cannot run at the same time — disable row actions when `bulk.busy`.
