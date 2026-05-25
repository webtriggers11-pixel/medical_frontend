import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/layout/Sidebar';
import { Topbar } from '../components/layout/Topbar';

export const DashboardLayout = () => (
  <div className="flex h-screen bg-slate-50 overflow-hidden">
    <Sidebar />
    <div className="flex flex-col flex-1 overflow-hidden">
      <Topbar />
      <main className="flex-1 overflow-y-auto p-6">
        <Outlet />
      </main>
    </div>
  </div>
);
