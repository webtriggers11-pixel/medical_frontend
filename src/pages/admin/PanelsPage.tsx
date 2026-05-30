import { useState } from 'react';
import { useForm, Controller, useWatch } from 'react-hook-form';
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

// ── Helpers ───────────────────────────────────────────────────────

const fmt = (n: number) => `₹${Number(n).toLocaleString('en-IN')}`;

function calcMargin(costToClient: number, costToVendor: number) {
  const margin = costToClient - costToVendor;
  const pct = costToClient > 0 ? ((margin / costToClient) * 100).toFixed(1) : '0.0';
  return { margin, pct };
}

// ── Create panel modal ───────────────────────────────────────────

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
  const { data: labs, isLoading: labsLoading } = useLabs();
  const [apiError, setApiError] = useState('');
  const [selectedLabId, setSelectedLabId] = useState('');
  const { data: bundledTests, isLoading: testsLoading } = useBundledTests(selectedLabId);

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
      <form id="panel-form" onSubmit={handleSubmit(onSubmit)}>
        <fieldset disabled={isSubmitting} className="space-y-4">
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
              loading={labsLoading}
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
              loading={testsLoading}
            />
          )}
        />
        <Input
          label="Panel name"
          required
          {...register('name', { required: 'Required' })}
          error={errors.name?.message}
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Timing" placeholder='e.g. "Same day"' {...register('timing')} />
          <Input label="Lab contact person" {...register('labContact')} />
        </div>
        </fieldset>
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

function MarginPill({ costToClient, costToVendor }: { costToClient: number; costToVendor: number }) {
  if (!costToClient || costToClient <= 0) return null;
  const { margin, pct } = calcMargin(Number(costToClient), Number(costToVendor));
  const isNegative = margin < 0;
  return (
    <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium ${
      isNegative
        ? 'bg-red-50 text-red-700 border border-red-200'
        : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
    }`}>
      <span>Admin margin:</span>
      <span className="font-bold">{fmt(margin)}</span>
      <span className="text-xs opacity-75">({pct}%)</span>
      {isNegative && <span className="text-xs font-semibold">⚠ Below vendor cost</span>}
    </div>
  );
}

function SetPricingModal({ panel, open, onClose }: { panel: Panel; open: boolean; onClose: () => void }) {
  const { data: clients, isLoading: clientsLoading } = useUsers();
  const setPricing = useSetPanelPricing(panel.id);
  const [apiError, setApiError] = useState('');

  const { register, control, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<PricingFormValues>({
    defaultValues: { discountAfterN: 0 },
  });

  const watchedCostToClient = useWatch({ control, name: 'costToClient' });

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
      {/* Panel price overview */}
      <div className="mb-5 rounded-xl border border-border bg-slate-50 overflow-hidden">
        <div className="px-4 py-2.5 border-b border-border bg-slate-100/60">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Panel price reference</p>
        </div>
        <div className="grid grid-cols-3 divide-x divide-border">
          <div className="px-4 py-3 text-center">
            <p className="text-xs text-slate-500 mb-0.5">MRP</p>
            <p className="text-base font-bold text-slate-800">{fmt(panel.mrp)}</p>
            <p className="text-xs text-slate-400 mt-0.5">Market reference</p>
          </div>
          <div className="px-4 py-3 text-center">
            <p className="text-xs text-slate-500 mb-0.5">Cost to vendor</p>
            <p className="text-base font-bold text-orange-600">{fmt(panel.costToVendor)}</p>
            <p className="text-xs text-slate-400 mt-0.5">Paid to lab</p>
          </div>
          <div className="px-4 py-3 text-center">
            <p className="text-xs text-slate-500 mb-0.5">Min. margin</p>
            <p className="text-base font-bold text-slate-400">Set per client →</p>
            <p className="text-xs text-slate-400 mt-0.5">Cost to client − vendor</p>
          </div>
        </div>
      </div>

      {/* Existing pricing table */}
      {existing.length > 0 && (
        <div className="mb-6">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Current client pricing</p>
          <div className="rounded-xl border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-border">
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500">Client</th>
                  <th className="text-right px-4 py-2.5 text-xs font-semibold text-blue-600">Cost to client</th>
                  <th className="text-right px-4 py-2.5 text-xs font-semibold text-orange-600">Vendor cost</th>
                  <th className="text-right px-4 py-2.5 text-xs font-semibold text-emerald-600">Admin margin</th>
                  <th className="text-right px-4 py-2.5 text-xs font-semibold text-slate-500">Discount after N</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {existing.map((p) => {
                  const { margin, pct } = calcMargin(Number(p.costToClient), Number(panel.costToVendor));
                  const isNeg = margin < 0;
                  return (
                    <tr key={p.id} className="hover:bg-slate-50/60">
                      <td className="px-4 py-3 font-medium text-slate-800">
                        {p.client?.name ?? p.client?.email ?? p.clientId}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-blue-700">
                        {fmt(Number(p.costToClient))}
                      </td>
                      <td className="px-4 py-3 text-right text-orange-600">
                        {fmt(Number(panel.costToVendor))}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className={`font-semibold ${isNeg ? 'text-red-600' : 'text-emerald-600'}`}>
                          {fmt(margin)}
                        </span>
                        <span className={`ml-1 text-xs ${isNeg ? 'text-red-400' : 'text-emerald-400'}`}>
                          ({pct}%)
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-slate-500 text-xs">
                        {p.discountAfterN > 0
                          ? `After ${p.discountAfterN} → ${fmt(Number(p.discountedPrice))}`
                          : '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add/update pricing form */}
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
        {existing.length > 0 ? 'Add or update a client' : 'Set client pricing'}
      </p>
      <form id="pricing-form" onSubmit={handleSubmit(onSubmit)}>
        <fieldset disabled={isSubmitting} className="space-y-4">
        {apiError && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{apiError}</p>}

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
              loading={clientsLoading}
            />
          )}
        />

        <div>
          <Input
            label="Cost to client (₹)"
            type="number"
            required
            placeholder="What the client is invoiced per candidate"
            {...register('costToClient', { required: 'Required', min: { value: 0, message: 'Must be ≥ 0' } })}
            error={errors.costToClient?.message}
          />
          {/* Live margin preview */}
          {watchedCostToClient > 0 && (
            <div className="mt-2">
              <MarginPill costToClient={Number(watchedCostToClient)} costToVendor={Number(panel.costToVendor)} />
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
        </fieldset>
      </form>
    </Modal>
  );
}

// ── Pricing summary cell ──────────────────────────────────────────

function PricingSummaryCell({ panel, onClick }: { panel: Panel; onClick: () => void }) {
  const pricing = panel.clientPricing ?? [];

  if (pricing.length === 0) {
    return (
      <button
        onClick={onClick}
        className="inline-flex items-center gap-1 text-sm text-slate-400 hover:text-primary-600 transition-colors border border-dashed border-slate-300 hover:border-primary-400 rounded-lg px-2.5 py-1"
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
        Set pricing
      </button>
    );
  }

  const pricingCount = pricing.length;

  return (
    <button onClick={onClick} className="text-left">
      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold text-blue-700">
          {pricingCount} {pricingCount === 1 ? 'client' : 'clients'}
        </span>
        <span className="text-xs text-slate-400">pricing set</span>
      </div>
    </button>
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
            Health checkup panels · 3-tier pricing (MRP → Client → Vendor)
            {panels && <span className="text-slate-400"> · {panels.length} total</span>}
          </p>
        </div>
        <Button icon={PlusIcon} onClick={() => setCreateOpen(true)}>Create panel</Button>
      </div>

      {/* Pricing legend */}
      <div className="flex flex-wrap gap-3">
        {[
          { color: 'bg-slate-200 text-slate-700', label: 'MRP', desc: 'Market reference' },
          { color: 'bg-blue-100 text-blue-700', label: 'Cost to client', desc: 'Invoiced to company' },
          { color: 'bg-orange-100 text-orange-700', label: 'Cost to vendor', desc: 'Paid to lab' },
          { color: 'bg-emerald-100 text-emerald-700', label: 'Admin margin', desc: 'Client − Vendor' },
        ].map((item) => (
          <span key={item.label} className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${item.color}`}>
            <span className="font-semibold">{item.label}</span>
            <span className="opacity-70">— {item.desc}</span>
          </span>
        ))}
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
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-slate-50/60">
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Panel</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Lab / Tests</th>
                  <th className="text-right px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">MRP</th>
                  <th className="text-right px-5 py-3.5 text-xs font-semibold text-orange-600 uppercase tracking-wider">Vendor cost</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-blue-600 uppercase tracking-wider">Client pricing</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-5 py-3.5" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((p) => (
                  <tr key={p.id} className="group hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-4">
                      <p className="font-semibold text-slate-900">{p.name}</p>
                      {p.timing && <p className="text-xs text-slate-400 mt-0.5">{p.timing}</p>}
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-slate-700 text-sm">{p.lab?.name ?? '—'}</p>
                      <div className="flex flex-wrap gap-1 mt-1 max-w-[200px]">
                        {(p.bundledTest?.testsIncluded ?? []).slice(0, 3).map((t) => (
                          <Badge key={t} size="sm" variant="default">{t}</Badge>
                        ))}
                        {(p.bundledTest?.testsIncluded?.length ?? 0) > 3 && (
                          <Badge size="sm" variant="default">+{(p.bundledTest?.testsIncluded?.length ?? 0) - 3}</Badge>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <span className="font-medium text-slate-700">{fmt(Number(p.mrp))}</span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <span className="font-semibold text-orange-600">{fmt(Number(p.costToVendor))}</span>
                    </td>
                    <td className="px-5 py-4">
                      <PricingSummaryCell panel={p} onClick={() => setPricingPanel(p)} />
                    </td>
                    <td className="px-5 py-4">
                      <Badge variant={p.status === 'ACTIVE' ? 'success' : 'default'} size="sm">
                        {p.status.toLowerCase()}
                      </Badge>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="sm" icon={TagIcon} onClick={() => setPricingPanel(p)}>
                          Pricing
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => setDeleteTarget(p)}>Delete</Button>
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
