import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import {
  useUsers,
  useCreateClient,
  useSetClientActive,
  useDeleteClient,
} from '../../features/users/hooks/useUsers';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Avatar } from '../../components/ui/Avatar';
import { SearchInput } from '../../components/ui/SearchInput';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { SkeletonTable } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { Pagination } from '../../components/ui/Pagination';
import { usePagination } from '../../hooks/usePagination';
import { getApiErrorMessage } from '../../lib/apiError';
import type { CreateClientInput, UserRecord } from '../../types/user.types';

const PlusIcon = (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
  </svg>
);

// ── Add client modal ─────────────────────────────────────────────

function AddClientModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const createClient = useCreateClient();
  const [apiError, setApiError] = useState('');

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } =
    useForm<CreateClientInput>();

  const handleClose = () => { reset(); setApiError(''); onClose(); };

  const onSubmit = async (values: CreateClientInput) => {
    setApiError('');
    try {
      await createClient.mutateAsync({
        name: values.name,
        email: values.email,
        password: values.password,
        mobile: values.mobile,
      });
      handleClose();
    } catch (err) {
      setApiError(getApiErrorMessage(err));
    }
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Add client"
      size="lg"
      footer={
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={handleClose}>Cancel</Button>
          <Button type="submit" form="client-form" loading={isSubmitting}>Create client</Button>
        </div>
      }
    >
      <form id="client-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {apiError && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{apiError}</p>}
        <Input
          label="Client name"
          required
          {...register('name', { required: 'Required' })}
          error={errors.name?.message}
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Email"
            type="email"
            required
            {...register('email', { required: 'Required' })}
            error={errors.email?.message}
          />
          <Input
            label="Mobile"
            required
            {...register('mobile', {
              required: 'Required',
              pattern: { value: /^\d{10}$/, message: 'Must be 10 digits' },
            })}
            error={errors.mobile?.message}
          />
        </div>
        <Input
          label="Password"
          type="password"
          required
          placeholder="Min 8 characters — the client signs in with this"
          {...register('password', {
            required: 'Required',
            minLength: { value: 8, message: 'Must be at least 8 characters' },
          })}
          error={errors.password?.message}
        />
      </form>
    </Modal>
  );
}

// ── Main page ─────────────────────────────────────────────────────

export function ClientsPage() {
  const navigate = useNavigate();
  const { data: clients, isLoading, error } = useUsers();
  const setActive = useSetClientActive();
  const deleteClient = useDeleteClient();
  const [search, setSearch] = useState('');
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<UserRecord | null>(null);
  const [activeTarget, setActiveTarget] = useState<UserRecord | null>(null);

  const filtered = clients?.filter((c) => {
    const q = search.toLowerCase();
    return (
      c.email.toLowerCase().includes(q) ||
      (c.name ?? '').toLowerCase().includes(q) ||
      (c.mobile ?? '').toLowerCase().includes(q)
    );
  });

  const { page, setPage, totalPages, pageItems } = usePagination(filtered ?? [], { resetKey: search });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Clients</h1>
          <p className="text-slate-500 mt-1">
            Manage your clients
            {clients && <span className="text-slate-400"> · {clients.length} total</span>}
          </p>
        </div>
        <Button icon={PlusIcon} onClick={() => setAddModalOpen(true)}>Add client</Button>
      </div>

      <div className="flex items-center gap-3">
        <SearchInput
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onClear={() => setSearch('')}
          placeholder="Search clients..."
          className="w-full sm:w-72"
        />
      </div>

      {isLoading && <SkeletonTable rows={5} />}
      {error && <Card><p className="text-sm text-red-600 font-medium">Failed to load clients. Please try again.</p></Card>}

      {filtered && filtered.length > 0 && (
        <Card padding="none">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">ID</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Client</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Mobile</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Verified</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Joined</th>
                  <th className="px-5 py-3.5" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {pageItems.map((client) => (
                  <tr
                    key={client.id}
                    className="group hover:bg-slate-50/70 transition-colors cursor-pointer"
                    onClick={() => navigate(`/admin/clients/${client.id}`)}
                  >
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <span className="text-xs font-mono font-semibold text-slate-400">{client.clientId ?? '—'}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <Avatar name={client.name ?? client.email} size="sm" />
                        <div>
                          <p className="font-medium text-slate-900 group-hover:text-primary-600 transition-colors">
                            {client.name ?? client.email.split('@')[0]}
                          </p>
                          <p className="text-xs text-slate-500">{client.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-slate-600">{client.mobile ?? '—'}</td>
                    <td className="px-5 py-3.5">
                      <Badge variant={client.isActive ? 'success' : 'danger'} dot size="sm">
                        {client.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td className="px-5 py-3.5">
                      {client.isEmailVerified
                        ? <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        : <svg className="w-5 h-5 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      }
                    </td>
                    <td className="px-5 py-3.5 text-slate-500">
                      {new Date(client.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="px-5 py-3.5" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="sm"
                          loading={setActive.isPending && setActive.variables?.id === client.id}
                          onClick={() => setActiveTarget(client)}
                        >
                          {client.isActive ? 'Deactivate' : 'Activate'}
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => setDeleteTarget(client)}>
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div className="flex justify-end px-5 py-3 border-t border-border">
              <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
            </div>
          )}
        </Card>
      )}

      {filtered && filtered.length === 0 && search && (
        <Card>
          <EmptyState
            icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></svg>}
            title="No clients found"
            description={`No results for "${search}".`}
            action={<Button variant="secondary" size="sm" onClick={() => setSearch('')}>Clear search</Button>}
          />
        </Card>
      )}

      {filtered && filtered.length === 0 && !search && (
        <Card>
          <EmptyState
            icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>}
            title="No clients yet"
            description="Get started by creating your first client."
            action={<Button size="sm" icon={PlusIcon} onClick={() => setAddModalOpen(true)}>Add client</Button>}
          />
        </Card>
      )}

      <AddClientModal open={addModalOpen} onClose={() => setAddModalOpen(false)} />

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        loading={deleteClient.isPending}
        title="Delete client"
        confirmLabel="Delete client"
        message={<>Delete <strong>{deleteTarget?.name ?? deleteTarget?.email}</strong>? This cannot be undone.</>}
        onConfirm={() => {
          if (!deleteTarget) return;
          deleteClient.mutate(deleteTarget.id, { onSuccess: () => setDeleteTarget(null) });
        }}
      />

      <ConfirmDialog
        open={!!activeTarget}
        onClose={() => setActiveTarget(null)}
        loading={setActive.isPending}
        variant={activeTarget?.isActive ? 'danger' : 'primary'}
        title={activeTarget?.isActive ? 'Deactivate client' : 'Activate client'}
        confirmLabel={activeTarget?.isActive ? 'Deactivate' : 'Activate'}
        message={
          activeTarget?.isActive ? (
            <>Deactivate <strong>{activeTarget?.name ?? activeTarget?.email}</strong>? They will be signed out and unable to log in until reactivated.</>
          ) : (
            <>Activate <strong>{activeTarget?.name ?? activeTarget?.email}</strong>? They will be able to log in again.</>
          )
        }
        onConfirm={() => {
          if (!activeTarget) return;
          setActive.mutate(
            { id: activeTarget.id, isActive: !activeTarget.isActive },
            { onSuccess: () => setActiveTarget(null) },
          );
        }}
      />
    </div>
  );
}
