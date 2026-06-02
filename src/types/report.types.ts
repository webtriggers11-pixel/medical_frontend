export type FitnessStatus = 'FIT' | 'UNFIT' | 'HOLD';

export interface ReportFile {
  id: string;
  reportId: string;
  fileUrl: string;
  fileKey?: string | null;
  fileName: string;
  fileSize: number | null;
  testsCovered: string[];
  createdAt: string;
}

export interface Report {
  id: string;
  bookingId: string;
  candidateId: string;
  reportUrl: string;
  fitnessStatus: FitnessStatus;
  labInternalRef: string | null;
  isInsure: boolean;
  approvalStatus: boolean;
  uploadedAt: string;
  uploadedBy: string;
  remarks: string | null;
  createdAt: string;
  files?: ReportFile[];
  candidate?: { id: string; name: string; employeeCode: string } | null;
  booking?: {
    id: string;
    status: string;
    panel?: { id: string; name: string } | null;
    lab?: { id: string; name: string } | null;
  } | null;
}

/** Descriptor returned by the upload endpoint for a stored file. */
export interface UploadedFile {
  fileUrl: string;
  fileKey?: string;
  fileName: string;
  fileSize?: number;
}

/** A file plus the tests it covers, as submitted with the report. */
export interface ReportFileInput extends UploadedFile {
  testsCovered: string[];
}

export interface CreateReportInput {
  bookingId: string;
  fitnessStatus: FitnessStatus;
  files: ReportFileInput[];
  labInternalRef?: string;
  isInsure?: boolean;
  approvalStatus?: boolean;
  remarks?: string;
}

/** Re-tag an existing report file (its "Uploaded for" tests). */
export interface UpdateReportFileInput {
  id: string;
  testsCovered: string[];
}

export interface UpdateReportInput {
  fitnessStatus?: FitnessStatus;
  remarks?: string;
  labInternalRef?: string;
  isInsure?: boolean;
  approvalStatus?: boolean;
  /** New files to attach (already uploaded via the upload endpoint). */
  addFiles?: ReportFileInput[];
  /** Ids of existing report files to remove. */
  removeFileIds?: string[];
  /** Re-tag existing files. */
  fileUpdates?: UpdateReportFileInput[];
}

export const FITNESS_VARIANT: Record<FitnessStatus, 'success' | 'danger' | 'warning'> = {
  FIT: 'success',
  UNFIT: 'danger',
  HOLD: 'warning',
};
