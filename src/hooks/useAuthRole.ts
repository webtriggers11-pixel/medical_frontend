import { useAuthStore } from '../store/auth.store';
import { hasRole, ROLES } from '../config/roles';
import type { Role } from '../types/auth.types';

/**
 * Central role-awareness hook. Read the current user's role and check access
 * without each component reaching into the store or hardcoding role strings.
 */
export function useAuthRole() {
  const role = useAuthStore((s) => s.user?.role) ?? null;

  return {
    role,
    isAdmin: role === ROLES.ADMIN,
    isUser: role === ROLES.USER,
    /** True if the current role is in the allowed set. */
    can: (allowed: Role | Role[]) => hasRole(role, allowed),
  };
}
