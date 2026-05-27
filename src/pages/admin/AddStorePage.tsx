import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import {
  useZones,
  useCities,
  useCreateStore,
} from '../../features/org/hooks/useOrg';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Combobox } from '../../components/ui/Combobox';
import { getApiErrorMessage } from '../../lib/apiError';
import type { CreateStoreInput } from '../../types/org.types';

/* ── icons ──────────────────────────────────────────────────────────── */

const ArrowLeftIcon = (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
  </svg>
);
const ArrowRightIcon = (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
  </svg>
);
const CheckIcon = (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
  </svg>
);
const LockIcon = (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 0h10.5a2.25 2.25 0 012.25 2.25v6.75a2.25 2.25 0 01-2.25 2.25H6.75a2.25 2.25 0 01-2.25-2.25v-6.75a2.25 2.25 0 012.25-2.25z" />
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

/* ── stepper ────────────────────────────────────────────────────────── */

const STEPS = [
  { title: 'Zone', desc: 'Choose a region', icon: MapIcon },
  { title: 'City', desc: 'Choose a city', icon: BuildingIcon },
  { title: 'Details', desc: 'Store information', icon: StoreIcon },
];

function Stepper({ current }: { current: number }) {
  return (
    <div className="flex items-center">
      {STEPS.map((s, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <div key={s.title} className="flex flex-1 items-center last:flex-none">
            <div className="flex items-center gap-3">
              <div
                className={`
                  relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border transition-all duration-300
                  ${done ? 'border-primary-600 bg-primary-600 text-white shadow-sm' : ''}
                  ${active ? 'border-primary-500 bg-primary-50 text-primary-600 ring-4 ring-primary-500/10 scale-105' : ''}
                  ${!done && !active ? 'border-border bg-surface text-slate-400' : ''}
                `}
              >
                <span
                  className={`transition-all duration-300 ${done ? 'scale-100 opacity-100' : 'scale-50 opacity-0 absolute'}`}
                >
                  {CheckIcon}
                </span>
                <span
                  className={`transition-all duration-300 ${done ? 'scale-50 opacity-0 absolute' : 'scale-100 opacity-100'}`}
                >
                  {s.icon}
                </span>
              </div>
              <div className="hidden sm:block">
                <p
                  className={`text-sm font-semibold transition-colors ${active || done ? 'text-slate-900' : 'text-slate-400'}`}
                >
                  {s.title}
                </p>
                <p className="text-xs text-slate-400">{s.desc}</p>
              </div>
            </div>
            {i < STEPS.length - 1 && (
              <div className="mx-3 h-0.5 flex-1 overflow-hidden rounded-full bg-border sm:mx-4">
                <div
                  className="h-full rounded-full bg-primary-500 transition-all duration-500 ease-out"
                  style={{ width: done ? '100%' : '0%' }}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ── locked summary field (step 3) ─────────────────────────────────── */

function LockedField({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-slate-700">{label}</label>
      <div className="flex h-10 w-full items-center gap-2.5 rounded-xl border border-border bg-slate-50 px-3.5 text-sm">
        <span className="text-slate-400">{LockIcon}</span>
        <span className="flex-1 truncate font-medium text-slate-700">{value}</span>
      </div>
    </div>
  );
}

/* ── form types ─────────────────────────────────────────────────────── */

type StoreFormValues = {
  name: string;
  storeCode: string;
  address: string;
  storeHeadName: string;
  storeHeadMobile: string;
  email: string;
};

export function AddStorePage() {
  const navigate = useNavigate();
  const storesPath = '/stores';

  const [step, setStep] = useState(0);
  const [zoneId, setZoneId] = useState('');
  const [cityId, setCityId] = useState('');
  const [apiError, setApiError] = useState('');

  const { data: zones } = useZones();
  const { data: cities } = useCities(zoneId);

  const createStore = useCreateStore();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<StoreFormValues>();

  const selectedZone = zones?.find((z) => z.id === zoneId);
  const selectedCity = cities?.find((c) => c.id === cityId);

  const zoneOptions = zones?.map((z) => ({ value: z.id, label: z.name })) ?? [];
  const cityOptions = cities?.map((c) => ({ value: c.id, label: c.name })) ?? [];

  /* ── handlers ─────────────────────────────────────────────────────── */

  const handleZoneSelect = (id: string) => {
    setZoneId(id);
    setCityId('');
    setApiError('');
  };

  const goNext = () => {
    setApiError('');
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };
  const goBack = () => {
    setApiError('');
    setStep((s) => Math.max(s - 1, 0));
  };

  const onSubmit = async (values: StoreFormValues) => {
    if (!cityId) return;
    setApiError('');
    const payload: CreateStoreInput = {
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

  const canContinue = step === 0 ? !!zoneId : step === 1 ? !!cityId : true;

  /* ── render ───────────────────────────────────────────────────────── */

  return (
    <div className="mx-auto max-w-3xl space-y-8 animate-fade-in pb-10">
      {/* Header */}
      <div className="space-y-4">
        <button
          onClick={() => navigate(storesPath)}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition-colors hover:text-slate-800"
        >
          {ArrowLeftIcon}
          Back to stores
        </button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Add a new store</h1>
          <p className="mt-1 text-slate-500">
            Set the location, then fill in the store details — done in three quick steps.
          </p>
        </div>
      </div>

      {/* Stepper */}
      <div className="rounded-2xl border border-border bg-surface p-5 shadow-card">
        <Stepper current={step} />
      </div>

      {/* Step card */}
      <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-card">
        {/* gradient accent strip */}
        <div className="h-1 w-full bg-gradient-to-r from-primary-500 via-primary-400 to-primary-600" />

        <div className="p-6 sm:p-8">
          {apiError && (
            <p className="mb-5 rounded-xl bg-danger-light px-4 py-2.5 text-sm font-medium text-red-600">
              {apiError}
            </p>
          )}

          {/* STEP 1 — ZONE */}
          {step === 0 && (
            <div key="step-0" className="space-y-6 animate-slide-in-right">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
                  {MapIcon}
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">Which zone?</h2>
                  <p className="text-sm text-slate-500">
                    Search and select the zone this store belongs to.
                  </p>
                </div>
              </div>

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

          {/* STEP 2 — CITY */}
          {step === 1 && (
            <div key="step-1" className="space-y-6 animate-slide-in-right">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
                  {BuildingIcon}
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">
                    Which city in {selectedZone?.name}?
                  </h2>
                  <p className="text-sm text-slate-500">
                    Search and select the city in this zone for the store.
                  </p>
                </div>
              </div>

              <Combobox
                label="City"
                required
                options={cityOptions}
                value={cityId}
                onChange={(id) => {
                  setCityId(id);
                  setApiError('');
                }}
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

          {/* STEP 3 — DETAILS */}
          {step === 2 && (
            <div key="step-2" className="space-y-6 animate-slide-in-right">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
                  {StoreIcon}
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">Store details</h2>
                  <p className="text-sm text-slate-500">
                    Location is locked in — just fill in the rest to create the store.
                  </p>
                </div>
              </div>

              {/* Locked location summary */}
              <div className="grid grid-cols-1 gap-4 rounded-xl bg-slate-50/70 p-4 sm:grid-cols-2">
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
            {step < 2 ? (
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
  );
}
