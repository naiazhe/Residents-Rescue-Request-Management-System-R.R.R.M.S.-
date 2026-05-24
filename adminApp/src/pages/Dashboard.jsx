import { Admin } from '../api/endpoints';
import { useAsync } from '../hooks/useAsync';
import { Card, CardBody, CardHeader } from '../components/ui/Card';
import { PageHeader } from '../components/layout/AppLayout';
import { Users, ClipboardCheck, ShieldOff, UserCheck, Siren, Activity } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';

function StatCard({ icon: Icon, label, value, tone = 'blue', sub }) {
  const tones = {
    blue:  'bg-blue-50  text-blue-700',
    green: 'bg-green-50 text-green-700',
    amber: 'bg-amber-50 text-amber-700',
    red:   'bg-red-50   text-red-700',
    slate: 'bg-slate-100 text-slate-700',
  };
  return (
    <Card>
      <CardBody className="flex items-start gap-3">
        <div className={`rounded-lg p-2.5 ${tones[tone]}`}><Icon size={18} /></div>
        <div className="min-w-0">
          <div className="text-xs uppercase tracking-wide text-slate-500">{label}</div>
          <div className="text-2xl font-bold text-slate-900">{value ?? '—'}</div>
          {sub && <div className="text-xs text-slate-500 mt-0.5">{sub}</div>}
        </div>
      </CardBody>
    </Card>
  );
}

export default function Dashboard() {
  const { data, loading, error } = useAsync(() => Admin.dashboard());
  const brg = useAsync(() => Admin.residentsByBarangay());

  return (
    <>
      <PageHeader title="Dashboard" subtitle="Resident overview." />

      {error && (
        <div className="mb-4 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 mb-6">
        <StatCard icon={Users}          label="Total residents"   value={data?.totalResidents} />
        <StatCard icon={ClipboardCheck} label="Pending approvals" value={data?.pendingResidents} tone="amber" />
        <StatCard icon={UserCheck}      label="Verified accounts" value={data?.verifiedResidents} tone="green" />
        <StatCard icon={ShieldOff}      label="Disabled accounts" value={data?.disabledResidents} tone="slate" />
        <StatCard icon={Siren}          label="Active SOS"        value={data?.activeSos}         tone="red" />
        <StatCard icon={Activity}       label="Total SOS records" value={data?.totalSos}          tone="blue" />
      </div>

      <Card>
        <CardHeader title="Residents per barangay" subtitle="Distribution across barangays" />
        <CardBody style={{ height: 320 }}>
          <ResponsiveContainer>
            <BarChart data={brg.data || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="barangay_name" tick={{ fontSize: 10 }} interval={0} angle={-30} textAnchor="end" height={70} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="residents" fill="#2563eb" />
            </BarChart>
          </ResponsiveContainer>
        </CardBody>
      </Card>

      {loading && <div className="mt-4 text-xs text-slate-500">Loading…</div>}
    </>
  );
}
