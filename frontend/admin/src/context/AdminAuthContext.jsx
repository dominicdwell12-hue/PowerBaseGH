import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import * as authApi from '../api/authApi.js';
import { setAccessToken, setSessionExpiredHandler } from '../api/axiosClient.js';

const AdminAuthContext = createContext(null);

export function AdminAuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // On first load, trade a lingering refresh cookie for a fresh access
  // token before deciding the admin is logged out — same pattern as the
  // storefront's AuthContext, since both hit the same /auth/refresh.
  useEffect(() => {
    let cancelled = false;

    setSessionExpiredHandler(() => {
      if (!cancelled) setUser(null);
    });

    (async () => {
      try {
        const { accessToken } = await authApi.refresh();
        setAccessToken(accessToken);
        const me = await authApi.fetchMe();
        // A customer's leftover refresh cookie should never grant admin access.
        if (me.role !== 'admin') throw new Error('Not an admin account');
        if (!cancelled) setUser(me);
      } catch {
        setAccessToken(null);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (payload) => {
    const { user: loggedInUser, accessToken } = await authApi.adminLogin(payload);
    setAccessToken(accessToken);
    setUser(loggedInUser);
    return loggedInUser;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } finally {
      setAccessToken(null);
      setUser(null);
    }
  }, []);

  const value = useMemo(
    () => ({ user, isAuthenticated: Boolean(user), isLoading, login, logout }),
    [user, isLoading, login, logout]
  );

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}

export function useAdminAuthContext() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error('useAdminAuthContext must be used within AdminAuthProvider');
  return ctx;
}
