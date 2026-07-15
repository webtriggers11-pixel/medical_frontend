import api from '../api/axios.instance';
import type { ApiResponse } from '../types/auth.types';
import type { Report, CreateReportInput, UpdateReportInput, UploadedFile } from '../types/report.types';

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

  update: async (id: string, input: UpdateReportInput): Promise<Report> => {
    const res = await api.patch<ApiResponse<Report>>(`/reports/${id}`, input);
    return res.data.data;
  },

  remove: async (id: string): Promise<{ id: string; deleted: boolean }> => {
    const res = await api.delete<ApiResponse<{ id: string; deleted: boolean }>>(`/reports/${id}`);
    return res.data.data;
  },

  getAll: async (): Promise<Report[]> => {
    const res = await api.get<ApiResponse<Report[]>>('/reports');
    return res.data.data;
  },

  // Resolve a downloadable URL for a stored file (pre-signed S3 URL, or legacy path).
  getFileUrl: async (fileId: string): Promise<string> => {
    const res = await api.get<ApiResponse<{ url: string }>>(`/reports/files/${fileId}/url`);
    return res.data.data.url;
  },

  // Bulk-download report files as a single ZIP. Pass `fileIds` for an explicit
  // row selection, or `filters` to bundle every report matching the current
  // filter set (server re-resolves the matching candidates, client-scoped).
  downloadZip: async (body: {
    fileIds?: string[];
    filters?: {
      storeId?: string;
      storeStatus?: string;
      status?: string;
      uploadFrom?: string;
      uploadTo?: string;
      search?: string;
    };
  }): Promise<void> => {
    const res = await api.post('/reports/download-zip', body, { responseType: 'blob' });
    const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/zip' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'reports.zip';
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
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
