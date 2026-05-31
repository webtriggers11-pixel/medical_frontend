import api from '../api/axios.instance';
import type { ApiResponse } from '../types/auth.types';
import type { Report, CreateReportInput, UploadedFile } from '../types/report.types';

/** Report files are stored as paths like `/uploads/reports/x.pdf`; absolute URLs
 *  (e.g. legacy Google Drive links) are returned as-is. */
export function resolveFileUrl(url: string): string {
  if (/^https?:\/\//i.test(url)) return url;
  return `${import.meta.env.VITE_API_URL}${url}`;
}

export const reportService = {
  uploadFiles: async (files: File[]): Promise<UploadedFile[]> => {
    const form = new FormData();
    files.forEach((f) => form.append('files', f));
    const res = await api.post<ApiResponse<UploadedFile[]>>('/reports/upload', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data.data;
  },

  create: async (input: CreateReportInput): Promise<Report> => {
    const res = await api.post<ApiResponse<Report>>('/reports', input);
    return res.data.data;
  },

  getByCandidate: async (candidateId: string): Promise<Report[]> => {
    const res = await api.get<ApiResponse<Report[]>>(`/reports/candidate/${candidateId}`);
    return res.data.data;
  },

  getByBooking: async (bookingId: string): Promise<Report | null> => {
    const res = await api.get<ApiResponse<Report | null>>(`/reports/booking/${bookingId}`);
    return res.data.data;
  },
};
