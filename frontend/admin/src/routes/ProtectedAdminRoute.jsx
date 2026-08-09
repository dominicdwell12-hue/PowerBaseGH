import { Navigate, Outlet } from 'react-router-dom';
import Spinner from '../components/common/Spinner.jsx';
import { useAdminAuth } from '../hooks/useAdminAuth.js';

export default function ProtectedAdminRoute() {
  const { isAuthenticated, isLoading } = useAdminAuth();

  if (isLoading) return <Spinner label="Checking your session" />;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
