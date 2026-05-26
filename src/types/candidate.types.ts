export type Gender = 'MALE' | 'FEMALE' | 'OTHER';
export type CandidateType = 'NEW_JOINER' | 'EXISTING' | 'ANNUAL';

export interface Candidate {
  id: string;
  storeId: string;
  companyId: string;
  name: string;
  employeeCode: string;
  mobile: string;
  gender: Gender;
  age: number;
  candidateType: CandidateType;
  doj: string;
  pincode: string;
  email: string;
  panNumber: string | null;
  isActive: boolean;
  createdAt: string;
  store?: { id: string; name: string; storeCode: string } | null;
  company?: { id: string; name: string; code: string } | null;
}

export interface CreateCandidateInput {
  storeId: string;
  name: string;
  employeeCode: string;
  mobile: string;
  gender: Gender;
  age: number;
  candidateType: CandidateType;
  doj: string; // ISO date (YYYY-MM-DD)
  pincode: string;
  email: string;
  panNumber?: string;
}

export interface BulkUploadResult {
  created: number;
  skipped: number;
  errors: { row: number; mobile: string; reason: string }[];
}
