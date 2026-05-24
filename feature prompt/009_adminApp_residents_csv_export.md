# adminApp — Residents CSV Export

## Overview
Adds a "Export CSV" button to the Residents page that downloads the currently-filtered result set as a CSV file. Purely client-side — uses a `Blob` + anchor click.

## UI
- Action button in `PageHeader`:
  ```jsx
  <Button onClick={exportCSV} disabled={rows.length === 0}>
    <Download size={14}/> Export CSV
  </Button>
  ```

## Behavior
1. Flatten each row so the `vulnerabilities` array becomes a `; `-joined string:
   ```js
   const flat = rows.map(r => ({
     ...r,
     vulnerabilities: Array.isArray(r.vulnerabilities) ? r.vulnerabilities.join('; ') : '',
   }));
   ```
2. Build CSV with a tiny helper:
   ```js
   function toCSV(rows) {
     if (!rows.length) return '';
     const cols = Object.keys(rows[0]);
     const esc  = v => `"${String(v ?? '').replace(/"/g, '""')}"`;
     return [cols.join(','), ...rows.map(r => cols.map(c => esc(r[c])).join(','))].join('\n');
   }
   ```
3. Create a `Blob` (`text/csv`) and trigger an anchor click:
   ```js
   const blob = new Blob([toCSV(flat)], { type: 'text/csv' });
   const url  = URL.createObjectURL(blob);
   const a    = document.createElement('a');
   a.href = url; a.download = 'residents.csv'; a.click();
   URL.revokeObjectURL(url);
   ```

## Implementation files
- All inside `src/pages/Residents.jsx` — no extra files.
- `lucide-react` for the `Download` icon.

## Acceptance criteria
- Exported CSV exactly reflects the active filters (server-side filtered list).
- Cells containing commas, quotes, or newlines are quoted and double-escaped.
- The download filename is `residents.csv` (override later if multi-export is needed).
- Button is disabled when the table is empty.

## Out of scope
- Per-column selection / re-ordering.
- Excel `.xlsx` export (would require `xlsx` package).
