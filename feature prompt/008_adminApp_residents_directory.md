# adminApp — Residents Directory (Search, Filter, Vulnerabilities)

## Overview
Read-only directory of every person in the `resident` table. Joined server-side with household + location + vulnerabilities so each row shows name, age, mobile, barangay, type, and vulnerability tags. Supports search and two filter dropdowns sourced from the backend.

## Layout
- `PageHeader` title "Residents", subtitle "`N` residents · `M` with vulnerabilities", action: **Export CSV**.
- Filter card with 3-column grid:
  - Search input (`name or mobile…`).
  - Barangay `<Select>` populated from `Admin.filterOptions().barangays`.
  - Sex `<Select>` populated from `Admin.filterOptions().sexes` (Postgres enum `gender_type`).
- Error banner above the table.
- `<Table>` with columns: Name, Sex, Age, Mobile, Barangay, Type, Vulnerabilities.
  - Name = `[first, middle, last].filter(Boolean).join(' ')`.
  - Age = computed client-side (`age(birthdate)`).
  - Vulnerabilities = horizontal `<Badge tone="violet">` chips; em-dash if empty.

## Data
- `useAsync(() => Admin.filterOptions())` — barangays, sexes.
- `useAsync(() => Admin.residents({ q, barangay, sex }), [debouncedQ, barangay, sex])`.

## Backend
- `GET /api/admin/residents?q=...&barangay=...&sex=MALE` (sex compared as `r.sex::text = $1`).
- Server query (`AdminController.listResidents`) joins resident → household → location → vulnerability and aggregates vulnerabilities with `json_agg` → `vulnerabilities: string[]`.
- `GET /api/admin/filter-options` returns `{ barangays, sexes, sosStatuses }` distinct values for dropdowns.

## Summary computation
```js
const summary = useMemo(() => {
  const total = rows.length;
  const withVuln = rows.filter(r => Array.isArray(r.vulnerabilities) && r.vulnerabilities.length > 0).length;
  return { total, withVuln };
}, [rows]);
```

## Implementation files
- `src/pages/Residents.jsx`
- Reuses `<Card>`, `<Input>`, `<Select>`, `<Label>`, `<Table>`, `<Badge>`, `<Button>`.

## Acceptance criteria
- Filters are applied server-side (don't filter on the client after fetch).
- Empty result set shows an `<EmptyRow />`.
- Vulnerabilities array can be `[]` (literal) — render the em-dash placeholder.
- Search is debounced 300 ms.
