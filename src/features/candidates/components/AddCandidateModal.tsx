import { useState, type FormEvent } from 'react';
import { format } from 'date-fns';
import { Modal } from '../../../components/ui/Modal';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { DatePicker } from '../../../components/ui/DatePicker';
import { Button } from '../../../components/ui/Button';
import { useCreateCandidate } from '../hooks/useCreateCandidate';
import { getApiErrorMessage } from '../../../lib/apiError';
import {
  ZONE_OPTIONS,
  CITY_OPTIONS,
  STORE_OPTIONS,
  GENDER_OPTIONS,
  CANDIDATE_TYPE_OPTIONS,
} from '../candidate.constants';
import type { CandidateType, Gender } from '../../../types/candidate.types';

interface AddCandidateModalProps {
  open: boolean;
  onClose: () => void;
}

interface FormState {
  zone: string;
  city: string;
  store: string;
  name: string;
  employeeCode: string;
  mobileNumber: string;
  gender: string;
  age: string;
  candidateType: string;
  dateOfJoining: Date | undefined;
  pincode: string;
  email: string;
  panNumber: string;
}

const EMPTY: FormState = {
  zone: '',
  city: '',
  store: '',
  name: '',
  employeeCode: '',
  mobileNumber: '',
  gender: '',
  age: '',
  candidateType: '',
  dateOfJoining: undefined,
  pincode: '',
  email: '',
  panNumber: '',
};

type Errors = Partial<Record<keyof FormState, string>>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PAN_RE = /^[A-Z]{5}[0-9]{4}[A-Z]$/;

function validate(form: FormState): Errors {
  const e: Errors = {};
  if (!form.name.trim()) e.name = 'Name is required';
  if (!form.employeeCode.trim()) e.employeeCode = 'Employee code is required';
  if (!/^\d{10}$/.test(form.mobileNumber.trim())) e.mobileNumber = 'Enter a 10-digit mobile number';
  if (!form.gender) e.gender = 'Gender is required';
  const age = Number(form.age);
  if (!form.age.trim() || !Number.isInteger(age) || age < 18 || age > 100)
    e.age = 'Age must be 18–100';
  if (!form.candidateType) e.candidateType = 'Candidate type is required';
  if (!form.dateOfJoining) e.dateOfJoining = 'Date of joining is required';
  if (form.pincode.trim() && !/^\d{6}$/.test(form.pincode.trim()))
    e.pincode = 'Pincode must be 6 digits';
  if (form.email.trim() && !EMAIL_RE.test(form.email.trim())) e.email = 'Enter a valid email';
  if (form.panNumber.trim() && !PAN_RE.test(form.panNumber.trim().toUpperCase()))
    e.panNumber = 'Invalid PAN (e.g. ABCDE1234F)';
  return e;
}

export function AddCandidateModal({ open, onClose }: AddCandidateModalProps) {
  const [form, setForm] = useState<FormState>(EMPTY);
  const [errors, setErrors] = useState<Errors>({});
  const [apiError, setApiError] = useState('');
  const { mutateAsync, isPending } = useCreateCandidate();

  const set = <K extends keyof FormState>(key: K, val: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: val }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };
  const onInput = (key: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    set(key, e.target.value);

  const close = () => {
    setForm(EMPTY);
    setErrors({});
    setApiError('');
    onClose();
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setApiError('');
    const validationErrors = validate(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      await mutateAsync({
        zone: form.zone || undefined,
        city: form.city || undefined,
        store: form.store || undefined,
        name: form.name.trim(),
        employeeCode: form.employeeCode.trim(),
        mobileNumber: form.mobileNumber.trim(),
        gender: form.gender as Gender,
        age: Number(form.age),
        candidateType: form.candidateType as CandidateType,
        dateOfJoining: format(form.dateOfJoining as Date, 'yyyy-MM-dd'),
        pincode: form.pincode.trim() || undefined,
        email: form.email.trim() || undefined,
        panNumber: form.panNumber.trim().toUpperCase() || undefined,
      });
      close();
    } catch (err) {
      setApiError(getApiErrorMessage(err, 'Failed to create candidate.'));
    }
  };

  return (
    <Modal
      open={open}
      onClose={close}
      title="Add Candidate"
      size="xl"
      footer={
        <>
          <Button variant="outline" onClick={close} disabled={isPending}>
            Cancel
          </Button>
          <Button form="add-candidate-form" type="submit" loading={isPending}>
            Submit
          </Button>
        </>
      }
    >
      <form id="add-candidate-form" onSubmit={handleSubmit} className="space-y-5">
        {apiError && (
          <div className="rounded-xl bg-red-50 border border-red-100 px-3.5 py-2.5 text-sm text-red-600">
            {apiError}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-5 gap-y-4">
          <Select label="Zone" placeholder="Select zone" options={ZONE_OPTIONS} value={form.zone} onChange={onInput('zone')} />
          <Select label="City" placeholder="Select city" options={CITY_OPTIONS} value={form.city} onChange={onInput('city')} />
          <Select label="Store" placeholder="Select store" options={STORE_OPTIONS} value={form.store} onChange={onInput('store')} />

          <Input label="Name" required placeholder="Enter name" value={form.name} onChange={onInput('name')} error={errors.name} />
          <Input label="Employee Code" required placeholder="Enter employee code" value={form.employeeCode} onChange={onInput('employeeCode')} error={errors.employeeCode} />
          <Input label="Mobile Number" required placeholder="9999999999" inputMode="numeric" maxLength={10} value={form.mobileNumber} onChange={onInput('mobileNumber')} error={errors.mobileNumber} />

          <Select label="Gender" required placeholder="Select gender" options={GENDER_OPTIONS} value={form.gender} onChange={onInput('gender')} error={errors.gender} />
          <Input label="Age" required placeholder="Enter age" inputMode="numeric" value={form.age} onChange={onInput('age')} error={errors.age} />
          <Select label="Candidate Type" required placeholder="Select type" options={CANDIDATE_TYPE_OPTIONS} value={form.candidateType} onChange={onInput('candidateType')} error={errors.candidateType} />

          <DatePicker label="Date of Joining" required value={form.dateOfJoining} onChange={(d) => set('dateOfJoining', d)} error={errors.dateOfJoining} />
          <Input label="Pincode" placeholder="Enter pincode" inputMode="numeric" maxLength={6} value={form.pincode} onChange={onInput('pincode')} error={errors.pincode} />
          <Input label="Email Address" type="email" placeholder="Enter email address" value={form.email} onChange={onInput('email')} error={errors.email} />

          <Input label="PAN Number" placeholder="ABCDE1234F" maxLength={10} value={form.panNumber} onChange={onInput('panNumber')} error={errors.panNumber} className="uppercase" />
        </div>
      </form>
    </Modal>
  );
}
