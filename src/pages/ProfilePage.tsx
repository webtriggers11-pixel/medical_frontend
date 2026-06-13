import type { ReactNode } from 'react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Avatar } from '../components/ui/Avatar';
import { SkeletonTable } from '../components/ui/Skeleton';
import { useMe } from '../features/auth/hooks/useMe';
import { useAuthStore } from '../store/auth.store';
import { roleLabel } from '../config/roles';

const fmtDate = (d?: string | null) =>
  d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : '—';

function Field({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="py-3.5">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">{label}</p>
      <div className="mt-1 text-sm font-medium text-slate-800">{value}</div>
    </div>
  );
}

export function ProfilePage() {
  // Fall back to the stored auth user while /auth/me loads.
  const stored = useAuthStore((s) => s.user);
  const { data, isLoading } = useMe();
  const user = data ?? stored;

  if (isLoading && !stored) return <SkeletonTable rows={5} />;
  if (!user) {
    return (
      <Card>
        <p className="text-sm font-medium text-red-600">Could not load your profile. Please try again.</p>
      </Card>
    );
  }

  const displayName = user.name?.trim() || user.email.split('@')[0];
  const isAdmin = user.role === 'ADMIN';

  return (
    <div className="mx-auto max-w-3xl space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">My Profile</h1>
        <p className="text-slate-500 mt-1">Your account details.</p>
      </div>

      {/* Identity header */}
      <Card>
        <div className="flex items-center gap-4">
          <Avatar name={displayName} size="lg" />
          <div className="min-w-0">
            <p className="text-lg font-bold capitalize text-slate-900 truncate">{displayName}</p>
            <p className="text-sm text-slate-500 truncate">{user.email}</p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <Badge variant={isAdmin ? 'primary' : 'info'} size="sm">{roleLabel(user.role)}</Badge>
              <Badge variant={user.isActive ? 'success' : 'danger'} size="sm" dot>
                {user.isActive ? 'Active' : 'Inactive'}
              </Badge>
            </div>
          </div>
        </div>
      </Card>

      {/* Details */}
      <Card>
        <div className="grid grid-cols-1 gap-x-8 sm:grid-cols-2 divide-y divide-border sm:divide-y-0">
          {!isAdmin && <Field label="Client ID" value={<span className="font-mono">{user.clientId || '—'}</span>} />}
          <Field label="Full name" value={user.name?.trim() || '—'} />
          <Field label="Email" value={user.email} />
          <Field label="Mobile" value={user.mobile?.trim() || '—'} />
          <Field label="Role" value={roleLabel(user.role)} />
          <Field
            label="Email verified"
            value={
              <Badge variant={user.isEmailVerified ? 'success' : 'warning'} size="sm">
                {user.isEmailVerified ? 'Verified' : 'Not verified'}
              </Badge>
            }
          />
          <Field label="Member since" value={fmtDate(user.createdAt)} />
        </div>
      </Card>
    </div>
  );
}
