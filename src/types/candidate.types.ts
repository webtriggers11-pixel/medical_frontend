export type Gender = 'MALE' | 'FEMALE' | 'OTHER';
export type CandidateType = 'EXISTING' | 'NEW';

export interface Candidate {
  id: string;
  zone: string | null;
  city: string | null;
  store: string | null;
  name: string;
  employeeCode: string;
  mobileNumber: string;
  gender: Gender;
  age: number;
  candidateType: CandidateType;
  dateOfJoining: string;
  pincode: string | null;
  email: string | null;
  panNumber: string | null;
  isActive: boolean;
  isDeleted: boolean;
  createdById: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCandidateInput {
  zone?: string;
  city?: string;
  store?: string;
  name: string;
  employeeCode: string;
  mobileNumber: string;
  gender: Gender;
  age: number;
  candidateType: CandidateType;
  dateOfJoining: string; // ISO date (YYYY-MM-DD)
  pincode?: string;
  email?: string;
  panNumber?: string;
}

export interface BulkUploadResult {
  created: number;
  skipped: number;
  errors: { row: number; mobileNumber: string; reason: string }[];
}
