import { useEffect, useState } from 'react';
import { Admin } from '../api/endpoints';
import { useAsync } from '../hooks/useAsync';
import { useDebounced } from '../hooks/useDebounced';
import { useMutation } from '../hooks/useMutation';
import { PageHeader } from '../components/layout/AppLayout';
import { Card, CardBody } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input, Select, Label } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { Table, THead, TBody, TR, TH, TD, EmptyRow } from '../components/ui/Table';
import { Modal } from '../components/ui/Modal';
import { Check, X, KeyRound, Power, CheckSquare, Square } from 'lucide-react';

function statusBadge(a) {
  if (!a.is_active)   return <Badge tone="slate">Disabled</Badge>;
  if (!a.is_verified) return <Badge tone="amber">Pending</Badge>;
  return <Badge tone="green">Verified</Badge>;
}

export default function Accounts() {
  const [status, setStatus]     = useState('');
  const [q, setQ]               = useState('');
  const debouncedQ              = useDebounced(q, 300);
  const [selected, setSelected] = useState(() => new Set());
  const [pwModal, setPwModal]   = useState(null);
  const [busyRow, setBusyRow]   = useState(null);   // accountId currently mutating
  const [banner, setBanner]     = useState(null);   // { tone, text }

  const { data, loading, error, reload } = useAsync(
    () => Admin.accounts({ status: status || undefined, q: debouncedQ || undefined }),
    [status, debouncedQ]
  );

  // Clear selection whenever the result set changes (filter/search).
  useEffect(() => { setSelected(new Set()); }, [status, debouncedQ]);

  const bulk = useMutation((ids) => Admin.bulkApprove(ids));

  const rows = data || [];
  const allSelected = rows.length > 0 && rows.every((r) => selected.has(r.account_id));

  function toggle(id) {
    const next = new Set(selected);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelected(next);
  }
  function toggleAll() {
    setSelected(allSelected ? new Set() : new Set(rows.map((r) => r.account_id)));
  }

  async function runRow(id, fn, successText) {
    setBusyRow(id);
    setBanner(null);
    try {
      await fn();
      setBanner({ tone: 'green', text: successText });
      await reload();
    } catch (err) {
      const msg = err?.response?.data?.error || err.message;
      setBanner({ tone: 'red', text: msg });
    } finally {
      setBusyRow(null);
    }
  }

  async function approveOne(id)  { return runRow(id, () => Admin.approve(id), 'Account approved.'); }
  async function rejectOne(id) {
    if (!confirm('Reject (disable) this resident account?')) return;
    return runRow(id, () => Admin.reject(id), 'Account disabled.');
  }
  async function toggleActive(a) {
    return runRow(a.account_id, () => Admin.setActive(a.account_id, !a.is_active),
      a.is_active ? 'Account disabled.' : 'Account re-enabled.');
  }

  async function bulkApprove() {
    if (selected.size === 0) return;
    setBanner(null);
    try {
      const results = await bulk.run([...selected]);
      const ok = results.filter((r) => r.ok).length;
      const failed = results.length - ok;
      setBanner({
        tone: failed === 0 ? 'green' : 'amber',
        text: `Bulk approve: ${ok} approved${failed ? `, ${failed} failed` : ''}.`,
      });
      setSelected(new Set());
      await reload();
    } catch (err) {
      setBanner({ tone: 'red', text: err.message });
    }
  }

  return (
    <>
      <PageHeader
        title="Resident Accounts"
        subtitle="Approve, disable, or reset passwords for resident accounts."
        action={
          <Button onClick={bulkApprove} disabled={selected.size === 0 || bulk.busy}>
            <Check size={14} /> {bulk.busy ? 'Approving…' : `Bulk approve (${selected.size})`}
          </Button>
        }
      />

      <Card className="mb-4">
        <CardBody className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <Label>Search</Label>
            <Input placeholder="username or name" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <div>
            <Label>Status</Label>
            <Select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="">All statuses</option>
              <option value="pending">Pending</option>
              <option value="verified">Verified</option>
              <option value="disabled">Disabled</option>
            </Select>
          </div>
          <div className="flex items-end">
            <Button variant="outline" onClick={reload} className="w-full">Refresh</Button>
          </div>
        </CardBody>
      </Card>

      {banner && <Banner tone={banner.tone} onClose={() => setBanner(null)}>{banner.text}</Banner>}
      {error  && <Banner tone="red">{error}</Banner>}

      <Table>
        <THead>
          <TR>
            <TH className="w-10">
              <button onClick={toggleAll}>{allSelected ? <CheckSquare size={16}/> : <Square size={16}/>}</button>
            </TH>
            <TH>Username</TH>
            <TH>Name</TH>
            <TH>Mobile</TH>
            <TH>Barangay</TH>
            <TH>Status</TH>
            <TH>Created</TH>
            <TH className="text-right">Actions</TH>
          </TR>
        </THead>
        <TBody>
          {loading && <EmptyRow colSpan={8}>Loading…</EmptyRow>}
          {!loading && rows.length === 0 && <EmptyRow colSpan={8} />}
          {rows.map((a) => {
            const rowBusy = busyRow === a.account_id;
            return (
              <TR key={a.account_id}>
                <TD>
                  <button onClick={() => toggle(a.account_id)} disabled={rowBusy}>
                    {selected.has(a.account_id) ? <CheckSquare size={16}/> : <Square size={16}/>}
                  </button>
                </TD>
                <TD className="font-medium text-slate-900">{a.username}</TD>
                <TD>{[a.first_name, a.last_name].filter(Boolean).join(' ') || '—'}</TD>
                <TD className="font-mono text-xs">{a.mobile_number || '—'}</TD>
                <TD>{a.barangay_name || '—'}</TD>
                <TD>{statusBadge(a)}</TD>
                <TD className="text-slate-500 text-xs">{a.date_created ? new Date(a.date_created).toLocaleDateString() : '—'}</TD>
                <TD className="text-right">
                  <div className="inline-flex gap-1">
                    {!a.is_verified && a.is_active && (
                      <Button size="sm" onClick={() => approveOne(a.account_id)} disabled={rowBusy}>
                        <Check size={12}/> Approve
                      </Button>
                    )}
                    <Button size="sm" variant="outline" onClick={() => setPwModal(a)} title="Reset password" disabled={rowBusy}>
                      <KeyRound size={12}/>
                    </Button>
                    <Button size="sm" variant={a.is_active ? 'outline' : 'secondary'}
                            onClick={() => toggleActive(a)}
                            disabled={rowBusy}
                            title={a.is_active ? 'Disable' : 'Enable'}>
                      <Power size={12}/>
                    </Button>
                    {a.is_active && (
                      <Button size="sm" variant="danger" onClick={() => rejectOne(a.account_id)} title="Reject" disabled={rowBusy}>
                        <X size={12}/>
                      </Button>
                    )}
                  </div>
                </TD>
              </TR>
            );
          })}
        </TBody>
      </Table>

      <PasswordModal
        acc={pwModal}
        onClose={() => setPwModal(null)}
        onDone={(text) => { setBanner({ tone: 'green', text }); reload(); }}
        onError={(text) => setBanner({ tone: 'red', text })}
      />
    </>
  );
}

function Banner({ tone = 'red', children, onClose }) {
  const tones = {
    red:    'bg-red-50    text-red-800    border-red-200',
    green:  'bg-green-50  text-green-800  border-green-200',
    amber:  'bg-amber-50  text-amber-800  border-amber-200',
  };
  return (
    <div className={`mb-3 flex items-center justify-between gap-3 rounded-md border px-3 py-2 text-sm ${tones[tone]}`}>
      <span>{children}</span>
      {onClose && (
        <button onClick={onClose} className="text-current/70 hover:text-current">
          <X size={14}/>
        </button>
      )}
    </div>
  );
}

function PasswordModal({ acc, onClose, onDone, onError }) {
  const [pw, setPw]     = useState('');
  const [busy, setBusy] = useState(false);

  // Reset on open / when switching to a different account
  useEffect(() => { if (acc) setPw(''); }, [acc]);

  async function save() {
    setBusy(true);
    try {
      await Admin.resetPassword(acc.account_id, pw);
      onClose();
      onDone?.(`Password reset for ${acc.username}.`);
    } catch (err) {
      onError?.(err?.response?.data?.error || err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal open={!!acc} onClose={onClose} title={`Reset password — ${acc?.username || ''}`}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={busy}>Cancel</Button>
          <Button onClick={save} disabled={busy || pw.length < 6}>
            {busy ? 'Resetting…' : 'Reset'}
          </Button>
        </>
      }>
      <Label>New password (min 6 characters)</Label>
      <Input type="text" value={pw} onChange={(e) => setPw(e.target.value)} autoFocus />
    </Modal>
  );
}
