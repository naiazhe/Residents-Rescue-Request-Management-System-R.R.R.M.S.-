# adminApp — SOS Records (Resident-Centric Read-Only View)

## Overview
Audit view of every SOS request raised by residents. Read-only — the super admin doesn't dispatch or resolve here; those actions belong to barangay / city operators in other consoles. Provides search, status filter, color-coded badges, and a Google Maps link per record.

## Layout
- `PageHeader` title "Resident SOS Records", subtitle "`X` records · `Y` active · `Z` closed", action: **Refresh**.
- Filter card:
  - Search input (`name or barangay…`).
  - Status `<Select>` populated from `Admin.filterOptions().sosStatuses` (Postgres enum `sos_status`).
- Error banner above the table.
- `<Table>` columns: SOS #, Resident, Mobile, Barangay, Urgency, Status, Location, Created, Dispatched.

## Visual rules
- **Status badge tone:** Pending → amber, Dispatched → blue, Arrived → violet, Resolved/Safe/Completed → green, Closed/Cancelled → slate.
- **Urgency badge tone:** `≥ 3` → red, `=2` → amber, else blue.
- **Location cell:** if both coordinates exist, render an anchor `https://www.google.com/maps?q=${lat},${lng}` opening in a new tab with `MapPin` icon and short-coords text (`13.6234, 123.1944`).
- **Date cells:** `new Date(d).toLocaleString()` or em-dash.

## Counts
```js
const CLOSED = new Set(['Resolved','Safe','Cancelled','Completed','Closed']);
const counts = useMemo(() => {
  const c = { total: rows.length, active: 0, resolved: 0 };
  for (const r of rows) (CLOSED.has(r.status) ? c.resolved++ : c.active++);
  return c;
}, [rows]);
```

## Data
- `useAsync(() => Admin.filterOptions())` for the status dropdown.
- `useAsync(() => Admin.sos({ status, q }), [status, debouncedQ])`.

## Backend
- `GET /api/admin/sos?status=Dispatched&q=foo` joins `sos_request` → `resident` → `household` → `location`.
- Returns: `sos_id, resident_id, urgency_level, status, timestamp_created, timestamp_dispatched, request_latitude, request_longitude, first_name, middle_name, last_name, mobile_number, barangay_name, street_name`.

## Implementation files
- `src/pages/SosRecords.jsx`
- Reuses `<Card>`, `<Badge>`, `<Input>`, `<Select>`, `<Label>`, `<Button>`, `<Table>`.

## Acceptance criteria
- Status badge color matches the tone map exactly; unknown status falls back to slate.
- The Maps link opens in a new tab (`target="_blank" rel="noreferrer"`).
- Refresh button calls `reload()` from `useAsync`.
- Search is debounced 300 ms.

## Out of scope
- Live websocket updates — refresh is manual.
- Mutating SOS status from this page (operator consoles handle that).
