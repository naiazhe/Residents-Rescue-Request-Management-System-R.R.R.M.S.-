import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, UserCog, Siren, LogOut } from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';
import { cn } from '../../lib/cn';

const NAV = [
  { to: '/',          label: 'Dashboard',         icon: LayoutDashboard },
  { to: '/accounts',  label: 'Resident Accounts', icon: UserCog },
  { to: '/residents', label: 'Residents',         icon: Users },
  { to: '/sos',       label: 'SOS Records',       icon: Siren },
];

export function Sidebar() {
  const { user, logout } = useAuth();

  return (
    <aside className="hidden md:flex md:w-64 md:flex-col border-r border-slate-200 bg-white">
      <div className="px-5 py-5 border-b border-slate-100">
        <div className="text-base font-bold text-slate-900">Naga Rescue</div>
        <div className="text-xs text-slate-500">Resident Admin Console</div>
      </div>
      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {NAV.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition',
                isActive
                  ? 'bg-brand-50 text-brand-700'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
              )
            }
          >
            <Icon size={16} />
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="border-t border-slate-100 p-3">
        <div className="px-3 py-2">
          <div className="text-sm font-semibold text-slate-900 truncate">{user?.fullName || user?.username}</div>
          <div className="text-xs text-slate-500">{user?.role}</div>
        </div>
        <button
          onClick={logout}
          className="w-full mt-1 flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-100"
        >
          <LogOut size={16} /> Sign out
        </button>
      </div>
    </aside>
  );
}
