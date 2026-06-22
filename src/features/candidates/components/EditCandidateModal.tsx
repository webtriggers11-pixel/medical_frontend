import { useState } from 'react';
import { format } from 'date-fns';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Combobox } from '../../../components/ui/Combobox';
import { DatePicker } from '../../../components/ui/DatePicker';
import { useUpdateCandidate } from '../hooks/useCandidates';
import { GENDER_OPTIONS, CANDIDATE_TYPE_OPTIONS } from '../candidate.constants';
import { getApiErrorMessage } from '../../../lib/apiError';
import type {
  Candidate,
  CandidateType,
  Gender,
  UpdateCandidateInput,
} from '../../../types/candidate.types';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PAN_RE = /^[A-Z]{5}[0-9]{4}[A-Z]$/;

interface FormState {
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

type Errors = Partial<Record<keyof FormState, string>>;

function toDate(iso: string | null): Date | undefined {
  return iso ? new Date(iso) : undefined;
}

function initial(c: Candidate): FormState {
  return {
    name: c.name ?? '',
    employeeCode: c.employeeCode ?? '',
    mobile: c.mobile ?? '',
    gender: c.gender ?? '',
    age: c.age != null ? String(c.age) : '',
    candidateType: c.candidateType ?? '',
    doj: toDate(c.doj),
    appointmentDate: toDate(c.appointmentDate),
    pincode: c.pincode ?? '',
    email: c.email ?? '',
    panNumber: c.panNumber ?? '',
  };
}

function validate(f: FormState): Errors {
  const e: Errors = {};
  if (!f.name.trim()) e.name = 'Name is required';
  if (!/^\d{10}$/.test(f.mobile.trim())) e.mobile = 'Enter a 10-digit mobile number';
  if (!f.gender) e.gender = 'Gender is required';
  const age = Number(f.age);
  if (!f.age.trim() || !Number.isInteger(age) || age < 18 || age > 100)
    e.age = 'Age must be 18–100';
  if (!f.candidateType) e.candidateType = 'Candidate type is required';
  if (!f.doj) e.doj = 'Date of joining is required';
  if (!/^\d{6}$/.test(f.pincode.trim())) e.pincode = 'Pincode must be 6 digits';
  if (f.email.trim() && !EMAIL_RE.test(f.email.trim())) e.email = 'Enter a valid email';
  if (f.panNumber.trim() && !PAN_RE.test(f.panNumber.trim().toUpperCase()))
    e.panNumber = 'Invalid PAN (e.g. ABCDE1234F)';
  return e;
}

/**
 * Admin-only candidate edit. Store/client are immutable (shown read-only) —
 * see UpdateCandidateInput. Mount with `key={candidate.id}` so the form resets
 * per candidate.
 */
export function EditCandidateModal({
  open,
  onClose,
  candidate,
}: {
  open: boolean;
  onClose: () => void;
  candidate: Candidate;
}) {
  const [form, setForm] = useState<FormState>(() => initial(candidate));
  const [errors, setErrors] = useState<Errors>({});
  const [apiError, setApiError] = useState('');
  const update = useUpdateCandidate();

  const set = (key: keyof FormState, value: FormState[keyof FormState]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };
  const onInput =
    (key: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement>) =>
      set(key, e.target.value);

  const handleSubmit = async () => {
    setApiError('');
    const v = validate(form);
    if (Object.keys(v).length > 0) {
      setErrors(v);
      return;
    }
    const input: UpdateCandidateInput = {
      name: form.name.trim(),
      employeeCode: form.employeeCode.trim() || undefined,
      mobile: form.mobile.trim(),
      gender: form.gender as Gender,
      age: Number(form.age),
      candidateType: form.candidateType as CandidateType,
      doj: format(form.doj as Date, 'yyyy-MM-dd'),
      appointmentDate: form.appointmentDate
        ? format(form.appointmentDate, 'yyyy-MM-dd')
        : undefined,
      pincode: form.pincode.trim(),
      email: form.email.trim() || undefined,
      panNumber: form.panNumber.trim().toUpperCase() || undefined,
    };
    try {
      await update.mutateAsync({ id: candidate.id, input });
      onClose();
    } catch (err) {
      setApiError(getApiErrorMessage(err, 'Failed to update candidate.'));
    }
  };

  const storeText = candidate.store
    ? `${candidate.store.name}${candidate.store.storeCode ? ` (${candidate.store.storeCode})` : ''}`
    : '—';
  const clientText = candidate.client?.name ?? candidate.client?.email ?? '—';

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Edit candidate"
      size="lg"
      footer={
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose} disabled={update.isPending}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} loading={update.isPending}>
            Save changes
          </Button>
        </div>
      }
    >
      <div className="space-y-5">
        {apiError && (
          <p className="rounded-xl border border-danger/20 bg-danger-light px-4 py-2.5 text-sm font-medium text-red-600">
            {apiError}
          </p>
        )}

        {/* Locked store/client context */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-border bg-slate-50/60 px-3 py-2">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Store (locked)</p>
            <p className="mt-0.5 text-sm font-medium text-slate-700">{storeText}</p>
          </div>
          <div className="rounded-xl border border-border bg-slate-50/60 px-3 py-2">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Client (locked)</p>
            <p className="mt-0.5 text-sm font-medium text-slate-700">{clientText}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input label="Full name" value={form.name} onChange={onInput('name')} error={errors.name} required />
          <Input label="Employee code" value={form.employeeCode} onChange={onInput('employeeCode')} error={errors.employeeCode} />
          <Input label="Mobile" value={form.mobile} onChange={onInput('mobile')} error={errors.mobile} required />
          <Combobox label="Gender" options={GENDER_OPTIONS} value={form.gender} onChange={(v) => set('gender', v)} error={errors.gender} placeholder="Select gender" />
          <Input label="Age" type="number" value={form.age} onChange={onInput('age')} error={errors.age} required />
          <Combobox label="Candidate type" options={CANDIDATE_TYPE_OPTIONS} value={form.candidateType} onChange={(v) => set('candidateType', v)} error={errors.candidateType} placeholder="Select type" />
          <DatePicker label="Date of joining" value={form.doj} onChange={(d) => set('doj', d)} error={errors.doj} />
          <DatePicker label="Appointment date" value={form.appointmentDate} onChange={(d) => set('appointmentDate', d)} error={errors.appointmentDate} />
          <Input label="Pincode" value={form.pincode} onChange={onInput('pincode')} error={errors.pincode} required />
          <Input label="Email" value={form.email} onChange={onInput('email')} error={errors.email} />
          <Input label="PAN number" value={form.panNumber} onChange={onInput('panNumber')} error={errors.panNumber} />
        </div>
      </div>
    </Modal>
  );
}
