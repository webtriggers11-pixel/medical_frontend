import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/auth.store';

export const Topbar = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6">
      <div />
      <div className="flex items-center gap-3">
        <div className="text-right">
          <p className="text-sm font-medium text-slate-900">{user?.email}</p>
          <p className="text-xs text-slate-500">{user?.role?.replace('_', ' ')}</p>
        </div>
        <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-semibold text-sm">
          {user?.email?.[0]?.toUpperCase()}
        </div>
        <button
          onClick={handleLogout}
          className="ml-2 text-sm text-slate-500 hover:text-red-600 transition-colors"
        >
          Logout
        </button>
      </div>
    </header>
  );
};
