import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';
import type { Role } from '../types/auth.types';

interface RoleRouteProps {
  allowedRoles: Role[];
}

export const RoleRoute = ({ allowedRoles }: RoleRouteProps) => {
  const user = useAuthStore((s) => s.user);

  if (!user) return <Navigate to="/login" replace />;
  if (!allowedRoles.includes(user.role)) return <Navigate to="/unauthorized" replace />;

  return <Outlet />;
};
