import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/auth.store';
import { useUIStore } from '../../store/ui.store';
import { roleLabel } from '../../config/roles';
import { useInstallPrompt } from '../../hooks/useInstallPrompt';
import { Logo } from '../ui/Logo';
import { BrandName } from '../ui/BrandName';
import type { Role } from '../../types/auth.types';

interface NavChild {
  label: string;
  path: string;
  roles?: Role[];
}

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
  roles?: Role[];
  children?: NavChild[];
}

const navItems: NavItem[] = [
  {
    label: 'Dashboard',
    path: '/dashboard',
    // Admin-only sub-items; clients see Dashboard as a plain link.
    children: [
      { label: 'Stats', path: '/admin/stats', roles: ['ADMIN'] },
      { label: 'Export', path: '/admin/export', roles: ['ADMIN'] },
    ],
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
      </svg>
    ),
  },
  // USER routes
  {
    label: 'Manage Candidate',
    path: '/candidates',
    roles: ['USER'],
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM3 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 019.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
      </svg>
    ),
  },
  {
    label: 'Stores',
    path: '/stores',
    roles: ['USER'],
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.015a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.75c0 .415.336.75.75.75z" />
      </svg>
    ),
  },
  {
    label: 'Reports',
    path: '/reports',
    roles: ['USER'],
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
      </svg>
    ),
  },
  // ADMIN routes
  {
    label: 'Clients',
    path: '/admin/clients',
    roles: ['ADMIN'],
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
      </svg>
    ),
  },
  {
    label: 'Zone & City',
    path: '/admin/zone-city',
    roles: ['ADMIN'],
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
      </svg>
    ),
  },
  {
    label: 'Stores',
    path: '/admin/stores',
    roles: ['ADMIN'],
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.015a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.75c0 .415.336.75.75.75z" />
      </svg>
    ),
  },
  {
    label: 'Labs',
    path: '/admin/labs',
    roles: ['ADMIN'],
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
      </svg>
    ),
  },
  {
    label: 'Tests',
    path: '/admin/tests',
    roles: ['ADMIN'],
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
      </svg>
    ),
  },
  {
    label: 'Panels',
    path: '/admin/panels',
    roles: ['ADMIN'],
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.35 3.836c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m8.9-4.414c.376.023.75.05 1.124.08 1.131.094 1.976 1.057 1.976 2.192V16.5A2.25 2.25 0 0118 18.75h-2.25m-7.5-10.5H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V18.75m-7.5-10.5h6.375c.621 0 1.125.504 1.125 1.125v9.375m-8.25-3l1.5 1.5 3-3.75" />
      </svg>
    ),
  },
];

export function Sidebar() {
  const user = useAuthStore((s) => s.user);
  const { sidebarCollapsed, setSidebarCollapsed } = useUIStore();
  const { canInstall, isInstalled, install } = useInstallPrompt();
  const isAdmin = user?.role === 'ADMIN';

  const location = useLocation();
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});

  const canSee = (roles?: Role[]) => !roles || (user?.role != null && roles.includes(user.role));
  const filteredItems = navItems.filter((item) => canSee(item.roles));

  const closeOnMobile = () => {
    if (window.innerWidth < 1024) setSidebarCollapsed(true);
  };

  const leafClass = (isActive: boolean) =>
    `group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
      isActive ? 'bg-primary-50 text-primary-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
    } ${sidebarCollapsed ? 'lg:justify-center' : ''}`;

  return (
    <>
      {/* Mobile overlay */}
      {!sidebarCollapsed && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/20 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarCollapsed(true)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-40 h-full bg-surface border-r border-border
          flex flex-col
          transition-all duration-300 ease-out
          lg:static lg:z-auto
          ${sidebarCollapsed ? '-translate-x-full lg:translate-x-0 lg:w-[72px]' : 'translate-x-0 w-64'}
        `}
      >
        {/* Logo */}
        <div className="h-16 flex items-center gap-2.5 border-b border-border px-4 shrink-0 overflow-hidden">
          <Logo variant="mark" className="h-8 shrink-0" />
          <BrandName
            size="xs"
            wrap
            className={`min-w-0 transition-opacity duration-200 ${
              sidebarCollapsed ? 'lg:opacity-0 lg:w-0' : 'opacity-100'
            }`}
          />
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          <p
            className={`px-3 mb-2 text-[11px] font-semibold tracking-wider text-slate-400 uppercase transition-opacity duration-200 ${
              sidebarCollapsed ? 'lg:opacity-0' : ''
            }`}
          >
            Menu
          </p>
          {filteredItems.map((item) => {
            const children = (item.children ?? []).filter((c) => canSee(c.roles));
            const hasGroup = children.length > 0 && !sidebarCollapsed;

            // Parent's own page is active only on its exact path (`end`), so it
            // doesn't stay highlighted while a child route is open.
            const childActive = children.some((c) => location.pathname.startsWith(c.path));
            const open = openGroups[item.label] ?? (location.pathname === item.path || childActive);

            return (
              <div key={item.path}>
                <div className="flex items-center gap-1">
                  <NavLink
                    to={item.path}
                    end
                    onClick={closeOnMobile}
                    className={({ isActive }) => `flex-1 ${leafClass(isActive)}`}
                  >
                    {({ isActive }) => (
                      <>
                        <span className={`shrink-0 transition-colors ${isActive ? 'text-primary-600' : 'text-slate-400 group-hover:text-slate-600'}`}>
                          {item.icon}
                        </span>
                        <span className={`whitespace-nowrap transition-opacity duration-200 ${sidebarCollapsed ? 'lg:hidden' : ''}`}>
                          {item.label}
                        </span>
                      </>
                    )}
                  </NavLink>
                  {hasGroup && (
                    <button
                      type="button"
                      aria-label={open ? `Collapse ${item.label}` : `Expand ${item.label}`}
                      onClick={() => setOpenGroups((m) => ({ ...m, [item.label]: !open }))}
                      className="shrink-0 rounded-lg p-1.5 text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-colors"
                    >
                      <svg className={`w-4 h-4 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                      </svg>
                    </button>
                  )}
                </div>

                {hasGroup && open && (
                  <div className="mt-1 ml-5 space-y-1 border-l border-border pl-3">
                    {children.map((child) => (
                      <NavLink
                        key={child.path}
                        to={child.path}
                        onClick={closeOnMobile}
                        className={({ isActive }) =>
                          `flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                            isActive ? 'bg-primary-50 text-primary-700' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                          }`
                        }
                      >
                        {({ isActive }) => (
                          <>
                            <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${isActive ? 'bg-primary-500' : 'bg-slate-300'}`} />
                            {child.label}
                          </>
                        )}
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Install App — admin only */}
        {isAdmin && (canInstall || isInstalled) && (
          <div className={`px-3 pb-2 shrink-0 ${sidebarCollapsed ? 'lg:px-2' : ''}`}>
            {isInstalled ? (
              <div
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-emerald-600 ${
                  sidebarCollapsed ? 'lg:justify-center' : ''
                }`}
              >
                <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className={`whitespace-nowrap text-xs font-medium ${sidebarCollapsed ? 'lg:hidden' : ''}`}>
                  App installed
                </span>
              </div>
            ) : (
              <button
                onClick={install}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-primary-50 hover:text-primary-700 transition-all duration-200 ${
                  sidebarCollapsed ? 'lg:justify-center' : ''
                }`}
              >
                <svg className="w-5 h-5 shrink-0 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                </svg>
                <span className={`whitespace-nowrap ${sidebarCollapsed ? 'lg:hidden' : ''}`}>
                  Install App
                </span>
              </button>
            )}
          </div>
        )}

        {/* Footer */}
        <div className={`border-t border-border p-4 shrink-0 ${sidebarCollapsed ? 'lg:px-2' : ''}`}>
          <div
            className={`flex items-center gap-3 ${sidebarCollapsed ? 'lg:justify-center' : ''}`}
          >
            <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-xs font-bold text-primary-700 shrink-0">
              {user?.email?.[0]?.toUpperCase() ?? 'U'}
            </div>
            <div
              className={`min-w-0 transition-opacity duration-200 ${
                sidebarCollapsed ? 'lg:hidden' : ''
              }`}
            >
              <p className="text-sm font-medium text-slate-900 truncate">
                {user?.email?.split('@')[0]}
              </p>
              <p className="text-[11px] text-slate-500">
                {user?.role ? roleLabel(user.role) : ''}
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
