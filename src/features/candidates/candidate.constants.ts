import type { SelectOption } from '../../components/ui/Select';

/**
 * Master-data options for the candidate form dropdowns.
 * Centralised here so the form, filters and any future admin screen stay in sync.
 * Replace with API-driven data when a master-data service exists.
 */
export const ZONE_OPTIONS: SelectOption[] = [
  { label: 'North', value: 'North' },
  { label: 'South', value: 'South' },
  { label: 'East', value: 'East' },
  { label: 'West', value: 'West' },
  { label: 'Central', value: 'Central' },
];

export const CITY_OPTIONS: SelectOption[] = [
  { label: 'Guwahati', value: 'Guwahati' },
  { label: 'Mumbai', value: 'Mumbai' },
  { label: 'Delhi', value: 'Delhi' },
  { label: 'Bengaluru', value: 'Bengaluru' },
  { label: 'Kolkata', value: 'Kolkata' },
  { label: 'Chennai', value: 'Chennai' },
  { label: 'Hyderabad', value: 'Hyderabad' },
  { label: 'Pune', value: 'Pune' },
];

export const STORE_OPTIONS: SelectOption[] = [
  { label: 'Semolina Kitchens Pvt. Ltd.', value: 'Semolina Kitchens Pvt. Ltd.' },
  { label: 'MediSync Central Store', value: 'MediSync Central Store' },
  { label: 'MediSync North Hub', value: 'MediSync North Hub' },
  { label: 'MediSync South Hub', value: 'MediSync South Hub' },
];

export const GENDER_OPTIONS: SelectOption[] = [
  { label: 'Male', value: 'MALE' },
  { label: 'Female', value: 'FEMALE' },
  { label: 'Other', value: 'OTHER' },
];

export const CANDIDATE_TYPE_OPTIONS: SelectOption[] = [
  { label: 'Existing', value: 'EXISTING' },
  { label: 'New', value: 'NEW' },
];
