import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { useClientById, useResetPassword } from '../../features/users/hooks/useUsers';
import { usePanels, useSetPanelPricing, useRemovePanelPricing } from '../../features/panel/hooks/usePanels';
import { useLabs } from '../../features/lab/hooks/useLabs';
import { useTestMasters } from '../../features/test-master/hooks/useTestMaster';
import { panelService } from '../../services/panel.service';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Avatar } from '../../components/ui/Avatar';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { PasswordInput } from '../../components/ui/PasswordInput';
import { Combobox } from '../../components/ui/Combobox';
import { MultiSelectCombobox } from '../../components/ui/MultiSelectCombobox';
import { Modal } from '../../components/ui/Modal';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { EmptyState } from '../../components/ui/EmptyState';
import { Pagination } from '../../components/ui/Pagination';
import { usePagination } from '../../hooks/usePagination';
import { getApiErrorMessage } from '../../lib/apiError';
import type { Panel, CreatePanelInput } from '../../types/panel.types';

const fmt = (n: number) => `₹${Number(n).toLocaleString('en-IN')}`;

const ArrowLeftIcon = (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
  </svg>
);

const PlusIcon = (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
  </svg>
);

const KeyIcon = (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
  </svg>
);

// ── Reset password modal (admin) ──────────────────────────────────
// Two-step: validate the new password, then require an explicit confirmation
// warning before the credentials are changed.

interface ResetPasswordFormValues {
  password: string;
  confirmPassword: string;
}

function ResetPasswordModal({
  open,
  onClose,
  clientId,
  clientLabel,
}: {
  open: boolean;
  onClose: () => void;
  clientId: string;
  clientLabel: string;
}) {
  const resetPassword = useResetPassword();
  const [apiError, setApiError] = useState('');
  const [success, setSuccess] = useState(false);
  const [confirming, setConfirming] = useState(false);

  const { register, handleSubmit, watch, reset, formState: { errors } } =
    useForm<ResetPasswordFormValues>();

  const handleClose = () => {
    reset();
    setApiError('');
    setSuccess(false);
    setConfirming(false);
    onClose();
  };

  // Step 1: fields valid → show the confirmation warning.
  const onValid = () => {
    setApiError('');
    setConfirming(true);
  };

  // Step 2: warning confirmed → update the password.
  const handleConfirm = async () => {
    setApiError('');
    try {
      await resetPassword.mutateAsync({ id: clientId, password: watch('password') });
      setConfirming(false);
      setSuccess(true);
      setTimeout(handleClose, 1600);
    } catch (err) {
      setConfirming(false);
      setApiError(getApiErrorMessage(err));
    }
  };

  return (
    <>
      <Modal
        open={open}
        onClose={handleClose}
        title="Reset password"
        size="md"
        footer={
          success ? undefined : (
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={handleClose}>Cancel</Button>
              <Button type="submit" form="reset-password-form">Reset password</Button>
            </div>
          )
        }
      >
        {success ? (
          <p className="text-sm text-emerald-700 bg-emerald-50 rounded-lg px-3 py-2">
            Password has been reset successfully.
          </p>
        ) : (
          <form id="reset-password-form" onSubmit={handleSubmit(onValid)} className="space-y-4">
            {apiError && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{apiError}</p>}
            <p className="text-sm text-slate-500">
              Set a new login password for <strong>{clientLabel}</strong>.
            </p>
            <PasswordInput
              label="New password"
              required
              placeholder="Min 8 characters"
              {...register('password', {
                required: 'Required',
                minLength: { value: 8, message: 'Must be at least 8 characters' },
              })}
              error={errors.password?.message}
            />
            <PasswordInput
              label="Confirm password"
              required
              placeholder="Re-enter the new password"
              {...register('confirmPassword', {
                required: 'Required',
                validate: (v) => v === watch('password') || 'Passwords do not match',
              })}
              error={errors.confirmPassword?.message}
            />
          </form>
        )}
      </Modal>

      <ConfirmDialog
        open={confirming}
        onClose={() => setConfirming(false)}
        loading={resetPassword.isPending}
        title="Reset password"
        confirmLabel="Reset password"
        variant="danger"
        message="Are you sure you want to reset the password for this user? "
        onConfirm={handleConfirm}
      />
    </>
  );
}

// ── Add panel form (create + assign in one step) ──────────────────

interface AddPanelFormValues {
  labId: string;
  name: string;
  mrp: number;
  costToVendor: number;
  costToClient: number;
}

function AddPanelForm({
  clientId,
  onSuccess,
  onCancel,
}: {
  clientId: string;
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const { data: labs, isLoading: labsLoading } = useLabs();
  const { data: allTests } = useTestMasters();
  const [selectedTests, setSelectedTests] = useState<string[]>([]);
  const [testError, setTestError] = useState('');
  const [apiError, setApiError] = useState('');

  const {
    register, control, handleSubmit, watch,
    formState: { errors, isSubmitting },
  } = useForm<AddPanelFormValues>();

  const watchedCost = watch('costToClient');
  const watchedVendor = watch('costToVendor');
  const margin = watchedCost > 0 && watchedVendor > 0
    ? Number(watchedCost) - Number(watchedVendor)
    : null;
  const marginPct = margin !== null && watchedCost > 0
    ? ((margin / Number(watchedCost)) * 100).toFixed(1)
    : null;

  const activeTests = allTests?.filter((t) => t.status === 'ACTIVE') ?? [];

  const labOptions = labs?.map((l) => ({ value: l.id, label: l.name })) ?? [];

  const onSubmit = async (values: AddPanelFormValues) => {
    if (selectedTests.length === 0) {
      setTestError('Select at least one test');
      return;
    }
    setApiError('');
    try {
      // Step 1: Create the panel with selected TestMaster IDs
      const panelInput: CreatePanelInput = {
        labId: values.labId,
        testMasterIds: selectedTests,
        name: values.name,
        mrp: Number(values.mrp),
        costToVendor: Number(values.costToVendor),
      };
      const newPanel = await panelService.create(panelInput);

      // Step 2: Assign to this client with costToClient
      await panelService.setPricing(newPanel.id, {
        clientId,
        costToClient: Number(values.costToClient),
        discountAfterN: 0,
      });

      onSuccess();
    } catch (err) {
      setApiError(getApiErrorMessage(err));
    }
  };

  return (
    <div className="border border-primary-200 rounded-xl p-5 bg-primary-50/30 space-y-4">
      <p className="text-sm font-semibold text-slate-700">Create & assign panel</p>
      {apiError && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{apiError}</p>}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Lab + Tests side by side */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

          <MultiSelectCombobox
            label="Tests"
            required
            placeholder="Select one or more tests…"
            searchPlaceholder="Search tests…"
            options={activeTests.map((t) => ({
              value: t.id,
              label: t.name,
              sublabel: t.description ?? undefined,
            }))}
            value={selectedTests}
            onChange={(ids) => { setSelectedTests(ids); setTestError(''); }}
            error={testError}
            emptyText="No active tests — add tests from the Tests page first."
          />
        </div>

        <Input
          label="Panel name"
          required
          placeholder="Enter panel name"
          {...register('name', { required: 'Required' })}
          error={errors.name?.message}
        />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input
            label="MRP (₹)"
            type="number"
            required
            placeholder="Market price"
            {...register('mrp', { required: 'Required', min: { value: 0, message: '≥ 0' } })}
            error={errors.mrp?.message}
          />
          <Input
            label="Cost to vendor (₹)"
            type="number"
            required
            placeholder="Paid to lab"
            {...register('costToVendor', { required: 'Required', min: { value: 0, message: '≥ 0' } })}
            error={errors.costToVendor?.message}
          />
          <div>
            <Input
              label="Cost to client (₹)"
              type="number"
              required
              placeholder="Client's price"
              {...register('costToClient', { required: 'Required', min: { value: 0, message: '≥ 0' } })}
              error={errors.costToClient?.message}
            />
            {margin !== null && (
              <p className={`mt-1 text-xs font-medium ${margin >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                Margin: {fmt(margin)} ({marginPct}%){margin < 0 && ' ⚠'}
              </p>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-1">
          <Button variant="outline" size="sm" type="button" onClick={onCancel}>Cancel</Button>
          <Button size="sm" type="submit" loading={isSubmitting} icon={PlusIcon}>
            Create & assign panel
          </Button>
        </div>
      </form>
    </div>
  );
}

// ── Edit pricing form (for existing assigned panel) ───────────────

interface EditPricingFormValues {
  costToClient: number;
  discountAfterN: number;
  discountedPrice: number;
}

function EditPricingForm({
  panel,
  clientId,
  currentCostToClient,
  onSuccess,
  onCancel,
}: {
  panel: Panel;
  clientId: string;
  currentCostToClient: number;
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const setPricing = useSetPanelPricing(panel.id);
  const [apiError, setApiError] = useState('');

  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<EditPricingFormValues>({
    defaultValues: { costToClient: currentCostToClient, discountAfterN: 0 },
  });

  const watchedCost = watch('costToClient');
  const margin = watchedCost > 0 ? Number(watchedCost) - Number(panel.costToVendor) : null;
  const marginPct = margin !== null && watchedCost > 0 ? ((margin / Number(watchedCost)) * 100).toFixed(1) : null;

  const onSubmit = async (values: EditPricingFormValues) => {
    setApiError('');
    try {
      await setPricing.mutateAsync({
        clientId,
        costToClient: Number(values.costToClient),
        discountAfterN: Number(values.discountAfterN) || 0,
        discountedPrice: values.discountedPrice ? Number(values.discountedPrice) : undefined,
      });
      onSuccess();
    } catch (err) {
      setApiError(getApiErrorMessage(err));
    }
  };

  return (
    <div className="border border-border rounded-xl p-4 bg-slate-50/60 space-y-3">
      <p className="text-xs font-semibold text-slate-500 uppercase">Edit pricing — {panel.name}</p>
      {apiError && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{apiError}</p>}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <Input
              label="Cost to client (₹)"
              type="number"
              required
              {...register('costToClient', { required: 'Required', min: { value: 0, message: '≥ 0' } })}
              error={errors.costToClient?.message}
            />
            {margin !== null && (
              <p className={`mt-1 text-xs font-medium ${margin >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                Margin: {fmt(margin)} ({marginPct}%)
              </p>
            )}
          </div>
          <Input label="Discount after N" type="number" placeholder="0" {...register('discountAfterN')} />
          <Input label="Discounted price (₹)" type="number" placeholder="Optional" {...register('discountedPrice')} />
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" size="sm" type="button" onClick={onCancel}>Cancel</Button>
          <Button size="sm" type="submit" loading={isSubmitting}>Save</Button>
        </div>
      </form>
    </div>
  );
}

// ── Panels tab ────────────────────────────────────────────────────

function PanelsTab({ clientId }: { clientId: string }) {
  const { data: allPanels, isLoading, refetch } = usePanels();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingPanel, setEditingPanel] = useState<Panel | null>(null);
  const [removeTarget, setRemoveTarget] = useState<Panel | null>(null);

  const assignedPanels = allPanels?.filter((p) =>
    p.clientPricing?.some((cp) => cp.clientId === clientId)
  ) ?? [];

  const { page, setPage, totalPages, pageItems } = usePagination(assignedPanels ?? [], {
    resetKey: `${clientId}-${assignedPanels.length}`,
  });

  const getClientPricing = (panel: Panel) =>
    panel.clientPricing?.find((cp) => cp.clientId === clientId);

  const removeMutation = useRemovePanelPricing(removeTarget?.id ?? '');

  const handleAddSuccess = () => {
    setShowAddForm(false);
    refetch();
  };

  return (
    <div className="space-y-4">
      {/* Add panel form */}
      {showAddForm && (
        <AddPanelForm
          clientId={clientId}
          onSuccess={handleAddSuccess}
          onCancel={() => setShowAddForm(false)}
        />
      )}

      {/* Edit pricing form */}
      {editingPanel && (
        <EditPricingForm
          panel={editingPanel}
          clientId={clientId}
          currentCostToClient={Number(getClientPricing(editingPanel)?.costToClient ?? 0)}
          onSuccess={() => { setEditingPanel(null); refetch(); }}
          onCancel={() => setEditingPanel(null)}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">
          {assignedPanels.length} panel{assignedPanels.length !== 1 ? 's' : ''} assigned
        </p>
        {!showAddForm && !editingPanel && (
          <Button size="sm" icon={PlusIcon} onClick={() => setShowAddForm(true)}>
            Add panel
          </Button>
        )}
      </div>

      {isLoading && (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => <div key={i} className="h-14 rounded-lg bg-slate-100 animate-pulse" />)}
        </div>
      )}

      {!isLoading && assignedPanels.length === 0 && !showAddForm && (
        <Card>
          <EmptyState
            icon={
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.35 3.836c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m8.9-4.414c.376.023.75.05 1.124.08 1.131.094 1.976 1.057 1.976 2.192V16.5A2.25 2.25 0 0118 18.75h-2.25m-7.5-10.5H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V18.75m-7.5-10.5h6.375c.621 0 1.125.504 1.125 1.125v9.375m-8.25-3l1.5 1.5 3-3.75" />
              </svg>
            }
            title="No panels assigned"
            description="Create and assign a panel to define this client's health checkup packages."
            action={
              <Button size="sm" icon={PlusIcon} onClick={() => setShowAddForm(true)}>
                Add first panel
              </Button>
            }
          />
        </Card>
      )}

      {!isLoading && assignedPanels.length > 0 && (
        <Card padding="none">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-slate-50/60">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Panel</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Lab</th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">MRP</th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-orange-600 uppercase tracking-wider">Vendor</th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-blue-600 uppercase tracking-wider">Client price</th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-emerald-600 uppercase tracking-wider">Margin</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {pageItems.map((panel) => {
                  const cp = getClientPricing(panel);
                  if (!cp) return null;
                  const clientCost = Number(cp.costToClient);
                  const vendorCost = Number(panel.costToVendor);
                  const margin = clientCost - vendorCost;
                  const pct = clientCost > 0 ? ((margin / clientCost) * 100).toFixed(0) : '0';
                  const isEditing = editingPanel?.id === panel.id;
                  return (
                    <tr key={panel.id} className={`group transition-colors ${isEditing ? 'bg-primary-50/20' : 'hover:bg-slate-50/50'}`}>
                      <td className="px-5 py-3.5">
                        <p className="font-medium text-slate-900">{panel.name}</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {panel.panelTests?.length
                            ? panel.panelTests.slice(0, 3).map((pt) => (
                                <span key={pt.id} className="text-xs px-1.5 py-0.5 rounded bg-primary-50 text-primary-600">{pt.testMaster?.name}</span>
                              ))
                            : (panel.bundledTest?.testsIncluded ?? []).slice(0, 3).map((t) => (
                                <span key={t} className="text-xs px-1.5 py-0.5 rounded bg-slate-100 text-slate-500">{t}</span>
                              ))
                          }
                          {(panel.panelTests?.length ?? 0) > 3 && (
                            <span className="text-xs px-1.5 py-0.5 rounded bg-slate-100 text-slate-400">
                              +{(panel.panelTests?.length ?? 0) - 3} more
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-slate-500 text-sm">
                        <p>{panel.lab?.name ?? '—'}</p>
                        {panel.lab?.address && (
                          <p className="text-xs text-slate-400 mt-0.5 max-w-[280px] whitespace-normal leading-snug" title={`${panel.lab.address}${panel.lab.pincode ? ` – ${panel.lab.pincode}` : ''}`}>
                            {panel.lab.address}{panel.lab.pincode ? ` – ${panel.lab.pincode}` : ''}
                          </p>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-right text-slate-600">{fmt(Number(panel.mrp))}</td>
                      <td className="px-5 py-3.5 text-right text-orange-600 font-medium">{fmt(vendorCost)}</td>
                      <td className="px-5 py-3.5 text-right text-blue-700 font-semibold">{fmt(clientCost)}</td>
                      <td className="px-5 py-3.5 text-right">
                        <span className={`text-xs font-semibold ${margin >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                          {fmt(margin)} ({pct}%)
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity justify-end">
                          <Button
                            variant="ghost" size="sm"
                            onClick={() => setEditingPanel(isEditing ? null : panel)}
                            disabled={showAddForm}
                          >
                            {isEditing ? 'Cancel' : 'Edit'}
                          </Button>
                          <Button
                            variant="ghost" size="sm"
                            onClick={() => setRemoveTarget(panel)}
                          >
                            Remove
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
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

      <ConfirmDialog
        open={!!removeTarget}
        onClose={() => setRemoveTarget(null)}
        loading={removeMutation.isPending}
        title="Remove panel"
        confirmLabel="Remove"
        message={<>Remove <strong>{removeTarget?.name}</strong> from this client? Their pricing will be deleted.</>}
        onConfirm={() => {
          if (!removeTarget) return;
          removeMutation.mutate(clientId, {
            onSuccess: () => { setRemoveTarget(null); refetch(); },
          });
        }}
      />
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────

export function ClientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: client, isLoading, error } = useClientById(id ?? '');
  const [resetOpen, setResetOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="h-8 w-48 rounded-lg bg-slate-100 animate-pulse" />
        <div className="h-32 rounded-2xl bg-slate-100 animate-pulse" />
      </div>
    );
  }

  if (error || !client) {
    return (
      <Card>
        <p className="text-sm text-red-600 font-medium">Client not found.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Back */}
      <button
        onClick={() => navigate('/admin/clients')}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors"
      >
        {ArrowLeftIcon}
        Back to clients
      </button>

      {/* Client header card */}
      <Card>
        <div className="flex items-start gap-4">
          <Avatar name={client.name ?? client.email} size="lg" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-xl font-bold text-slate-900">
                {client.name ?? client.email.split('@')[0]}
              </h1>
              <Badge variant={client.isActive ? 'success' : 'danger'} dot size="sm">
                {client.isActive ? 'Active' : 'Inactive'}
              </Badge>
              {client.isEmailVerified && (
                <Badge variant="info" size="sm">Verified</Badge>
              )}
            </div>
            <p className="text-slate-500 text-sm mt-0.5">{client.email}</p>
            {client.mobile && <p className="text-slate-400 text-sm">{client.mobile}</p>}
            <p className="text-xs text-slate-400 mt-2">
              Client since {new Date(client.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
          <Button variant="outline" size="sm" icon={KeyIcon} onClick={() => setResetOpen(true)}>
            Reset password
          </Button>
        </div>
      </Card>

      {/* Panels section */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-semibold text-slate-900">Panel assignments</h2>
          <span className="text-xs text-slate-400">Create a panel and assign it to this client in one step</span>
        </div>
        <PanelsTab clientId={client.id} />
      </div>

      <ResetPasswordModal
        open={resetOpen}
        onClose={() => setResetOpen(false)}
        clientId={client.id}
        clientLabel={client.name ?? client.email}
      />
    </div>
  );
}
