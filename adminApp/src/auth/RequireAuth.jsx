import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';

export function RequireAuth({ children }) {
  const { user, ready } = useAuth();
  const location = useLocation();

  if (!ready) return null;
  if (!user || user.role !== 'super_admin') {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  return children;
}
