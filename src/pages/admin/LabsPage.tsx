import { useState, useRef } from 'react';
import type { KeyboardEvent } from 'react';
import { useForm } from 'react-hook-form';
import {
  useLabs, useCreateLab, useUpdateLab, useDeleteLab,
  useBundledTests, useCreateBundledTest, useUpdateBundledTest, useDeleteBundledTest,
} from '../../features/lab/hooks/useLabs';
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
import type { Lab, CreateLabInput, BundledTest, CreateBundledTestInput, UpdateBundledTestInput } from '../../types/lab.types';

const PlusIcon = (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
  </svg>
);

const FlaskIcon = (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
  </svg>
);

// ── Tag input for testsIncluded ───────────────────────────────────

function TagInput({
  value,
  onChange,
  placeholder,
  error,
}: {
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  error?: string;
}) {
  const [inputVal, setInputVal] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const addTag = (raw: string) => {
    const tag = raw.trim();
    if (tag && !value.includes(tag)) onChange([...value, tag]);
    setInputVal('');
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(inputVal);
    } else if (e.key === 'Backspace' && !inputVal && value.length > 0) {
      onChange(value.slice(0, -1));
    }
  };

  const removeTag = (tag: string) => onChange(value.filter((t) => t !== tag));

  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1.5">
        Tests included <span className="text-red-500">*</span>
        <span className="text-slate-400 font-normal ml-1">(press Enter or comma to add)</span>
      </label>
      <div
        className={`min-h-[42px] flex flex-wrap gap-1.5 px-3 py-2 rounded-lg border bg-white cursor-text transition-colors ${
          error ? 'border-red-400' : 'border-slate-300 focus-within:border-primary-500 focus-within:ring-2 focus-within:ring-primary-100'
        }`}
        onClick={() => inputRef.current?.focus()}
      >
        {value.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-primary-50 text-primary-700 text-xs font-medium border border-primary-200"
          >
            {tag}
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); removeTag(tag); }}
              className="hover:text-primary-900 transition-colors leading-none"
            >
              ×
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => { if (inputVal.trim()) addTag(inputVal); }}
          placeholder={value.length === 0 ? (placeholder ?? 'e.g. CBC, X-Ray, UA') : ''}
          className="flex-1 min-w-[120px] text-sm outline-none bg-transparent placeholder:text-slate-400"
        />
      </div>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}

// ── Lab form modal ────────────────────────────────────────────────

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
      <form id="lab-form" onSubmit={handleSubmit(onSubmit)}>
        <fieldset disabled={isSubmitting} className="space-y-4">
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
        </fieldset>
      </form>
    </Modal>
  );
}

// ── Bundled test form (create / edit) ─────────────────────────────

interface BundledTestFormValues {
  name: string;
  defaultTiming: string;
  suggestedMrp: number;
}

function BundledTestForm({
  labId,
  editing,
  onSuccess,
  onCancel,
}: {
  labId: string;
  editing: BundledTest | null;
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const createTest = useCreateBundledTest();
  const updateTest = useUpdateBundledTest(labId);
  const [tags, setTags] = useState<string[]>(editing?.testsIncluded ?? []);
  const [tagsError, setTagsError] = useState('');
  const [apiError, setApiError] = useState('');

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<BundledTestFormValues>({
    defaultValues: editing
      ? { name: editing.name, defaultTiming: editing.defaultTiming ?? '', suggestedMrp: editing.suggestedMrp }
      : {},
  });

  const onSubmit = async (values: BundledTestFormValues) => {
    if (tags.length === 0) { setTagsError('Add at least one test'); return; }
    setTagsError('');
    setApiError('');
    try {
      if (editing) {
        const input: UpdateBundledTestInput = {
          name: values.name,
          testsIncluded: tags,
          defaultTiming: values.defaultTiming || undefined,
          suggestedMrp: Number(values.suggestedMrp),
        };
        await updateTest.mutateAsync({ id: editing.id, input });
      } else {
        const input: CreateBundledTestInput = {
          labId,
          name: values.name,
          testsIncluded: tags,
          defaultTiming: values.defaultTiming || undefined,
          suggestedMrp: Number(values.suggestedMrp),
        };
        await createTest.mutateAsync(input);
      }
      onSuccess();
    } catch (err) {
      setApiError(getApiErrorMessage(err));
    }
  };

  return (
    <div className="border border-border rounded-xl p-4 bg-slate-50/60 space-y-4">
      <p className="text-sm font-semibold text-slate-700">{editing ? 'Edit bundled test' : 'New bundled test'}</p>
      {apiError && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{apiError}</p>}

      <form id="bundled-test-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <fieldset disabled={isSubmitting} className="space-y-4">
        <Input
          label="Test package name"
          required
          placeholder='e.g. "Pre-employment Basic"'
          {...register('name', { required: 'Required' })}
          error={errors.name?.message}
        />
        <TagInput
          value={tags}
          onChange={setTags}
          error={tagsError}
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Suggested MRP (₹)"
            type="number"
            required
            {...register('suggestedMrp', { required: 'Required', min: { value: 0, message: 'Must be ≥ 0' } })}
            error={errors.suggestedMrp?.message}
          />
          <Input
            label="Default timing"
            placeholder='e.g. "Same day"'
            {...register('defaultTiming')}
          />
        </div>
        </fieldset>
        <div className="flex justify-end gap-2 pt-1">
          <Button variant="outline" size="sm" type="button" onClick={onCancel}>Cancel</Button>
          <Button size="sm" type="submit" loading={isSubmitting}>
            {editing ? 'Save changes' : 'Add test'}
          </Button>
        </div>
      </form>
    </div>
  );
}

// ── Bundled tests management modal ────────────────────────────────

function BundledTestsModal({ lab, open, onClose }: { lab: Lab; open: boolean; onClose: () => void }) {
  const { data: tests, isLoading } = useBundledTests(lab.id);
  const deleteTest = useDeleteBundledTest(lab.id);
  const [formMode, setFormMode] = useState<'create' | 'edit' | null>(null);
  const [editingTest, setEditingTest] = useState<BundledTest | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<BundledTest | null>(null);

  const handleFormSuccess = () => { setFormMode(null); setEditingTest(null); };
  const handleEdit = (t: BundledTest) => { setEditingTest(t); setFormMode('edit'); };
  const handleCancelForm = () => { setFormMode(null); setEditingTest(null); };

  return (
    <>
      <Modal
        open={open}
        onClose={onClose}
        title={`Bundled tests — ${lab.name}`}
        size="lg"
        footer={
          <div className="flex justify-between items-center">
            <Button
              variant="outline"
              size="sm"
              icon={PlusIcon}
              onClick={() => { setFormMode('create'); setEditingTest(null); }}
              disabled={formMode !== null}
            >
              Add test
            </Button>
            <Button variant="outline" onClick={onClose}>Close</Button>
          </div>
        }
      >
        <div className="space-y-4">
          {/* Create / edit form */}
          {formMode !== null && (
            <BundledTestForm
              labId={lab.id}
              editing={formMode === 'edit' ? editingTest : null}
              onSuccess={handleFormSuccess}
              onCancel={handleCancelForm}
            />
          )}

          {/* Tests list */}
          {isLoading && (
            <div className="space-y-2">
              {[1, 2].map((i) => (
                <div key={i} className="h-16 rounded-lg bg-slate-100 animate-pulse" />
              ))}
            </div>
          )}

          {!isLoading && tests && tests.length === 0 && formMode === null && (
            <EmptyState
              icon={FlaskIcon}
              title="No bundled tests yet"
              description="Add a test package to this lab so it can be linked to panels."
              action={
                <Button size="sm" icon={PlusIcon} onClick={() => setFormMode('create')}>
                  Add test
                </Button>
              }
            />
          )}

          {!isLoading && tests && tests.length > 0 && (
            <div className="space-y-2">
              {tests.map((t) => (
                <div
                  key={t.id}
                  className={`group flex items-start justify-between gap-3 p-3.5 rounded-xl border transition-colors ${
                    editingTest?.id === t.id ? 'border-primary-300 bg-primary-50/30' : 'border-border bg-white hover:bg-slate-50/60'
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold text-slate-900">{t.name}</p>
                      {t.defaultTiming && (
                        <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">{t.defaultTiming}</span>
                      )}
                      <span className="text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                        ₹{Number(t.suggestedMrp).toLocaleString('en-IN')} MRP
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {t.testsIncluded.map((test) => (
                        <span key={test} className="text-xs px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">{test}</span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(t)}
                      disabled={formMode !== null}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeleteTarget(t)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        loading={deleteTest.isPending}
        title="Delete bundled test"
        confirmLabel="Delete test"
        message={<>Delete <strong>{deleteTarget?.name}</strong>? Panels linked to this test will also be affected.</>}
        onConfirm={() => {
          if (!deleteTarget) return;
          deleteTest.mutate(deleteTarget.id, { onSuccess: () => setDeleteTarget(null) });
        }}
      />
    </>
  );
}

// ── Main page ─────────────────────────────────────────────────────

export function LabsPage() {
  const { data: labs, isLoading, error } = useLabs();
  const deleteLab = useDeleteLab();
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Lab | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Lab | null>(null);
  const [bundledTestsLab, setBundledTestsLab] = useState<Lab | null>(null);

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
            Manage diagnostic labs and their test packages
            {labs && <span className="text-slate-400"> · {labs.length} total</span>}
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
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Bundled tests</th>
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
                      <button
                        onClick={() => setBundledTestsLab(l)}
                        className="text-sm text-primary-600 hover:text-primary-700 font-medium transition-colors"
                      >
                        Manage tests
                      </button>
                    </td>
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

      {bundledTestsLab && (
        <BundledTestsModal
          lab={bundledTestsLab}
          open={!!bundledTestsLab}
          onClose={() => setBundledTestsLab(null)}
        />
      )}

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
