import { useAuthStore } from '../../store/auth.store';

export const DashboardPage = () => {
  const user = useAuthStore((s) => s.user);

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-1">Dashboard</h1>
      <p className="text-slate-500 mb-8">Welcome back, {user?.email}</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <p className="text-sm text-slate-500">Role</p>
          <p className="text-xl font-semibold text-slate-900 mt-1">{user?.role?.replace('_', ' ')}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <p className="text-sm text-slate-500">Status</p>
          <p className="text-xl font-semibold text-green-600 mt-1">Active</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <p className="text-sm text-slate-500">Email verified</p>
          <p className="text-xl font-semibold text-green-600 mt-1">Yes</p>
        </div>
      </div>
    </div>
  );
};
