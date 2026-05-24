import { useMemo, useState } from 'react';
import { Admin } from '../api/endpoints';
import { useAsync } from '../hooks/useAsync';
import { useDebounced } from '../hooks/useDebounced';
import { PageHeader } from '../components/layout/AppLayout';
import { Card, CardBody } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Input, Select, Label } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Table, THead, TBody, TR, TH, TD, EmptyRow } from '../components/ui/Table';
import { RefreshCcw, MapPin } from 'lucide-react';

function statusTone(s) {
  return ({
    Pending: 'amber',
    Dispatched: 'blue',
    Arrived: 'violet',
    Resolved: 'green',
    Safe: 'green',
    Completed: 'green',
    Closed: 'slate',
    Cancelled: 'slate',
  })[s] || 'slate';
}

function urgencyTone(u) {
  const n = Number(u);
  if (n >= 3) return 'red';
  if (n === 2) return 'amber';
  return 'blue';
}

function fullName(r) {
  return [r.first_name, r.middle_name, r.last_name].filter(Boolean).join(' ') || '—';
}

function fmt(d) { return d ? new Date(d).toLocaleString() : '—'; }

const CLOSED = new Set(['Resolved', 'Safe', 'Cancelled', 'Completed', 'Closed']);

export default function SosRecords() {
  const [status, setStatus] = useState('');
  const [q, setQ]           = useState('');
  const debouncedQ          = useDebounced(q, 300);

  const opts = useAsync(() => Admin.filterOptions());
  const { data, loading, error, reload } = useAsync(
    () => Admin.sos({ status: status || undefined, q: debouncedQ || undefined }),
    [status, debouncedQ]
  );

  const rows = data || [];
  const counts = useMemo(() => {
    const c = { total: rows.length, active: 0, resolved: 0 };
    for (const r of rows) {
      if (CLOSED.has(r.status)) c.resolved++; else c.active++;
    }
    return c;
  }, [rows]);

  return (
    <>
      <PageHeader
        title="Resident SOS Records"
        subtitle={`${counts.total} records · ${counts.active} active · ${counts.resolved} closed`}
        action={<Button variant="outline" onClick={reload}><RefreshCcw size={14}/> Refresh</Button>}
      />

      <Card className="mb-4">
        <CardBody className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <Label>Search by resident or barangay</Label>
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="name or barangay…" />
          </div>
          <div>
            <Label>Status</Label>
            <Select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="">All</option>
              {(opts.data?.sosStatuses || []).map((s) => <option key={s} value={s}>{s}</option>)}
            </Select>
          </div>
        </CardBody>
      </Card>

      {error && <div className="mb-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}

      <Table>
        <THead>
          <TR>
            <TH>SOS #</TH>
            <TH>Resident</TH>
            <TH>Mobile</TH>
            <TH>Barangay</TH>
            <TH>Urgency</TH>
            <TH>Status</TH>
            <TH>Location</TH>
            <TH>Created</TH>
            <TH>Dispatched</TH>
          </TR>
        </THead>
        <TBody>
          {loading && <EmptyRow colSpan={9}>Loading…</EmptyRow>}
          {!loading && rows.length === 0 && <EmptyRow colSpan={9} />}
          {rows.map((s) => (
            <TR key={s.sos_id}>
              <TD className="font-mono text-xs">#{s.sos_id}</TD>
              <TD className="font-medium text-slate-900">{fullName(s)}</TD>
              <TD className="font-mono text-xs">{s.mobile_number || '—'}</TD>
              <TD>{s.barangay_name || '—'}</TD>
              <TD><Badge tone={urgencyTone(s.urgency_level)}>Lvl {s.urgency_level ?? '—'}</Badge></TD>
              <TD><Badge tone={statusTone(s.status)}>{s.status || '—'}</Badge></TD>
              <TD className="font-mono text-xs">
                {s.request_latitude && s.request_longitude ? (
                  <a
                    href={`https://www.google.com/maps?q=${s.request_latitude},${s.request_longitude}`}
                    target="_blank" rel="noreferrer"
                    className="inline-flex items-center gap-1 text-brand-600 hover:underline"
                  >
                    <MapPin size={11}/>
                    {Number(s.request_latitude).toFixed(4)}, {Number(s.request_longitude).toFixed(4)}
                  </a>
                ) : '—'}
              </TD>
              <TD className="text-xs text-slate-500">{fmt(s.timestamp_created)}</TD>
              <TD className="text-xs text-slate-500">{fmt(s.timestamp_dispatched)}</TD>
            </TR>
          ))}
        </TBody>
      </Table>
    </>
  );
}
