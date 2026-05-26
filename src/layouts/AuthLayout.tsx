import { Outlet, Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';

export function AuthLayout() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  return (
    <div className="min-h-full bg-canvas flex">
      {/* Left side - Brand panel */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-[45%] bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 relative overflow-hidden">
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
            </div>
            <span className="text-xl font-bold text-white">MediSync</span>
          </div>
          <div>
            <h1 className="text-4xl xl:text-5xl font-bold text-white leading-tight mb-4">
              Medical Management
              <br />
              <span className="text-primary-200">Made Simple</span>
            </h1>
            <p className="text-primary-200 text-lg max-w-md leading-relaxed">
              Streamline your healthcare operations with a modern, secure platform built for medical professionals.
            </p>
          </div>
          <p className="text-primary-300 text-sm">
            &copy; {new Date().getFullYear()} MediSync. All rights reserved.
          </p>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-1/4 -right-20 w-80 h-80 rounded-full bg-white/5" />
        <div className="absolute -bottom-10 -left-10 w-60 h-60 rounded-full bg-white/5" />
        <div className="absolute top-10 right-20 w-40 h-40 rounded-full bg-white/5" />
      </div>

      {/* Right side - Form */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-12 xl:px-20">
        <div className="w-full max-w-md mx-auto">
          {/* Mobile logo */}
          <div className="text-center mb-8 lg:hidden">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 mb-4">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">MediSync</h1>
            <p className="text-sm text-slate-500 mt-1">Medical Management System</p>
          </div>

          <Outlet />
        </div>
      </div>
    </div>
  );
}
