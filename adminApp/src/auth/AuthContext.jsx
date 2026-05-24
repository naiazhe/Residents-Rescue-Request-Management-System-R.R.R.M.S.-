import { createContext, useContext, useEffect, useState } from 'react';
import { Auth } from '../api/endpoints';
import { setToken, getToken } from '../api/client';

const AuthContext = createContext(null);
const USER_KEY = 'naga_admin_user';

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [ready, setReady]     = useState(false);
  const [error, setError]     = useState(null);

  useEffect(() => {
    const raw = localStorage.getItem(USER_KEY);
    if (raw && getToken()) {
      try { setUser(JSON.parse(raw)); } catch {}
    }
    setReady(true);
  }, []);

  async function login(username, password) {
    setError(null);
    try {
      const data = await Auth.login(username, password);
      if (data.role !== 'super_admin') {
        throw new Error('This account is not a super admin.');
      }
      setToken(data.token);
      localStorage.setItem(USER_KEY, JSON.stringify(data));
      setUser(data);
      return data;
    } catch (err) {
      const msg = err?.response?.data?.error || err.message || 'Login failed';
      setError(msg);
      throw new Error(msg);
    }
  }

  function logout() {
    setToken(null);
    localStorage.removeItem(USER_KEY);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, ready, error, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
