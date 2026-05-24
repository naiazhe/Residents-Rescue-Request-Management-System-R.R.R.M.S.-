# adminApp — Residents-per-Barangay Analytics

## Overview
The bar chart at the bottom of the Dashboard. Shows how the resident base is distributed across barangays so the super admin can see coverage at a glance. Powered by a dedicated analytics endpoint and rendered with `recharts`.

## UI
- Wrapped in a `<Card>` titled "Residents per barangay" with subtitle "Distribution across barangays".
- Body height fixed at 320 px.
- `<ResponsiveContainer>` → `<BarChart data={brg.data || []}>`:
  - `<CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />`
  - `<XAxis dataKey="barangay_name" tick={{ fontSize: 10 }} interval={0} angle={-30} textAnchor="end" height={70} />`
  - `<YAxis tick={{ fontSize: 11 }} allowDecimals={false} />`
  - `<Tooltip />`
  - `<Bar dataKey="residents" fill="#2563eb" />`

## Data
- `const brg = useAsync(() => Admin.residentsByBarangay());`
- Response shape: `[{ barangay_name: 'Dayangdang', residents: 120 }, ...]`.

## Backend
- `GET /api/admin/analytics/residents-by-barangay`
- Controller: `AdminController.residentsByBarangay`
  ```sql
  SELECT l.barangay_name,
         COUNT(DISTINCT r.resident_id)::int AS residents
  FROM resident r
  JOIN household h ON r.household_id = h.household_id
  JOIN location  l ON h.location_id  = l.location_id
  WHERE l.barangay_name IS NOT NULL
  GROUP BY l.barangay_name
  ORDER BY residents DESC;
  ```

## Implementation
- Lives inside `src/pages/Dashboard.jsx` (same page as the KPI cards).
- `recharts` already in `package.json`.

## Acceptance criteria
- Long barangay names rotate -30° and don't overlap.
- Y-axis integer-only (`allowDecimals={false}`).
- Empty dataset renders the chart with no bars (no crash).
- Loading state inherits the dashboard's "Loading…" text at the bottom.

## Future enhancements
- Filter the chart by sex / vulnerability flag.
- Stack bars by verification status (verified / pending / disabled).
- Add an "active SOS by barangay" companion chart.
