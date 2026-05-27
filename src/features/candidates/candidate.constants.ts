import type { SelectOption } from '../../components/ui/Select';

export const GENDER_OPTIONS: SelectOption[] = [
  { label: 'Male', value: 'MALE' },
  { label: 'Female', value: 'FEMALE' },
  { label: 'Other', value: 'OTHER' },
];

export const CANDIDATE_TYPE_OPTIONS: SelectOption[] = [
  { label: 'New Joiner', value: 'NEW_JOINER' },
  { label: 'Existing', value: 'EXISTING' },
  { label: 'Annual', value: 'ANNUAL' },
];
