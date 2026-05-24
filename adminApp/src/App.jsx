import { Routes, Route, Navigate } from 'react-router-dom';
import { RequireAuth } from './auth/RequireAuth';
import { AppLayout } from './components/layout/AppLayout';

import Login      from './pages/Login.jsx';
import Dashboard  from './pages/Dashboard.jsx';
import Accounts   from './pages/Accounts.jsx';
import Residents  from './pages/Residents.jsx';
import SosRecords from './pages/SosRecords.jsx';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<RequireAuth><AppLayout /></RequireAuth>}>
        <Route path="/"          element={<Dashboard />} />
        <Route path="/accounts"  element={<Accounts />} />
        <Route path="/residents" element={<Residents />} />
        <Route path="/sos"       element={<SosRecords />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
