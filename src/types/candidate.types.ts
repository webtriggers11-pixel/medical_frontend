import type { Booking } from './booking.types';
import type { Report } from './report.types';

export type Gender = 'MALE' | 'FEMALE' | 'OTHER';
export type CandidateType = 'NEW_JOINER' | 'EXISTING' | 'ANNUAL';

export interface Candidate {
  id: string;
  candidateId: string | null;
  storeId: string;
  clientId: string;
  name: string;
  employeeCode: string | null;
  mobile: string;
  gender: Gender;
  age: number;
  candidateType: CandidateType;
  doj: string | null;
  appointmentDate: string | null;
  pincode: string | null;
  email: string | null;
  panNumber: string | null;
  isActive: boolean;
  isApproved: boolean;
  createdAt: string;
  store?: {
    id: string;
    name: string;
    storeCode: string;
    address?: string | null;
    storeHeadName?: string | null;
    storeHeadMobile?: string | null;
    city?: { id: string; name: string; zone?: { id: string; name: string } | null } | null;
  } | null;
  client?: { id: string; name: string | null; email: string } | null;
  // Present only when the list endpoint is called with `with=booking` —
  // the candidate's latest non-cancelled booking (index 0), if any.
  bookings?: Booking[];
  // Present only when the list endpoint is called with `with=reports`.
  reports?: Report[];
}

export interface CandidateTypeCounts {
  ALL: number;
  NEW_JOINER: number;
  EXISTING: number;
  ANNUAL: number;
}

export interface CreateCandidateInput {
  storeId: string;
  name: string;
  employeeCode?: string;
  mobile: string;
  gender: Gender;
  age: number;
  candidateType: CandidateType;
  doj: string; // ISO date (YYYY-MM-DD)
  appointmentDate: string; // ISO date (YYYY-MM-DD), must be a future date
  pincode: string;
  email?: string;
  panNumber?: string;
}

export interface BulkUploadResult {
  created: number;
  skipped: number;
  errors: { row: number; mobile: string; reason: string }[];
}

// Admin candidate edit. Store/client are immutable, so they're not editable
// here. All fields optional — only what changed needs to be sent.
export interface UpdateCandidateInput {
  name?: string;
  employeeCode?: string;
  mobile?: string;
  gender?: Gender;
  age?: number;
  candidateType?: CandidateType;
  doj?: string; // ISO date (YYYY-MM-DD)
  appointmentDate?: string; // ISO date (YYYY-MM-DD)
  pincode?: string;
  email?: string;
  panNumber?: string;
}

export interface BulkDeleteResult {
  deleted: number;
  // Ids that were skipped (out of scope or already deleted).
  skipped: string[];
}
