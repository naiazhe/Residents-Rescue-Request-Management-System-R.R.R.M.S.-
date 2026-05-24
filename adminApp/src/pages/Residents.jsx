import { useMemo, useState } from 'react';
import { Admin } from '../api/endpoints';
import { useAsync } from '../hooks/useAsync';
import { useDebounced } from '../hooks/useDebounced';
import { PageHeader } from '../components/layout/AppLayout';
import { Card, CardBody } from '../components/ui/Card';
import { Input, Select, Label } from '../components/ui/Input';
import { Table, THead, TBody, TR, TH, TD, EmptyRow } from '../components/ui/Table';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Download } from 'lucide-react';

function age(birthdate) {
  if (!birthdate) return '—';
  const b = new Date(birthdate); const d = new Date();
  let a = d.getFullYear() - b.getFullYear();
  if (d.getMonth() < b.getMonth() || (d.getMonth() === b.getMonth() && d.getDate() < b.getDate())) a--;
  return a;
}

function toCSV(rows) {
  if (!rows.length) return '';
  const cols = Object.keys(rows[0]);
  const esc  = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  return [cols.join(','), ...rows.map((r) => cols.map((c) => esc(r[c])).join(','))].join('\n');
}

export default function Residents() {
  const [q, setQ]               = useState('');
  const [barangay, setBarangay] = useState('');
  const [sex, setSex]           = useState('');
  const debouncedQ              = useDebounced(q, 300);

  const opts = useAsync(() => Admin.filterOptions());
  const { data, loading, error } = useAsync(
    () => Admin.residents({
      q: debouncedQ || undefined,
      barangay: barangay || undefined,
      sex: sex || undefined,
    }),
    [debouncedQ, barangay, sex]
  );

  const rows = data || [];

  const summary = useMemo(() => {
    const total = rows.length;
    const withVuln = rows.filter((r) => Array.isArray(r.vulnerabilities) && r.vulnerabilities.length > 0).length;
    return { total, withVuln };
  }, [rows]);

  function exportCSV() {
    const flat = rows.map((r) => ({
      ...r,
      vulnerabilities: Array.isArray(r.vulnerabilities) ? r.vulnerabilities.join('; ') : '',
    }));
    const blob = new Blob([toCSV(flat)], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = 'residents.csv'; a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <>
      <PageHeader
        title="Residents"
        subtitle={`${summary.total} residents · ${summary.withVuln} with vulnerabilities`}
        action={<Button onClick={exportCSV} disabled={rows.length === 0}><Download size={14}/> Export CSV</Button>}
      />

      <Card className="mb-4">
        <CardBody className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div>
            <Label>Search</Label>
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="name or mobile…" />
          </div>
          <div>
            <Label>Barangay</Label>
            <Select value={barangay} onChange={(e) => setBarangay(e.target.value)}>
              <option value="">All</option>
              {(opts.data?.barangays || []).map((b) => <option key={b} value={b}>{b}</option>)}
            </Select>
          </div>
          <div>
            <Label>Sex</Label>
            <Select value={sex} onChange={(e) => setSex(e.target.value)}>
              <option value="">All</option>
              {(opts.data?.sexes || []).map((s) => <option key={s} value={s}>{s}</option>)}
            </Select>
          </div>
        </CardBody>
      </Card>

      {error && <div className="mb-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}

      <Table>
        <THead>
          <TR>
            <TH>Name</TH>
            <TH>Sex</TH>
            <TH>Age</TH>
            <TH>Mobile</TH>
            <TH>Barangay</TH>
            <TH>Type</TH>
            <TH>Vulnerabilities</TH>
          </TR>
        </THead>
        <TBody>
          {loading && <EmptyRow colSpan={7}>Loading…</EmptyRow>}
          {!loading && rows.length === 0 && <EmptyRow colSpan={7} />}
          {rows.map((r) => (
            <TR key={r.resident_id}>
              <TD className="font-medium text-slate-900">
                {[r.first_name, r.middle_name, r.last_name].filter(Boolean).join(' ')}
              </TD>
              <TD>{r.sex || '—'}</TD>
              <TD>{age(r.birthdate)}</TD>
              <TD className="font-mono text-xs">{r.mobile_number || '—'}</TD>
              <TD>{r.barangay_name || '—'}</TD>
              <TD>{r.resident_type || '—'}</TD>
              <TD>
                {Array.isArray(r.vulnerabilities) && r.vulnerabilities.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {r.vulnerabilities.map((v, i) => <Badge key={i} tone="violet">{v}</Badge>)}
                  </div>
                ) : <span className="text-slate-400">—</span>}
              </TD>
            </TR>
          ))}
        </TBody>
      </Table>
    </>
  );
}
