import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import {
  useZones,
  useCities,
  useCreateStore,
} from '../../features/org/hooks/useOrg';
import { useUsers } from '../../features/users/hooks/useUsers';
import { useAuthStore } from '../../store/auth.store';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Combobox } from '../../components/ui/Combobox';
import { getApiErrorMessage } from '../../lib/apiError';
import type { CreateStoreInput } from '../../types/org.types';
import {
  type WizardStep,
  WizardHero,
  StepperMobile,
  StepperVertical,
  StepHeading,
  LockedField,
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckIcon,
} from '../../components/wizard/Wizard';

/* ── step icons ─────────────────────────────────────────────────────── */

const ClientIcon = (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
  </svg>
);
const MapIcon = (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z" />
  </svg>
);
const BuildingIcon = (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" />
  </svg>
);
const StoreIcon = (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349M3.75 21V9.349m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.015a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72M6.75 18h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.75c0 .415.336.75.75.75z" />
  </svg>
);

/* ── form types ─────────────────────────────────────────────────────── */

type StoreFormValues = {
  name: string;
  storeCode: string;
  address: string;
  storeHeadName: string;
  storeHeadMobile: string;
  email: string;
};

/* ── step definitions ────────────────────────────────────────────────── */

const ADMIN_STEPS: WizardStep[] = [
  { title: 'Client', desc: 'Assign to a client', icon: ClientIcon },
  { title: 'Zone', desc: 'Choose a region', icon: MapIcon },
  { title: 'City', desc: 'Choose a city', icon: BuildingIcon },
  { title: 'Details', desc: 'Store information', icon: StoreIcon },
];

const USER_STEPS: WizardStep[] = [
  { title: 'Zone', desc: 'Choose a region', icon: MapIcon },
  { title: 'City', desc: 'Choose a city', icon: BuildingIcon },
  { title: 'Details', desc: 'Store information', icon: StoreIcon },
];

export function AddStorePage() {
  const navigate = useNavigate();
  const currentUser = useAuthStore((s) => s.user);
  const isAdmin = currentUser?.role === 'ADMIN';

  const storesPath = isAdmin ? '/admin/stores' : '/stores';
  const STEPS = isAdmin ? ADMIN_STEPS : USER_STEPS;

  const [step, setStep] = useState(0);
  const [clientId, setClientId] = useState('');
  const [zoneId, setZoneId] = useState('');
  const [cityId, setCityId] = useState('');
  const [apiError, setApiError] = useState('');

  const { data: clients } = useUsers();
  const { data: zones } = useZones();
  const { data: cities } = useCities(zoneId);
  const createStore = useCreateStore();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<StoreFormValues>();

  const selectedClient = clients?.find((c) => c.id === clientId);
  const selectedZone = zones?.find((z) => z.id === zoneId);
  const selectedCity = cities?.find((c) => c.id === cityId);
  const watchedName = watch('name');

  const clientOptions = clients?.map((c) => ({ value: c.id, label: c.name ?? c.email })) ?? [];
  const zoneOptions = zones?.map((z) => ({ value: z.id, label: z.name })) ?? [];
  const cityOptions = cities?.map((c) => ({ value: c.id, label: c.name })) ?? [];

  /* ── handlers ─────────────────────────────────────────────────────── */

  const handleZoneSelect = (id: string) => {
    setZoneId(id);
    setCityId('');
    setApiError('');
  };

  const goNext = () => { setApiError(''); setStep((s) => Math.min(s + 1, STEPS.length - 1)); };
  const goBack = () => { setApiError(''); setStep((s) => Math.max(s - 1, 0)); };

  const onSubmit = async (values: StoreFormValues) => {
    if (!cityId) return;
    setApiError('');
    const payload: CreateStoreInput = {
      ...(isAdmin && clientId ? { clientId } : {}),
      cityId,
      name: values.name,
      storeCode: values.storeCode,
      address: values.address,
      storeHeadName: values.storeHeadName,
      storeHeadMobile: values.storeHeadMobile,
      email: values.email || undefined,
    };
    try {
      await createStore.mutateAsync(payload);
      navigate(storesPath, { state: { zoneId, cityId } });
    } catch (err) {
      setApiError(getApiErrorMessage(err));
    }
  };

  // Which step index maps to which concept depends on role
  const zoneStep = isAdmin ? 1 : 0;
  const cityStep = isAdmin ? 2 : 1;
  const detailStep = isAdmin ? 3 : 2;

  const canContinue =
    step === 0 ? (isAdmin ? !!clientId : !!zoneId) :
    step === zoneStep ? !!zoneId :
    step === cityStep ? !!cityId : true;

  // Summary sidebar values
  const summaryValues = isAdmin
    ? [selectedClient?.name ?? selectedClient?.email, selectedZone?.name, selectedCity?.name, watchedName?.trim() || undefined]
    : [selectedZone?.name, selectedCity?.name, watchedName?.trim() || undefined];

  /* ── render ───────────────────────────────────────────────────────── */

  return (
    <div className="mx-auto max-w-5xl space-y-6 animate-fade-in pb-10">
      <button
        onClick={() => navigate(storesPath)}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition-colors hover:text-slate-800"
      >
        {ArrowLeftIcon}
        Back to stores
      </button>

      <WizardHero
        eyebrow="New store"
        title="Add a new store"
        subtitle={isAdmin
          ? 'Select the client, pin the location, then fill in the details.'
          : 'Pin the location, then fill in the details — done in three quick steps.'}
        watermark={StoreIcon}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[300px_1fr]">
        {/* Summary sidebar */}
        <aside className="hidden lg:block">
          <div className="glass sticky top-6 space-y-6 rounded-3xl border border-border/70 p-6 shadow-card">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-primary-600">Building</p>
              <p className="mt-1 truncate text-base font-semibold text-slate-900">
                {watchedName?.trim() || 'Untitled store'}
              </p>
            </div>
            <StepperVertical steps={STEPS} current={step} values={summaryValues} />
          </div>
        </aside>

        {/* Active step */}
        <div className="space-y-5">
          <StepperMobile steps={STEPS} current={step} />

          <div className="overflow-hidden rounded-3xl border border-border/70 bg-surface shadow-card transition-shadow hover:shadow-card-hover">
            <div className="h-1.5 w-full bg-gradient-to-r from-primary-500 via-primary-400 to-primary-600" />

            <div className="p-6 sm:p-8">
              {apiError && (
                <p className="mb-5 flex items-center gap-2 rounded-xl border border-danger/20 bg-danger-light px-4 py-2.5 text-sm font-medium text-red-600 animate-slide-in">
                  {apiError}
                </p>
              )}

              {/* ADMIN STEP 0 — CLIENT */}
              {isAdmin && step === 0 && (
                <div key="step-client" className="space-y-6 animate-slide-in-right">
                  <StepHeading
                    icon={ClientIcon}
                    title="Which client?"
                    subtitle="Select the client (company) this store will belong to."
                  />
                  <Combobox
                    label="Client"
                    required
                    options={clientOptions}
                    value={clientId}
                    onChange={(id) => { setClientId(id); setApiError(''); }}
                    placeholder="Select a client…"
                    searchPlaceholder="Search clients…"
                    emptyText="No clients found"
                  />
                  {selectedClient && (
                    <div className="flex items-center gap-2 rounded-xl border border-success/30 bg-success-light/50 px-4 py-3 text-sm text-emerald-700 animate-slide-in">
                      <span className="text-success">{CheckIcon}</span>
                      <span>
                        Store will be assigned to <span className="font-semibold">{selectedClient.name ?? selectedClient.email}</span>.
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* ZONE STEP */}
              {step === zoneStep && (
                <div key="step-zone" className="space-y-6 animate-slide-in-right">
                  <StepHeading icon={MapIcon} title="Which zone?" subtitle="Search and select the zone this store belongs to." />
                  <Combobox
                    label="Zone"
                    required
                    options={zoneOptions}
                    value={zoneId}
                    onChange={handleZoneSelect}
                    placeholder="Select a zone…"
                    searchPlaceholder="Search zones…"
                    emptyText="No zones found"
                  />
                </div>
              )}

              {/* CITY STEP */}
              {step === cityStep && (
                <div key="step-city" className="space-y-6 animate-slide-in-right">
                  <StepHeading
                    icon={BuildingIcon}
                    title={`Which city in ${selectedZone?.name}?`}
                    subtitle="Search and select the city in this zone for the store."
                  />
                  <Combobox
                    label="City"
                    required
                    options={cityOptions}
                    value={cityId}
                    onChange={(id) => { setCityId(id); setApiError(''); }}
                    placeholder="Select a city…"
                    searchPlaceholder="Search cities…"
                    emptyText="No cities in this zone"
                  />
                  {selectedCity && (
                    <div className="flex items-center gap-2 rounded-xl border border-success/30 bg-success-light/50 px-4 py-3 text-sm text-emerald-700 animate-slide-in">
                      <span className="text-success">{CheckIcon}</span>
                      <span>
                        <span className="font-semibold">{selectedCity.name}</span> selected in{' '}
                        <span className="font-semibold">{selectedZone?.name}</span>.
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* DETAILS STEP */}
              {step === detailStep && (
                <div key="step-details" className="space-y-6 animate-slide-in-right">
                  <StepHeading icon={StoreIcon} title="Store details" subtitle="Location is locked in — just fill in the rest to create the store." />

                  <div className={`grid grid-cols-1 gap-4 rounded-2xl border border-border/60 bg-slate-50/70 p-4 ${isAdmin ? 'sm:grid-cols-3' : 'sm:grid-cols-2'}`}>
                    {isAdmin && <LockedField label="Client" value={selectedClient?.name ?? selectedClient?.email ?? '—'} />}
                    <LockedField label="Zone" value={selectedZone?.name ?? '—'} />
                    <LockedField label="City" value={selectedCity?.name ?? '—'} />
                  </div>

                  <form id="store-details-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <Input
                        label="Store name"
                        placeholder="e.g. Andheri Branch"
                        {...register('name', { required: 'Store name is required' })}
                        error={errors.name?.message}
                      />
                      <Input
                        label="Store code"
                        placeholder="e.g. MUM-AND-001"
                        {...register('storeCode', { required: 'Store code is required' })}
                        error={errors.storeCode?.message}
                      />
                    </div>
                    <Input
                      label="Address"
                      placeholder="Full store address"
                      {...register('address', { required: 'Address is required' })}
                      error={errors.address?.message}
                    />
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <Input
                        label="Store head name"
                        placeholder="e.g. Rahul Sharma"
                        {...register('storeHeadName', { required: 'Store head name is required' })}
                        error={errors.storeHeadName?.message}
                      />
                      <Input
                        label="Store head mobile"
                        placeholder="e.g. 9876543210"
                        {...register('storeHeadMobile', { required: 'Store head mobile is required' })}
                        error={errors.storeHeadMobile?.message}
                      />
                    </div>
                    <Input
                      label="Email"
                      type="email"
                      placeholder="store@example.com (optional)"
                      {...register('email')}
                    />
                  </form>
                </div>
              )}
            </div>

            {/* Footer nav */}
            <div className="flex items-center justify-between gap-3 border-t border-border bg-slate-50/50 px-6 py-4 sm:px-8">
              <Button
                variant="ghost"
                onClick={step === 0 ? () => navigate(storesPath) : goBack}
                icon={ArrowLeftIcon}
              >
                {step === 0 ? 'Cancel' : 'Back'}
              </Button>

              <div className="flex items-center gap-3">
                <span className="hidden text-xs font-medium text-slate-400 sm:block">
                  Step {step + 1} of {STEPS.length}
                </span>
                {step < STEPS.length - 1 ? (
                  <Button onClick={goNext} disabled={!canContinue} iconRight={ArrowRightIcon}>
                    Continue
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    form="store-details-form"
                    loading={isSubmitting || createStore.isPending}
                    icon={CheckIcon}
                  >
                    Create store
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
