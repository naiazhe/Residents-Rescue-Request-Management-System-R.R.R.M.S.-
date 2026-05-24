import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { Button } from '../components/ui/Button';
import { Input, Label } from '../components/ui/Input';
import { ShieldCheck } from 'lucide-react';

export default function Login() {
  const { login, user, ready } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (ready && user?.role === 'super_admin') {
      navigate('/', { replace: true });
    }
  }, [ready, user, navigate]);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  async function onSubmit(e) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await login(username.trim(), password);
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-full flex items-center justify-center px-4 py-12 bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-2 mb-6">
          <div className="rounded-lg bg-brand-600 p-2 text-white"><ShieldCheck size={20} /></div>
          <div>
            <div className="font-bold text-slate-900">Naga Rescue</div>
            <div className="text-xs text-slate-500">Super Admin Console</div>
          </div>
        </div>

        <div className="rounded-xl bg-white p-6 shadow-card border border-slate-100">
          <h1 className="text-lg font-semibold text-slate-900">Sign in</h1>
          <p className="text-sm text-slate-500 mt-1">Use your super admin credentials.</p>

          <form className="mt-5 space-y-4" onSubmit={onSubmit}>
            <div>
              <Label htmlFor="u">Username</Label>
              <Input id="u" value={username} onChange={(e) => setUsername(e.target.value)} autoFocus required />
            </div>
            <div>
              <Label htmlFor="p">Password</Label>
              <Input id="p" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            {error && (
              <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
            )}
            <Button type="submit" className="w-full" disabled={busy}>
              {busy ? 'Signing in…' : 'Sign in'}
            </Button>
          </form>
        </div>

        <p className="mt-4 text-center text-xs text-slate-400">
          Seeded default: <code>admin</code> / <code>admin12345</code>
        </p>
      </div>
    </div>
  );
}
