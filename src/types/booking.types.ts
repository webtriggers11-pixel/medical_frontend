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
  };
  panel?: {
    id: string;
    name: string;
    mrp: number;
    costToVendor: number;
  };
  lab?: {
    id: string;
    name: string;
    contactName: string;
    contactMobile: string;
    address: string | null;
  };
  client?: {
    id: string;
    name: string | null;
    email: string;
  };
}

export interface CreateBookingInput {
  candidateId: string;
  panelId: string;
  reqDate: string;
  timeSlot?: string;
}

export interface UpdateBookingStatusInput {
  status: BookingStatus;
  scheduledDate?: string;
  timeSlot?: string;
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
