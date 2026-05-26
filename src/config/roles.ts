import type { Role } from '../types/auth.types';

/**
 * Single source of truth for role values and access groups.
 * Add new roles or route-groups here so guards, gates and nav stay in sync.
 */
export const ROLES = {
  ADMIN: 'ADMIN',
  USER: 'USER',
} as const;

export const ALL_ROLES: Role[] = [ROLES.ADMIN, ROLES.USER];

/** Convenience access groups used by routes, the sidebar and <RoleGate />. */
export const ROLE_GROUPS = {
  adminOnly: [ROLES.ADMIN] as Role[],
  userOnly: [ROLES.USER] as Role[],
  everyone: ALL_ROLES,
};

/** True when `role` is allowed by `allowed` (a single role or list). */
export function hasRole(
  role: Role | null | undefined,
  allowed: Role | Role[],
): boolean {
  if (!role) return false;
  const list = Array.isArray(allowed) ? allowed : [allowed];
  return list.includes(role);
}

/** Human-readable label for a role. */
export function roleLabel(role: Role): string {
  return role.charAt(0) + role.slice(1).toLowerCase();
}
