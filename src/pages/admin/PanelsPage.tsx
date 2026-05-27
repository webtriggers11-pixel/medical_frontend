import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { usePanels, useCreatePanel, useDeletePanel, useSetPanelPricing } from '../../features/panel/hooks/usePanels';
import { useLabs, useBundledTests } from '../../features/lab/hooks/useLabs';
import { useUsers } from '../../features/users/hooks/useUsers';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Combobox } from '../../components/ui/Combobox';
import { Modal } from '../../components/ui/Modal';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { SearchInput } from '../../components/ui/SearchInput';
import { SkeletonTable } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { getApiErrorMessage } from '../../lib/apiError';
import type { Panel, CreatePanelInput } from '../../types/panel.types';

const PlusIcon = (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
  </svg>
);

const TagIcon = (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
  </svg>
);

// ── Create panel modal ──────────────────────────────────────────

interface PanelFormValues {
  labId: string;
  bundledTestId: string;
  name: string;
  timing: string;
  mrp: number;
  costToVendor: number;
  labContact: string;
}

function CreatePanelModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const createPanel = useCreatePanel();
  const { data: labs } = useLabs();
  const [apiError, setApiError] = useState('');
  const [selectedLabId, setSelectedLabId] = useState('');
  const { data: bundledTests } = useBundledTests(selectedLabId);

  const { register, control, handleSubmit, reset, watch, formState: { errors, isSubmitting } } = useForm<PanelFormValues>();

  const watchedLabId = watch('labId');
  if (watchedLabId !== selectedLabId) setSelectedLabId(watchedLabId);

  const handleClose = () => { reset(); setApiError(''); setSelectedLabId(''); onClose(); };

  const onSubmit = async (values: PanelFormValues) => {
    setApiError('');
    try {
      const input: CreatePanelInput = {
        labId: values.labId,
        bundledTestId: values.bundledTestId,
        name: values.name,
        mrp: Number(values.mrp),
        costToVendor: Number(values.costToVendor),
        timing: values.timing || undefined,
        labContact: values.labContact || undefined,
      };
      await createPanel.mutateAsync(input);
      handleClose();
    } catch (err) {
      setApiError(getApiErrorMessage(err));
    }
  };

  const labOptions = labs?.map((l) => ({ value: l.id, label: l.name })) ?? [];
  const testOptions = bundledTests?.map((t) => ({ value: t.id, label: t.name })) ?? [];

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Create panel"
      size="lg"
      footer={
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={handleClose}>Cancel</Button>
          <Button type="submit" form="panel-form" loading={isSubmitting}>Create panel</Button>
        </div>
      }
    >
      <form id="panel-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {apiError && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{apiError}</p>}
        <Controller
          name="labId"
          control={control}
          rules={{ required: 'Required' }}
          render={({ field }) => (
            <Combobox
              label="Lab"
              required
              options={labOptions}
              placeholder="Select a lab"
              searchPlaceholder="Search labs..."
              value={field.value ?? ''}
              onChange={field.onChange}
              error={errors.labId?.message}
            />
          )}
        />
        <Controller
          name="bundledTestId"
          control={control}
          rules={{ required: 'Required' }}
          render={({ field }) => (
            <Combobox
              label="Bundled test"
              required
              options={testOptions}
              placeholder={selectedLabId ? 'Select a bundled test' : 'Select a lab first'}
              searchPlaceholder="Search tests..."
              disabled={!selectedLabId}
              value={field.value ?? ''}
              onChange={field.onChange}
              error={errors.bundledTestId?.message}
            />
          )}
        />
        <Input
          label="Panel name"
          required
          {...register('name', { required: 'Required' })}
          error={errors.name?.message}
        />
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="MRP (₹)"
            type="number"
            required
            {...register('mrp', { required: 'Required', min: { value: 0, message: 'Must be ≥ 0' } })}
            error={errors.mrp?.message}
          />
          <Input
            label="Cost to vendor (₹)"
            type="number"
            required
            {...register('costToVendor', { required: 'Required', min: { value: 0, message: 'Must be ≥ 0' } })}
            error={errors.costToVendor?.message}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Input label="Timing" placeholder='e.g. "Same day"' {...register('timing')} />
          <Input label="Lab contact person" {...register('labContact')} />
        </div>
      </form>
    </Modal>
  );
}

// ── Set client pricing modal ─────────────────────────────────────

interface PricingFormValues {
  clientId: string;
  costToClient: number;
  discountAfterN: number;
  discountedPrice: number;
}

function SetPricingModal({ panel, open, onClose }: { panel: Panel; open: boolean; onClose: () => void }) {
  const { data: clients } = useUsers();
  const setPricing = useSetPanelPricing(panel.id);
  const [apiError, setApiError] = useState('');

  const { register, control, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<PricingFormValues>({
    defaultValues: { discountAfterN: 0 },
  });

  const handleClose = () => { reset(); setApiError(''); onClose(); };

  const onSubmit = async (values: PricingFormValues) => {
    setApiError('');
    try {
      await setPricing.mutateAsync({
        clientId: values.clientId,
        costToClient: Number(values.costToClient),
        discountAfterN: Number(values.discountAfterN) || 0,
        discountedPrice: values.discountedPrice ? Number(values.discountedPrice) : undefined,
      });
      handleClose();
    } catch (err) {
      setApiError(getApiErrorMessage(err));
    }
  };

  const clientOptions = clients?.map((c) => ({ value: c.id, label: c.name ?? c.email })) ?? [];

  // Existing pricing rows for this panel
  const existing = panel.clientPricing ?? [];

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={`Client pricing — ${panel.name}`}
      size="lg"
      footer={
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={handleClose}>Close</Button>
          <Button type="submit" form="pricing-form" loading={isSubmitting}>Set pricing</Button>
        </div>
      }
    >
      {/* Existing pricing table */}
      {existing.length > 0 && (
        <div className="mb-6">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Current pricing</p>
          <div className="rounded-lg border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-border">
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500">Client</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500">Cost to client</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500">Discount after N</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500">Discounted price</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {existing.map((p) => (
                  <tr key={p.id}>
                    <td className="px-4 py-2.5 font-medium text-slate-800">{p.client?.name ?? p.client?.email ?? p.clientId}</td>
                    <td className="px-4 py-2.5 text-slate-700">₹{Number(p.costToClient).toLocaleString('en-IN')}</td>
                    <td className="px-4 py-2.5 text-slate-500">{p.discountAfterN > 0 ? `${p.discountAfterN} bookings` : '—'}</td>
                    <td className="px-4 py-2.5 text-slate-500">
                      {p.discountAfterN > 0 ? `₹${Number(p.discountedPrice).toLocaleString('en-IN')}` : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / update pricing form */}
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
        {existing.length > 0 ? 'Add or update a client' : 'Set client pricing'}
      </p>
      <form id="pricing-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {apiError && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{apiError}</p>}

        <div className="p-3 rounded-lg bg-slate-50 text-sm text-slate-600 flex gap-4">
          <span>MRP: <strong className="text-slate-900">₹{Number(panel.mrp).toLocaleString('en-IN')}</strong></span>
          <span>Vendor cost: <strong className="text-slate-900">₹{Number(panel.costToVendor).toLocaleString('en-IN')}</strong></span>
        </div>

        <Controller
          name="clientId"
          control={control}
          rules={{ required: 'Required' }}
          render={({ field }) => (
            <Combobox
              label="Client"
              required
              options={clientOptions}
              placeholder="Select a client"
              searchPlaceholder="Search clients..."
              value={field.value ?? ''}
              onChange={field.onChange}
              error={errors.clientId?.message}
            />
          )}
        />
        <Input
          label="Cost to client (₹)"
          type="number"
          required
          placeholder="What the client pays per candidate"
          {...register('costToClient', { required: 'Required', min: { value: 0, message: 'Must be ≥ 0' } })}
          error={errors.costToClient?.message}
        />
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Loyalty discount after N bookings"
            type="number"
            placeholder="0 = no discount"
            {...register('discountAfterN', { min: { value: 0, message: 'Must be ≥ 0' } })}
            error={errors.discountAfterN?.message}
          />
          <Input
            label="Discounted price (₹)"
            type="number"
            placeholder="Price after N bookings"
            {...register('discountedPrice', { min: { value: 0, message: 'Must be ≥ 0' } })}
            error={errors.discountedPrice?.message}
          />
        </div>
      </form>
    </Modal>
  );
}

// ── Main page ─────────────────────────────────────────────────────

export function PanelsPage() {
  const { data: panels, isLoading, error } = usePanels();
  const deletePanel = useDeletePanel();
  const [search, setSearch] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [pricingPanel, setPricingPanel] = useState<Panel | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Panel | null>(null);

  const filtered = panels?.filter((p) => {
    const q = search.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      (p.lab?.name ?? '').toLowerCase().includes(q) ||
      (p.bundledTest?.name ?? '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Panels</h1>
          <p className="text-slate-500 mt-1">
            Health checkup panels with 3-tier pricing
            {panels && <span className="text-slate-400"> &middot; {panels.length} total</span>}
          </p>
        </div>
        <Button icon={PlusIcon} onClick={() => setCreateOpen(true)}>Create panel</Button>
      </div>

      <SearchInput
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        onClear={() => setSearch('')}
        placeholder="Search panels..."
        className="w-full sm:w-72"
      />

      {isLoading && <SkeletonTable rows={5} />}

      {error && (
        <Card>
          <p className="text-sm text-red-600 font-medium">Failed to load panels. Please try again.</p>
        </Card>
      )}

      {filtered && filtered.length > 0 && (
        <Card padding="none">
          <div className="overflow-x-auto">
            <table className="w-full text-sm whitespace-nowrap">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Panel</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Lab</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Tests</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">MRP</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Vendor cost</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Client pricing</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-5 py-3.5" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((p) => {
                  const pricingCount = p.clientPricing?.length ?? 0;
                  return (
                    <tr key={p.id} className="group hover:bg-slate-50/70 transition-colors">
                      <td className="px-5 py-3.5">
                        <p className="font-medium text-slate-900">{p.name}</p>
                        {p.timing && <p className="text-xs text-slate-500">{p.timing}</p>}
                      </td>
                      <td className="px-5 py-3.5 text-slate-600">{p.lab?.name ?? '—'}</td>
                      <td className="px-5 py-3.5">
                        <div className="flex flex-wrap gap-1 max-w-[180px]">
                          {(p.bundledTest?.testsIncluded ?? []).slice(0, 2).map((t) => (
                            <Badge key={t} size="sm" variant="default">{t}</Badge>
                          ))}
                          {(p.bundledTest?.testsIncluded?.length ?? 0) > 2 && (
                            <Badge size="sm" variant="default">+{(p.bundledTest?.testsIncluded?.length ?? 0) - 2}</Badge>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-slate-800 font-medium">
                        ₹{Number(p.mrp).toLocaleString('en-IN')}
                      </td>
                      <td className="px-5 py-3.5 text-slate-600">
                        ₹{Number(p.costToVendor).toLocaleString('en-IN')}
                      </td>
                      <td className="px-5 py-3.5">
                        {pricingCount > 0 ? (
                          <button
                            onClick={() => setPricingPanel(p)}
                            className="flex items-center gap-1.5 text-primary-600 hover:text-primary-700 text-sm font-medium transition-colors"
                          >
                            <span>{pricingCount} {pricingCount === 1 ? 'client' : 'clients'}</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => setPricingPanel(p)}
                            className="text-sm text-slate-400 hover:text-primary-600 transition-colors"
                          >
                            Not set
                          </button>
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        <Badge variant={p.status === 'ACTIVE' ? 'success' : 'default'} size="sm">
                          {p.status.toLowerCase()}
                        </Badge>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="sm" icon={TagIcon} onClick={() => setPricingPanel(p)}>
                            Pricing
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => setDeleteTarget(p)}>Delete</Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {filtered?.length === 0 && (
        <Card>
          <EmptyState
            icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M11.35 3.836c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m8.9-4.414c.376.023.75.05 1.124.08 1.131.094 1.976 1.057 1.976 2.192V16.5A2.25 2.25 0 0118 18.75h-2.25m-7.5-10.5H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V18.75m-7.5-10.5h6.375c.621 0 1.125.504 1.125 1.125v9.375m-8.25-3l1.5 1.5 3-3.75" /></svg>}
            title={search ? 'No panels found' : 'No panels yet'}
            description={search ? `No results for "${search}"` : 'Create your first panel to link a lab test with pricing.'}
            action={!search ? <Button size="sm" icon={PlusIcon} onClick={() => setCreateOpen(true)}>Create panel</Button> : undefined}
          />
        </Card>
      )}

      <CreatePanelModal open={createOpen} onClose={() => setCreateOpen(false)} />

      {pricingPanel && (
        <SetPricingModal
          panel={pricingPanel}
          open={!!pricingPanel}
          onClose={() => setPricingPanel(null)}
        />
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        loading={deletePanel.isPending}
        title="Delete panel"
        confirmLabel="Delete panel"
        message={<>Delete <strong>{deleteTarget?.name}</strong>? This cannot be undone.</>}
        onConfirm={() => {
          if (!deleteTarget) return;
          deletePanel.mutate(deleteTarget.id, { onSuccess: () => setDeleteTarget(null) });
        }}
      />
    </div>
  );
}
