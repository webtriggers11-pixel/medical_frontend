import { useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  useTestMasters,
  useCreateTestMaster,
  useUpdateTestMaster,
  useDeleteTestMaster,
} from '../../features/test-master/hooks/useTestMaster';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { SearchInput } from '../../components/ui/SearchInput';
import { SkeletonTable } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { Pagination } from '../../components/ui/Pagination';
import { usePagination } from '../../hooks/usePagination';
import { getApiErrorMessage } from '../../lib/apiError';
import type { TestMaster, CreateTestMasterInput } from '../../types/testMaster.types';

const PlusIcon = (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
  </svg>
);

// ── Add test modal ────────────────────────────────────────────

function AddTestModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const createTest = useCreateTestMaster();
  const [apiError, setApiError] = useState('');

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } =
    useForm<CreateTestMasterInput>();

  const handleClose = () => { reset(); setApiError(''); onClose(); };

  const onSubmit = async (values: CreateTestMasterInput) => {
    setApiError('');
    try {
      await createTest.mutateAsync({
        name: values.name,
        description: values.description || undefined,
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
      title="Add test"
      size="md"
      footer={
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={handleClose}>Cancel</Button>
          <Button type="submit" form="add-test-form" loading={isSubmitting}>Create test</Button>
        </div>
      }
    >
      <form id="add-test-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {apiError && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{apiError}</p>}
        <Input
          label="Test name"
          required
          placeholder="e.g. Complete Blood Count"
          {...register('name', { required: 'Required' })}
          error={errors.name?.message}
        />
        <Input
          label="Description"
          placeholder="Optional — max 255 characters"
          {...register('description', {
            maxLength: { value: 255, message: 'Max 255 characters' },
          })}
          error={errors.description?.message}
        />
      </form>
    </Modal>
  );
}

// ── Main page ─────────────────────────────────────────────────

export function TestMasterPage() {
  const { data: tests, isLoading, error } = useTestMasters();
  const updateTest = useUpdateTestMaster();
  const deleteTest = useDeleteTestMaster();
  const [search, setSearch] = useState('');
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<TestMaster | null>(null);

  const filtered = tests?.filter((t) => {
    const q = search.toLowerCase();
    return (
      t.name.toLowerCase().includes(q) ||
      (t.description ?? '').toLowerCase().includes(q)
    );
  });

  const { page, setPage, totalPages, pageItems } = usePagination(filtered ?? [], { resetKey: search });

  const handleToggleStatus = (test: TestMaster) => {
    updateTest.mutate({
      id: test.id,
      input: { status: test.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' },
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Tests</h1>
          <p className="text-slate-500 mt-1">
            Master catalog of diagnostic tests
            {tests && <span className="text-slate-400"> · {tests.length} total</span>}
          </p>
        </div>
        <Button icon={PlusIcon} onClick={() => setAddModalOpen(true)}>Add test</Button>
      </div>

      <SearchInput
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        onClear={() => setSearch('')}
        placeholder="Search tests..."
        className="w-full sm:w-72"
      />

      {isLoading && <SkeletonTable rows={5} />}
      {error && (
        <Card>
          <p className="text-sm text-red-600 font-medium">Failed to load tests. Please try again.</p>
        </Card>
      )}

      {filtered && filtered.length > 0 && (
        <Card padding="none">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-slate-50/60">
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">ID</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Test name</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Description</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Created</th>
                  <th className="px-5 py-3.5" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {pageItems.map((test) => (
                  <tr key={test.id} className="group hover:bg-slate-50/70 transition-colors">
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <span className="text-xs font-mono font-semibold text-slate-400">{test.testId ?? '—'}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="font-medium text-slate-900">{test.name}</p>
                    </td>
                    <td className="px-5 py-3.5 text-slate-500 max-w-xs">
                      {test.description
                        ? <span className="line-clamp-1" title={test.description}>{test.description}</span>
                        : <span className="text-slate-300">—</span>}
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge variant={test.status === 'ACTIVE' ? 'success' : 'default'} dot size="sm">
                        {test.status === 'ACTIVE' ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td className="px-5 py-3.5 text-slate-500 text-xs">
                      {new Date(test.createdAt).toLocaleDateString('en-IN')}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="sm"
                          loading={updateTest.isPending && updateTest.variables?.id === test.id}
                          onClick={() => handleToggleStatus(test)}
                        >
                          {test.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => setDeleteTarget(test)}>
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

      {filtered && filtered.length === 0 && (
        <Card>
          <EmptyState
            icon={
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
              </svg>
            }
            title={search ? 'No tests found' : 'No tests yet'}
            description={search ? `No results for "${search}".` : 'Add your first diagnostic test to get started.'}
            action={!search ? <Button size="sm" icon={PlusIcon} onClick={() => setAddModalOpen(true)}>Add test</Button> : undefined}
          />
        </Card>
      )}

      <AddTestModal open={addModalOpen} onClose={() => setAddModalOpen(false)} />

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        loading={deleteTest.isPending}
        title="Delete test"
        confirmLabel="Delete"
        message={<>Delete <strong>{deleteTarget?.name}</strong>? This cannot be undone.</>}
        onConfirm={() => {
          if (!deleteTarget) return;
          deleteTest.mutate(deleteTarget.id, { onSuccess: () => setDeleteTarget(null) });
        }}
      />
    </div>
  );
}
