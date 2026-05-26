import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';
import { hasRole } from '../config/roles';
import type { Role } from '../types/auth.types';

interface RoleRouteProps {
  allowedRoles: Role[];
}

/**
 * Route-level RBAC gate. Shares its role logic with <RoleGate /> via
 * config/roles so route protection and inline gating never drift apart.
 */
export const RoleRoute = ({ allowedRoles }: RoleRouteProps) => {
  const user = useAuthStore((s) => s.user);

  if (!user) return <Navigate to="/login" replace />;
  if (!hasRole(user.role, allowedRoles)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};
