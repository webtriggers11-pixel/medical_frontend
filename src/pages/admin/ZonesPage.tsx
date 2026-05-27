import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useZones, useCreateZone, useUpdateZone, useDeleteZone } from '../../features/org/hooks/useOrg';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { SearchInput } from '../../components/ui/SearchInput';
import { SkeletonTable } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { getApiErrorMessage } from '../../lib/apiError';
import type { Zone } from '../../types/org.types';

const PlusIcon = (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
  </svg>
);

function ZoneModal({
  open, onClose, editing,
}: {
  open: boolean; onClose: () => void; editing: Zone | null;
}) {
  const createZone = useCreateZone();
  const updateZone = useUpdateZone();
  const [apiError, setApiError] = useState('');

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<{ name: string }>({
    defaultValues: editing ? { name: editing.name } : {},
  });

  const handleClose = () => { reset(); setApiError(''); onClose(); };

  const onSubmit = async ({ name }: { name: string }) => {
    setApiError('');
    try {
      if (editing) {
        await updateZone.mutateAsync({ id: editing.id, name });
      } else {
        await createZone.mutateAsync({ name });
      }
      handleClose();
    } catch (err) { setApiError(getApiErrorMessage(err)); }
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={editing ? 'Edit zone' : 'Add zone'}
      footer={
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={handleClose}>Cancel</Button>
          <Button type="submit" form="zone-form" loading={isSubmitting}>
            {editing ? 'Save changes' : 'Add zone'}
          </Button>
        </div>
      }
    >
      <form id="zone-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {apiError && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{apiError}</p>}
        <Input
          label="Zone name"
          required
          placeholder="e.g. North, South, East"
          {...register('name', { required: 'Required' })}
          error={errors.name?.message}
        />
      </form>
    </Modal>
  );
}

export function ZonesPage() {
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Zone | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Zone | null>(null);

  const { data: zones, isLoading, error } = useZones();
  const deleteZone = useDeleteZone();

  const filtered = zones?.filter((z) =>
    z.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleEdit = (z: Zone) => { setEditing(z); setModalOpen(true); };
  const handleClose = () => { setEditing(null); setModalOpen(false); };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Zones</h1>
          <p className="text-slate-500 mt-1">
            Geographic zone master list
            {zones && <span className="text-slate-400"> &middot; {zones.length} total</span>}
          </p>
        </div>
        <Button icon={PlusIcon} onClick={() => setModalOpen(true)}>Add zone</Button>
      </div>

      <div className="flex items-center gap-4">
        <SearchInput
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onClear={() => setSearch('')}
          placeholder="Search zones..."
          className="w-72"
        />
      </div>

      {isLoading && <SkeletonTable rows={4} />}

      {error && (
        <Card>
          <p className="text-sm text-red-600 font-medium">Failed to load zones. Please try again.</p>
        </Card>
      )}

      {filtered && filtered.length > 0 && (
        <Card padding="none">
          <div className="overflow-x-auto">
            <table className="w-full text-sm whitespace-nowrap">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Zone name</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Created</th>
                  <th className="px-5 py-3.5" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((z) => (
                  <tr key={z.id} className="group hover:bg-slate-50/70 transition-colors">
                    <td className="px-5 py-3.5 font-medium text-slate-900">{z.name}</td>
                    <td className="px-5 py-3.5">
                      <Badge variant={z.status === 'ACTIVE' ? 'success' : 'default'} size="sm">
                        {z.status.toLowerCase()}
                      </Badge>
                    </td>
                    <td className="px-5 py-3.5 text-slate-500 text-xs">
                      {new Date(z.createdAt).toLocaleDateString('en-IN')}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(z)}>Edit</Button>
                        <Button variant="ghost" size="sm" onClick={() => setDeleteTarget(z)}>Delete</Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {filtered?.length === 0 && !isLoading && (
        <Card>
          <EmptyState
            icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z" /></svg>}
            title={search ? 'No zones found' : 'No zones yet'}
            description={search ? `No results for "${search}"` : 'Add the first geographic zone.'}
            action={!search ? <Button size="sm" icon={PlusIcon} onClick={() => setModalOpen(true)}>Add zone</Button> : undefined}
          />
        </Card>
      )}

      <ZoneModal open={modalOpen} onClose={handleClose} editing={editing} />

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        loading={deleteZone.isPending}
        title="Delete zone"
        confirmLabel="Delete zone"
        message={<>Delete <strong>{deleteTarget?.name}</strong>? This cannot be undone.</>}
        onConfirm={() => {
          if (!deleteTarget) return;
          deleteZone.mutate(deleteTarget.id, { onSuccess: () => setDeleteTarget(null) });
        }}
      />
    </div>
  );
}
