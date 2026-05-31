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
  createdAt: string;
}

// A candidate awaiting booking — has appointmentDate, no booking yet.
export interface BookingRequest {
  id: string;
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

/** True when a SCHEDULED booking has been rescheduled at least once. */
export function isRescheduled(
  booking?: { status: BookingStatus; scheduleHistory?: { id: string }[] } | null,
): boolean {
  return (
    !!booking &&
    booking.status === 'SCHEDULED' &&
    (booking.scheduleHistory?.length ?? 0) > 0
  );
}

/** Display label for a booking — "Rescheduled" for rescheduled bookings, else the raw status label. */
export function bookingStatusLabel(
  booking: { status: BookingStatus; scheduleHistory?: { id: string }[] },
): string {
  return isRescheduled(booking) ? 'Rescheduled' : STATUS_LABEL[booking.status];
}

/** Badge variant for a booking — distinct colour for rescheduled, else the raw status variant. */
export function bookingStatusVariant(
  booking: { status: BookingStatus; scheduleHistory?: { id: string }[] },
): BookingStatusBadge {
  return isRescheduled(booking) ? 'warning' : STATUS_VARIANT[booking.status];
}
