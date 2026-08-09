import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../../hooks/useAdminAuth.js';

export default function Topbar() {
  const { user, logout } = useAdminAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate('/login', { replace: true });
  }

  return (
    <header className="flex items-center justify-between border-b border-ink-50 bg-white px-6 py-3">
      <p className="text-sm text-ash">
        Signed in as <span className="font-medium text-ink-900">{user?.firstName} {user?.lastName}</span>
      </p>
      <button
        type="button"
        onClick={handleLogout}
        className="text-sm font-medium text-brick-600 hover:underline"
      >
        Sign out
      </button>
    </header>
  );
}
