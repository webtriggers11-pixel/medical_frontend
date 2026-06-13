import type { BookingStatus } from './booking.types';

export type BookingStatusCounts = Record<BookingStatus, number>;

export interface CandidateStats {
  total: number;
  active: number;
  approved: number;
  withAppointment: number;
}

export interface BookingStats {
  total: number;
  byStatus: BookingStatusCounts;
}

// GET /stats as ADMIN — global platform stats.
export interface AdminStats {
  clients: { total: number; active: number };
  stores: { total: number };
  labs: { total: number; active: number };
  panels: { total: number; active: number };
  tests: { total: number; active: number };
  candidates: CandidateStats;
  bookings: BookingStats;
  reports: { total: number; approved: number };
  revenue: { charged: number; vendorCost: number; margin: number };
}

// GET /stats as USER (client) — scoped to the client's own data.
export interface ClientStats {
  stores: { total: number };
  candidates: CandidateStats;
  bookings: BookingStats;
  reports: { total: number };
  spend: { total: number };
}
