# adminApp — Dashboard Overview

## Overview
Landing page after login. Six KPI cards summarizing resident accounts and SOS activity, plus a bar chart of residents per barangay.

## Layout
- Title: "Dashboard", subtitle: "Resident overview."
- Grid of 6 `<StatCard>` (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3`):
  | label | tone | value |
  |---|---|---|
  | Total residents | blue | `data.totalResidents` |
  | Pending approvals | amber | `data.pendingResidents` |
  | Verified accounts | green | `data.verifiedResidents` |
  | Disabled accounts | slate | `data.disabledResidents` |
  | Active SOS | red | `data.activeSos` |
  | Total SOS records | blue | `data.totalSos` |
- Card below: "Residents per barangay" with a `<recharts BarChart>`.
  - X-axis: `barangay_name` (angled -30°).
  - Y-axis: integer count.
  - Bar fill: `#2563eb`.

## Data
- `useAsync(() => Admin.dashboard())` →
  ```json
  {
    "totalResidents": 1234,
    "pendingResidents": 25,
    "verifiedResidents": 1180,
    "disabledResidents": 29,
    "totalSos": 412,
    "activeSos": 7
  }
  ```
- `useAsync(() => Admin.residentsByBarangay())` →
  ```json
  [ { "barangay_name": "Dayangdang", "residents": 120 }, ... ]
  ```

## Backend
- `GET /api/admin/dashboard` → `AdminController.dashboard` runs 6 parallel `COUNT` queries.
- `GET /api/admin/analytics/residents-by-barangay` → joins resident → household → location, groups by barangay_name DESC.

## Implementation
- **Files:** `src/pages/Dashboard.jsx`, `src/components/ui/Card.jsx`, `src/components/layout/AppLayout.jsx` (for `PageHeader`).
- **Deps:** `recharts`, `lucide-react`.
- Use `StatCard({ icon, label, value, tone })` defined inline at the top of `Dashboard.jsx`.

## Acceptance criteria
- Each card shows `—` (em-dash) while data is loading or null.
- Chart bars render in barangay-count descending order.
- API errors surface in a red banner above the grid.
- The grid collapses to 1/2/3 columns on smaller breakpoints.
