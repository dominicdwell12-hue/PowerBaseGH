import { useAdminAuthContext } from '../context/AdminAuthContext.jsx';

export function useAdminAuth() {
  return useAdminAuthContext();
}
