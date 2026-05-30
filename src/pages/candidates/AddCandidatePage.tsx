import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Combobox } from '../../components/ui/Combobox';
import { DatePicker } from '../../components/ui/DatePicker';
import { useCreateCandidate } from '../../features/candidates/hooks/useCreateCandidate';
import { useZones, useCities, useStores } from '../../features/candidates/hooks/useOrgCascade';
import { GENDER_OPTIONS, CANDIDATE_TYPE_OPTIONS } from '../../features/candidates/candidate.constants';
import { getApiErrorMessage } from '../../lib/apiError';
import type { CandidateType, Gender } from '../../types/candidate.types';
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

const LocationIcon = (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
  </svg>
);
const UserIcon = (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
  </svg>
);
const BriefcaseIcon = (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.073a2.25 2.25 0 01-2.063 2.243C16.78 20.595 15.4 20.7 14 20.7s-2.78-.105-4.187-.234A2.25 2.25 0 017.75 18.223V14.15M12 14.25v.01M3.75 9.75h16.5a1.5 1.5 0 011.5 1.5v.964a1.5 1.5 0 01-1.06 1.433A49.5 49.5 0 0112 15.25c-2.92 0-5.78-.26-8.69-.603A1.5 1.5 0 012.25 13.214v-.964a1.5 1.5 0 011.5-1.5zM16.5 6.75V6a2.25 2.25 0 00-2.25-2.25h-4.5A2.25 2.25 0 007.5 6v.75" />
  </svg>
);

const CalendarIcon = (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
  </svg>
);

const STEPS: WizardStep[] = [
  { title: 'Location', desc: 'Zone, city & store', icon: LocationIcon },
  { title: 'Personal', desc: 'Candidate details', icon: UserIcon },
  { title: 'Employment', desc: 'Job & ID details', icon: BriefcaseIcon },
  { title: 'Appointment', desc: 'Schedule checkup', icon: CalendarIcon },
];

/* ── form ───────────────────────────────────────────────────────────── */

interface FormState {
  zoneId: string;
  cityId: string;
  storeId: string;
  name: string;
  employeeCode: string;
  mobile: string;
  gender: string;
  age: string;
  candidateType: string;
  doj: Date | undefined;
  appointmentDate: Date | undefined;
  pincode: string;
  email: string;
  panNumber: string;
}

const EMPTY: FormState = {
  zoneId: '', cityId: '', storeId: '', name: '', employeeCode: '', mobile: '',
  gender: '', age: '', candidateType: '', doj: undefined, appointmentDate: undefined,
  pincode: '', email: '', panNumber: '',
};

type Errors = Partial<Record<keyof FormState, string>>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PAN_RE = /^[A-Z]{5}[0-9]{4}[A-Z]$/;

function validateLocation(f: FormState): Errors {
  const e: Errors = {};
  if (!f.zoneId) e.zoneId = 'Zone is required';
  if (!f.cityId) e.cityId = 'City is required';
  if (!f.storeId) e.storeId = 'Store is required';
  return e;
}

function validatePersonal(f: FormState): Errors {
  const e: Errors = {};
  if (!f.name.trim()) e.name = 'Name is required';
  if (!f.employeeCode.trim()) e.employeeCode = 'Employee code is required';
  if (!/^\d{10}$/.test(f.mobile.trim())) e.mobile = 'Enter a 10-digit mobile number';
  if (!f.gender) e.gender = 'Gender is required';
  const age = Number(f.age);
  if (!f.age.trim() || !Number.isInteger(age) || age < 18 || age > 100) e.age = 'Age must be 18–100';
  if (!EMAIL_RE.test(f.email.trim())) e.email = 'Enter a valid email';
  return e;
}

function validateEmployment(f: FormState): Errors {
  const e: Errors = {};
  if (!f.candidateType) e.candidateType = 'Candidate type is required';
  if (!f.doj) e.doj = 'Date of joining is required';
  if (!/^\d{6}$/.test(f.pincode.trim())) e.pincode = 'Pincode must be 6 digits';
  if (f.panNumber.trim() && !PAN_RE.test(f.panNumber.trim().toUpperCase()))
    e.panNumber = 'Invalid PAN (e.g. ABCDE1234F)';
  return e;
}

function validateAppointment(f: FormState): Errors {
  const e: Errors = {};
  if (!f.appointmentDate) e.appointmentDate = 'Appointment date is required';
  return e;
}

const firstInvalidStep = (e: Errors): number => {
  if (e.zoneId || e.cityId || e.storeId) return 0;
  if (e.name || e.employeeCode || e.mobile || e.gender || e.age || e.email) return 1;
  if (e.candidateType || e.doj || e.pincode || e.panNumber) return 2;
  return 3;
};

export function AddCandidatePage() {
  const navigate = useNavigate();
  const candidatesPath = '/candidates';

  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [errors, setErrors] = useState<Errors>({});
  const [apiError, setApiError] = useState('');

  const { mutateAsync, isPending } = useCreateCandidate();

  const { data: zones, isLoading: zonesLoading } = useZones();
  const { data: cities, isLoading: citiesLoading } = useCities(form.zoneId || undefined);
  const { data: stores, isLoading: storesLoading } = useStores(form.cityId || undefined);

  const zoneOptions = useMemo(() => (zones ?? []).map((z) => ({ label: z.name, value: z.id })), [zones]);
  const cityOptions = useMemo(() => (cities ?? []).map((c) => ({ label: c.name, value: c.id })), [cities]);
  const storeOptions = useMemo(
    () => (stores ?? []).map((s) => ({ label: `${s.name} (${s.storeCode})`, value: s.id })),
    [stores],
  );

  const selectedZone = zones?.find((z) => z.id === form.zoneId);
  const selectedCity = cities?.find((c) => c.id === form.cityId);
  const selectedStore = stores?.find((s) => s.id === form.storeId);
  const candidateTypeLabel = CANDIDATE_TYPE_OPTIONS.find((o) => o.value === form.candidateType)?.label;

  const set = <K extends keyof FormState>(key: K, val: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: val }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };
  const onInput = (key: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement>) => set(key, e.target.value);
  const onPick = (key: keyof FormState) => (value: string) => set(key, value);

  // Cascade resets: zone clears city+store; city clears store.
  const onZoneChange = (value: string) => {
    setForm((prev) => ({ ...prev, zoneId: value, cityId: '', storeId: '' }));
    setErrors((prev) => ({ ...prev, zoneId: undefined }));
  };
  const onCityChange = (value: string) => {
    setForm((prev) => ({ ...prev, cityId: value, storeId: '' }));
    setErrors((prev) => ({ ...prev, cityId: undefined }));
  };

  const goNext = () => {
    const v =
      step === 0
        ? validateLocation(form)
        : step === 1
          ? validatePersonal(form)
          : validateEmployment(form);
    if (Object.keys(v).length > 0) {
      setErrors(v);
      return;
    }
    setErrors({});
    setApiError('');
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };
  const goBack = () => {
    setApiError('');
    setStep((s) => Math.max(s - 1, 0));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError('');
    const all = {
      ...validateLocation(form),
      ...validatePersonal(form),
      ...validateEmployment(form),
      ...validateAppointment(form),
    };
    if (Object.keys(all).length > 0) {
      setErrors(all);
      setStep(firstInvalidStep(all));
      return;
    }
    try {
      await mutateAsync({
        storeId: form.storeId,
        name: form.name.trim(),
        employeeCode: form.employeeCode.trim(),
        mobile: form.mobile.trim(),
        gender: form.gender as Gender,
        age: Number(form.age),
        candidateType: form.candidateType as CandidateType,
        doj: format(form.doj as Date, 'yyyy-MM-dd'),
        appointmentDate: format(form.appointmentDate as Date, 'yyyy-MM-dd'),
        pincode: form.pincode.trim(),
        email: form.email.trim(),
        panNumber: form.panNumber.trim().toUpperCase() || undefined,
      });
      navigate(candidatesPath);
    } catch (err) {
      setApiError(getApiErrorMessage(err, 'Failed to create candidate.'));
    }
  };

  // Appointments can only be booked from tomorrow onward — today and past
  // dates are disabled in the calendar.
  const minAppointmentDate = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 1);
    return d;
  }, []);

  const canContinue = step === 0 ? !!form.storeId : true;
  const locationValue = selectedStore?.name ?? selectedCity?.name ?? selectedZone?.name;
  const appointmentValue = form.appointmentDate ? format(form.appointmentDate, 'd MMM yyyy') : undefined;
  const summaryValues = [locationValue, form.name.trim() || undefined, candidateTypeLabel, appointmentValue];

  /* ── render ───────────────────────────────────────────────────────── */

  return (
    <div className="mx-auto max-w-5xl space-y-6 animate-fade-in pb-10">
      {/* Back link */}
      <button
        onClick={() => navigate(candidatesPath)}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition-colors hover:text-slate-800"
      >
        {ArrowLeftIcon}
        Back to candidates
      </button>

      <WizardHero
        eyebrow="New candidate"
        title="Add a new candidate"
        subtitle="Pick the store, add the candidate's details, then schedule the appointment — four quick steps."
        watermark={UserIcon}
      />

      {/* Two-pane: live summary + active step */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[300px_1fr]">
        {/* Summary sidebar (desktop) */}
        <aside className="hidden lg:block">
          <div className="glass sticky top-6 space-y-6 rounded-3xl border border-border/70 p-6 shadow-card">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-primary-600">Building</p>
              <p className="mt-1 truncate text-base font-semibold text-slate-900">
                {form.name.trim() || 'New candidate'}
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

              {/* STEP 1 — LOCATION */}
              {step === 0 && (
                <div key="step-0" className="space-y-6 animate-slide-in-right">
                  <StepHeading icon={LocationIcon} title="Where does this candidate work?" subtitle="Pick the zone, city and store this candidate belongs to." />
                  <div className="grid grid-cols-1 gap-x-5 gap-y-4 sm:grid-cols-3">
                    <Combobox
                      label="Zone"
                      required
                      placeholder={zonesLoading ? 'Loading…' : 'Select zone'}
                      options={zoneOptions}
                      value={form.zoneId}
                      onChange={onZoneChange}
                      error={errors.zoneId}
                      loading={zonesLoading}
                    />
                    <Combobox
                      label="City"
                      required
                      placeholder={!form.zoneId ? 'Select zone first' : citiesLoading ? 'Loading…' : 'Select city'}
                      options={cityOptions}
                      value={form.cityId}
                      onChange={onCityChange}
                      error={errors.cityId}
                      disabled={!form.zoneId}
                      loading={citiesLoading}
                    />
                    <Combobox
                      label="Store"
                      required
                      placeholder={!form.cityId ? 'Select city first' : storesLoading ? 'Loading…' : 'Select store'}
                      options={storeOptions}
                      value={form.storeId}
                      onChange={onPick('storeId')}
                      error={errors.storeId}
                      disabled={!form.cityId}
                      loading={storesLoading}
                    />
                  </div>
                  {selectedStore && (
                    <div className="flex items-center gap-2 rounded-xl border border-success/30 bg-success-light/50 px-4 py-3 text-sm text-emerald-700 animate-slide-in">
                      <span className="text-success">{CheckIcon}</span>
                      <span>
                        <span className="font-semibold">{selectedStore.name}</span> selected in{' '}
                        <span className="font-semibold">{selectedCity?.name}</span>.
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* STEP 2 — PERSONAL */}
              {step === 1 && (
                <div key="step-1" className="space-y-6 animate-slide-in-right">
                  <StepHeading icon={UserIcon} title="Candidate details" subtitle="Who is the candidate? Add their personal and contact details." />
                  <div className="grid grid-cols-1 gap-x-5 gap-y-4 sm:grid-cols-2">
                    <Input label="Name" required placeholder="Enter name" value={form.name} onChange={onInput('name')} error={errors.name} />
                    <Input label="Employee Code" required placeholder="Enter employee code" value={form.employeeCode} onChange={onInput('employeeCode')} error={errors.employeeCode} />
                    <Input label="Mobile Number" required placeholder="9999999999" inputMode="numeric" maxLength={10} value={form.mobile} onChange={onInput('mobile')} error={errors.mobile} />
                    <Input label="Email Address" required type="email" placeholder="Enter email address" value={form.email} onChange={onInput('email')} error={errors.email} />
                    <Combobox label="Gender" required placeholder="Select gender" options={GENDER_OPTIONS} value={form.gender} onChange={onPick('gender')} error={errors.gender} />
                    <Input label="Age" required placeholder="Enter age" inputMode="numeric" maxLength={3} value={form.age} onChange={onInput('age')} error={errors.age} />
                  </div>
                </div>
              )}

              {/* STEP 3 — EMPLOYMENT */}
              {step === 2 && (
                <div key="step-2" className="space-y-6 animate-slide-in-right">
                  <StepHeading icon={BriefcaseIcon} title="Employment & ID" subtitle="Location is locked in — add the job and ID details, then schedule the appointment." />

                  <div className="grid grid-cols-1 gap-4 rounded-2xl border border-border/60 bg-slate-50/70 p-4 sm:grid-cols-3">
                    <LockedField label="Zone" value={selectedZone?.name ?? '—'} />
                    <LockedField label="City" value={selectedCity?.name ?? '—'} />
                    <LockedField label="Store" value={selectedStore?.name ?? '—'} />
                  </div>

                  <form id="candidate-details-form" onSubmit={(e) => { e.preventDefault(); goNext(); }}>
                    <fieldset disabled={isPending} className="grid grid-cols-1 gap-x-5 gap-y-4 sm:grid-cols-2">
                    <Combobox label="Candidate Type" required placeholder="Select type" options={CANDIDATE_TYPE_OPTIONS} value={form.candidateType} onChange={onPick('candidateType')} error={errors.candidateType} />
                    <DatePicker label="Date of Joining" required value={form.doj} onChange={(d) => set('doj', d)} error={errors.doj} />
                    <Input label="Pincode" required placeholder="Enter pincode" inputMode="numeric" maxLength={6} value={form.pincode} onChange={onInput('pincode')} error={errors.pincode} />
                    <Input label="PAN Number" placeholder="ABCDE1234F" maxLength={10} value={form.panNumber} onChange={onInput('panNumber')} error={errors.panNumber} className="uppercase" />
                    </fieldset>
                  </form>
                </div>
              )}

              {/* STEP 4 — APPOINTMENT */}
              {step === 3 && (
                <div key="step-3" className="space-y-6 animate-slide-in-right">
                  <StepHeading icon={CalendarIcon} title="Schedule appointment" subtitle="Pick a date for the candidate's health checkup. This is optional — you can leave it blank and schedule later." />

                  <div className="grid grid-cols-1 gap-4 rounded-2xl border border-border/60 bg-slate-50/70 p-4 sm:grid-cols-3">
                    <LockedField label="Store" value={selectedStore?.name ?? '—'} />
                    <LockedField label="Candidate" value={form.name.trim() || '—'} />
                    <LockedField label="Joining" value={form.doj ? format(form.doj, 'd MMM yyyy') : '—'} />
                  </div>

                  <form id="appointment-form" onSubmit={handleSubmit}>
                    <fieldset disabled={isPending} className="grid grid-cols-1 gap-x-5 gap-y-4 sm:grid-cols-2">
                      <DatePicker label="Appointment Date" required minDate={minAppointmentDate} value={form.appointmentDate} onChange={(d) => set('appointmentDate', d)} error={errors.appointmentDate} />
                    </fieldset>
                  </form>
                </div>
              )}
            </div>

            {/* Footer nav */}
            <div className="flex items-center justify-between gap-3 border-t border-border bg-slate-50/50 px-6 py-4 sm:px-8">
              <Button
                variant="ghost"
                onClick={step === 0 ? () => navigate(candidatesPath) : goBack}
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
                  <Button type="submit" form="appointment-form" loading={isPending} icon={CheckIcon}>
                    Create candidate
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
