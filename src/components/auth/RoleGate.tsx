import type { ReactNode } from 'react';
import { useAuthRole } from '../../hooks/useAuthRole';
import type { Role } from '../../types/auth.types';

interface RoleGateProps {
  /** Roles permitted to see the children. Single role or a list. */
  allow: Role | Role[];
  /** Rendered to permitted roles. */
  children: ReactNode;
  /** Optional content shown when the current role is not permitted. */
  fallback?: ReactNode;
}

/**
 * Reusable inline role gate. Wrap any UI to show it only to specific roles.
 *
 *   <RoleGate allow="ADMIN">           <AdminPanel /> </RoleGate>
 *   <RoleGate allow={['ADMIN','USER']}> <Shared />     </RoleGate>
 *   <RoleGate allow="USER" fallback={<Locked />}> ... </RoleGate>
 *
 * For whole-route protection use <RoleRoute> instead — both share the same
 * role logic via useAuthRole / config/roles.
 */
export function RoleGate({ allow, children, fallback = null }: RoleGateProps) {
  const { can } = useAuthRole();
  return <>{can(allow) ? children : fallback}</>;
}
