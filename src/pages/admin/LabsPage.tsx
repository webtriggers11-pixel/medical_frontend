import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useLabs, useCreateLab, useUpdateLab, useDeleteLab } from '../../features/lab/hooks/useLabs';
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
import type { Lab, CreateLabInput } from '../../types/lab.types';

const PlusIcon = (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
  </svg>
);

interface LabFormValues {
  name: string;
  contactName: string;
  contactMobile: string;
  email: string;
}

function LabModal({ open, onClose, editing }: { open: boolean; onClose: () => void; editing: Lab | null }) {
  const createLab = useCreateLab();
  const updateLab = useUpdateLab();
  const [apiError, setApiError] = useState('');

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<LabFormValues>({
    defaultValues: editing
      ? { name: editing.name, contactName: editing.contactName, contactMobile: editing.contactMobile, email: editing.email }
      : {},
  });

  const handleClose = () => { reset(); setApiError(''); onClose(); };

  const onSubmit = async (values: LabFormValues) => {
    setApiError('');
    try {
      if (editing) {
        await updateLab.mutateAsync({ id: editing.id, input: values });
      } else {
        await createLab.mutateAsync(values as CreateLabInput);
      }
      handleClose();
    } catch (err) {
      setApiError(getApiErrorMessage(err));
    }
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={editing ? 'Edit lab' : 'Add lab'}
      footer={
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={handleClose}>Cancel</Button>
          <Button type="submit" form="lab-form" loading={isSubmitting}>
            {editing ? 'Save changes' : 'Create lab'}
          </Button>
        </div>
      }
    >
      <form id="lab-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {apiError && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{apiError}</p>}
        <Input
          label="Lab name"
          required
          {...register('name', { required: 'Required' })}
          error={errors.name?.message}
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Contact name"
            required
            {...register('contactName', { required: 'Required' })}
            error={errors.contactName?.message}
          />
          <Input
            label="Contact mobile"
            required
            {...register('contactMobile', {
              required: 'Required',
              pattern: { value: /^\d{10}$/, message: 'Must be 10 digits' },
            })}
            error={errors.contactMobile?.message}
          />
        </div>
        <Input
          label="Email"
          type="email"
          required
          {...register('email', { required: 'Required' })}
          error={errors.email?.message}
        />
      </form>
    </Modal>
  );
}

export function LabsPage() {
  const { data: labs, isLoading, error } = useLabs();
  const deleteLab = useDeleteLab();
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Lab | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Lab | null>(null);

  const filtered = labs?.filter((l) => {
    const q = search.toLowerCase();
    return l.name.toLowerCase().includes(q) || l.email.toLowerCase().includes(q) || l.contactName.toLowerCase().includes(q);
  });

  const handleEdit = (l: Lab) => { setEditing(l); setModalOpen(true); };
  const handleClose = () => { setEditing(null); setModalOpen(false); };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Labs</h1>
          <p className="text-slate-500 mt-1">
            Manage diagnostic labs
            {labs && <span className="text-slate-400"> &middot; {labs.length} total</span>}
          </p>
        </div>
        <Button icon={PlusIcon} onClick={() => setModalOpen(true)}>Add lab</Button>
      </div>

      <SearchInput
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        onClear={() => setSearch('')}
        placeholder="Search labs..."
        className="w-full sm:w-72"
      />

      {isLoading && <SkeletonTable rows={5} />}

      {error && (
        <Card>
          <p className="text-sm text-red-600 font-medium">Failed to load labs. Please try again.</p>
        </Card>
      )}

      {filtered && filtered.length > 0 && (
        <Card padding="none">
          <div className="overflow-x-auto">
            <table className="w-full text-sm whitespace-nowrap">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Lab</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Contact</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Email</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-5 py-3.5" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((l) => (
                  <tr key={l.id} className="group hover:bg-slate-50/70 transition-colors">
                    <td className="px-5 py-3.5">
                      <p className="font-medium text-slate-900">{l.name}</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="text-slate-800">{l.contactName}</p>
                      <p className="text-xs text-slate-500">{l.contactMobile}</p>
                    </td>
                    <td className="px-5 py-3.5 text-slate-600">{l.email}</td>
                    <td className="px-5 py-3.5">
                      <Badge variant={l.status === 'ACTIVE' ? 'success' : 'default'} size="sm">
                        {l.status.toLowerCase()}
                      </Badge>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(l)}>Edit</Button>
                        <Button variant="ghost" size="sm" onClick={() => setDeleteTarget(l)}>Delete</Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {filtered?.length === 0 && (
        <Card>
          <EmptyState
            icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" /></svg>}
            title={search ? 'No labs found' : 'No labs yet'}
            description={search ? `No results for "${search}"` : 'Add your first diagnostic lab.'}
            action={!search ? <Button size="sm" icon={PlusIcon} onClick={() => setModalOpen(true)}>Add lab</Button> : undefined}
          />
        </Card>
      )}

      <LabModal open={modalOpen} onClose={handleClose} editing={editing} />

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        loading={deleteLab.isPending}
        title="Delete lab"
        confirmLabel="Delete lab"
        message={<>Delete <strong>{deleteTarget?.name}</strong>? This cannot be undone.</>}
        onConfirm={() => {
          if (!deleteTarget) return;
          deleteLab.mutate(deleteTarget.id, { onSuccess: () => setDeleteTarget(null) });
        }}
      />
    </div>
  );
}
