import { NavLink } from 'react-router-dom';
import { useAuthStore } from '../../store/auth.store';

const navItems = [
  { label: 'Dashboard', path: '/dashboard', roles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'USER'] },
  { label: 'Users', path: '/admin/users', roles: ['SUPER_ADMIN', 'ADMIN'] },
];

export const Sidebar = () => {
  const user = useAuthStore((s) => s.user);

  const visibleItems = navItems.filter(
    (item) => user && item.roles.includes(user.role),
  );

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col">
      <div className="h-16 flex items-center px-6 border-b border-slate-200">
        <span className="text-xl font-bold text-blue-700">MediSync</span>
      </div>
      <nav className="flex-1 py-4 px-3">
        {visibleItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center px-3 py-2.5 rounded-lg mb-1 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="p-4 border-t border-slate-200">
        <p className="text-xs text-slate-400 truncate">{user?.email}</p>
        <span className="inline-block mt-1 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
          {user?.role?.replace('_', ' ')}
        </span>
      </div>
    </aside>
  );
};
