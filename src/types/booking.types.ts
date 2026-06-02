export type BookingStatus =
  | 'APPOINTMENT_REQUESTED'
  | 'SCHEDULED'
  | 'VISITED'
  | 'REPORT_UPLOADED'
  | 'FIT'
  | 'UNFIT'
  | 'CANCELLED';

export interface Booking {
  id: string;
  bookingId: string | null;
  candidateId: string;
  panelId: string;
  labId: string;
  clientId: string;
  reqDate: string;
  timeSlot: string | null;
  scheduledDate: string | null;
  visitTime: string | null;
  status: BookingStatus;
  amountCharged: number;
  amountToVendor: number;
  createdAt: string;
  candidate?: {
    id: string;
    name: string;
    employeeCode: string;
    mobile: string;
    panNumber: string | null;
    gender: string;
    age: number;
    storeId: string;
  };
  panel?: {
    id: string;
    name: string;
    mrp: number;
    costToVendor: number;
    bundledTest?: { id: string; name: string; testsIncluded: string[] };
  } | null;
  lab?: {
    id: string;
    name: string;
    contactName: string;
    contactMobile: string;
    email: string;
    address: string | null;
    pincode: string | null;
  } | null;
  client?: {
    id: string;
    name: string | null;
    email: string;
  };
  scheduleHistory?: BookingScheduleChange[];
}

export interface BookingScheduleChange {
  id: string;
  previousDate: string | null;
  previousTimeSlot: string | null;
  newDate: string | null;
  newTimeSlot: string | null;
  reason: string | null;
  /** User id who made this change — the client (booking owner) or an admin. */
  changedBy: string | null;
  createdAt: string;
}

// A candidate awaiting booking — has appointmentDate, no booking yet.
export interface BookingRequest {
  id: string;
  candidateId: string | null;
  name: string;
  employeeCode: string;
  mobile: string;
  gender: string;
  age: number;
  appointmentDate: string | null;
  panNumber: string | null;
  clientId: string;
  store?: { id: string; name: string; storeCode: string } | null;
  client?: { id: string; name: string | null; email: string } | null;
}

export interface CreateBookingInput {
  candidateId: string;
  panelId: string;
  scheduledDate?: string;
  timeSlot?: string;
}

export interface UpdateBookingStatusInput {
  status: BookingStatus;
  scheduledDate?: string;
  timeSlot?: string;
}

export interface RescheduleBookingInput {
  scheduledDate: string;
  timeSlot?: string;
  reason?: string;
}

export const TIME_SLOTS = [
  '9:00 AM - 10:00 AM',
  '10:00 AM - 11:00 AM',
  '11:00 AM - 12:00 PM',
  '12:00 PM - 1:00 PM',
  '1:00 PM - 2:00 PM',
  '2:00 PM - 3:00 PM',
  '3:00 PM - 4:00 PM',
];

export const STATUS_LABEL: Record<BookingStatus, string> = {
  APPOINTMENT_REQUESTED: 'Requested',
  SCHEDULED: 'Scheduled',
  VISITED: 'Visited',
  REPORT_UPLOADED: 'Report Uploaded',
  FIT: 'Fit',
  UNFIT: 'Unfit',
  CANCELLED: 'Cancelled',
};

export const STATUS_VARIANT: Record<BookingStatus, 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info'> = {
  APPOINTMENT_REQUESTED: 'warning',
  SCHEDULED: 'primary',
  VISITED: 'info',
  REPORT_UPLOADED: 'info',
  FIT: 'success',
  UNFIT: 'danger',
  CANCELLED: 'default',
};

type BookingStatusBadge = 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info';

/**
 * True while a reschedule request is awaiting the admin — i.e. the booking is
 * SCHEDULED and the *most recent* schedule change was made by the client (the
 * booking owner). Once an admin reschedules, the latest change is by the admin
 * (changedBy ≠ clientId) so the booking resolves back to a plain "Scheduled".
 *
 * scheduleHistory is returned oldest→newest, so the last item is the latest.
 */
export function isRescheduled(
  booking?: {
    status: BookingStatus;
    clientId: string;
    scheduleHistory?: { changedBy: string | null }[];
  } | null,
): boolean {
  if (!booking || booking.status !== 'SCHEDULED') return false;
  const history = booking.scheduleHistory ?? [];
  const last = history[history.length - 1];
  return !!last && last.changedBy === booking.clientId;
}

/**
 * True when a booking's scheduled date has passed and the candidate still
 * hasn't visited (status is still SCHEDULED). In this state the client may
 * request a reschedule from their own portal.
 */
export function isSchedulePassed(
  booking?: { status: BookingStatus; scheduledDate: string | null } | null,
): boolean {
  if (!booking || booking.status !== 'SCHEDULED' || !booking.scheduledDate) return false;
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  return new Date(booking.scheduledDate) < startOfToday;
}

type RescheduleAware = {
  status: BookingStatus;
  clientId: string;
  scheduleHistory?: { changedBy: string | null }[];
};

/** Display label for a booking — "Rescheduled" while a client request is pending, else the raw status label. */
export function bookingStatusLabel(booking: RescheduleAware): string {
  return isRescheduled(booking) ? 'Rescheduled' : STATUS_LABEL[booking.status];
}

/** Badge variant for a booking — distinct colour for a pending reschedule, else the raw status variant. */
export function bookingStatusVariant(booking: RescheduleAware): BookingStatusBadge {
  return isRescheduled(booking) ? 'warning' : STATUS_VARIANT[booking.status];
}
