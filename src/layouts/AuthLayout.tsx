import { Outlet, Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';
import { Logo } from '../components/ui/Logo';
import { BrandName } from '../components/ui/BrandName';
import { BRAND_NAME, BRAND_TAGLINE } from '../config/brand';

export function AuthLayout() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  return (
    <div className="min-h-full bg-canvas flex">
      {/* Left side - Brand panel */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-[45%] bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 relative overflow-hidden">
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          <div className="inline-flex items-center gap-3 self-start bg-white rounded-xl px-4 py-2.5 shadow-sm">
            <Logo variant="mark" className="h-9" />
            <BrandName size="md" />
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
            &copy; {new Date().getFullYear()} {BRAND_NAME}. All rights reserved.
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
          <div className="flex flex-col items-center text-center mb-8 lg:hidden">
            <Logo variant="mark" className="h-12 mb-3" />
            <BrandName size="lg" />
            <p className="text-sm text-slate-500 mt-1">{BRAND_TAGLINE}</p>
          </div>

          <Outlet />
        </div>
      </div>
    </div>
  );
}
