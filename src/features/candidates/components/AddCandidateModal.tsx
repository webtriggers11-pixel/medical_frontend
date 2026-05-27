import { useMemo, useState, type FormEvent } from 'react';
import { format } from 'date-fns';
import { Modal } from '../../../components/ui/Modal';
import { Input } from '../../../components/ui/Input';
import { Combobox } from '../../../components/ui/Combobox';
import { DatePicker } from '../../../components/ui/DatePicker';
import { Button } from '../../../components/ui/Button';
import { useCreateCandidate } from '../hooks/useCreateCandidate';
import { useZones, useCities, useStores } from '../hooks/useOrgCascade';
import { getApiErrorMessage } from '../../../lib/apiError';
import { GENDER_OPTIONS, CANDIDATE_TYPE_OPTIONS } from '../candidate.constants';
import type { CandidateType, Gender } from '../../../types/candidate.types';

interface AddCandidateModalProps {
  open: boolean;
  onClose: () => void;
}

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
  pincode: string;
  email: string;
  panNumber: string;
}

const EMPTY: FormState = {
  zoneId: '', cityId: '', storeId: '', name: '', employeeCode: '', mobile: '',
  gender: '', age: '', candidateType: '', doj: undefined, pincode: '', email: '', panNumber: '',
};

type Errors = Partial<Record<keyof FormState, string>>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PAN_RE = /^[A-Z]{5}[0-9]{4}[A-Z]$/;

function validate(form: FormState): Errors {
  const e: Errors = {};
  if (!form.zoneId) e.zoneId = 'Zone is required';
  if (!form.cityId) e.cityId = 'City is required';
  if (!form.storeId) e.storeId = 'Store is required';
  if (!form.name.trim()) e.name = 'Name is required';
  if (!form.employeeCode.trim()) e.employeeCode = 'Employee code is required';
  if (!/^\d{10}$/.test(form.mobile.trim())) e.mobile = 'Enter a 10-digit mobile number';
  if (!form.gender) e.gender = 'Gender is required';
  const age = Number(form.age);
  if (!form.age.trim() || !Number.isInteger(age) || age < 18 || age > 100) e.age = 'Age must be 18–100';
  if (!form.candidateType) e.candidateType = 'Candidate type is required';
  if (!form.doj) e.doj = 'Date of joining is required';
  if (!/^\d{6}$/.test(form.pincode.trim())) e.pincode = 'Pincode must be 6 digits';
  if (!EMAIL_RE.test(form.email.trim())) e.email = 'Enter a valid email';
  if (form.panNumber.trim() && !PAN_RE.test(form.panNumber.trim().toUpperCase()))
    e.panNumber = 'Invalid PAN (e.g. ABCDE1234F)';
  return e;
}

export function AddCandidateModal({ open, onClose }: AddCandidateModalProps) {
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

  const set = <K extends keyof FormState>(key: K, val: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: val }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };
  const onInput = (key: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement>) =>
    set(key, e.target.value);
  const onPick = (key: keyof FormState) => (value: string) => set(key, value);

  // Cascade resets: changing zone clears city+store; changing city clears store.
  const onZoneChange = (value: string) => {
    setForm((prev) => ({ ...prev, zoneId: value, cityId: '', storeId: '' }));
    setErrors((prev) => ({ ...prev, zoneId: undefined }));
  };
  const onCityChange = (value: string) => {
    setForm((prev) => ({ ...prev, cityId: value, storeId: '' }));
    setErrors((prev) => ({ ...prev, cityId: undefined }));
  };

  const close = () => {
    setForm(EMPTY);
    setErrors({});
    setApiError('');
    onClose();
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setApiError('');
    const v = validate(form);
    if (Object.keys(v).length > 0) {
      setErrors(v);
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
        pincode: form.pincode.trim(),
        email: form.email.trim(),
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
          <Button variant="outline" onClick={close} disabled={isPending}>Cancel</Button>
          <Button form="add-candidate-form" type="submit" loading={isPending}>Submit</Button>
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
          <Combobox label="Zone" required placeholder={zonesLoading ? 'Loading…' : 'Select zone'}
            options={zoneOptions} value={form.zoneId} onChange={onZoneChange} error={errors.zoneId} />
          <Combobox label="City" required placeholder={!form.zoneId ? 'Select zone first' : citiesLoading ? 'Loading…' : 'Select city'}
            options={cityOptions} value={form.cityId} onChange={onCityChange} error={errors.cityId} disabled={!form.zoneId} />
          <Combobox label="Store" required placeholder={!form.cityId ? 'Select city first' : storesLoading ? 'Loading…' : 'Select store'}
            options={storeOptions} value={form.storeId} onChange={onPick('storeId')} error={errors.storeId} disabled={!form.cityId} />

          <Input label="Name" required placeholder="Enter name" value={form.name} onChange={onInput('name')} error={errors.name} />
          <Input label="Employee Code" required placeholder="Enter employee code" value={form.employeeCode} onChange={onInput('employeeCode')} error={errors.employeeCode} />
          <Input label="Mobile Number" required placeholder="9999999999" inputMode="numeric" maxLength={10} value={form.mobile} onChange={onInput('mobile')} error={errors.mobile} />

          <Combobox label="Gender" required placeholder="Select gender" options={GENDER_OPTIONS} value={form.gender} onChange={onPick('gender')} error={errors.gender} />
          <Input label="Age" required placeholder="Enter age" inputMode="numeric" maxLength={3} value={form.age} onChange={onInput('age')} error={errors.age} />
          <Combobox label="Candidate Type" required placeholder="Select type" options={CANDIDATE_TYPE_OPTIONS} value={form.candidateType} onChange={onPick('candidateType')} error={errors.candidateType} />

          <DatePicker label="Date of Joining" required value={form.doj} onChange={(d) => set('doj', d)} error={errors.doj} />
          <Input label="Pincode" required placeholder="Enter pincode" inputMode="numeric" maxLength={6} value={form.pincode} onChange={onInput('pincode')} error={errors.pincode} />
          <Input label="Email Address" required type="email" placeholder="Enter email address" value={form.email} onChange={onInput('email')} error={errors.email} />

          <Input label="PAN Number" placeholder="ABCDE1234F" maxLength={10} value={form.panNumber} onChange={onInput('panNumber')} error={errors.panNumber} className="uppercase" />
        </div>
      </form>
    </Modal>
  );
}
