import api from '../api/axios.instance';
import type { ApiResponse } from '../types/auth.types';
import type {
  Candidate,
  CreateCandidateInput,
  BulkUploadResult,
} from '../types/candidate.types';

export const candidatesService = {
  getAll: async (params?: {
    clientId?: string;
    storeId?: string;
    available?: boolean;
    search?: string;
  }): Promise<Candidate[]> => {
    const res = await api.get<ApiResponse<Candidate[]>>('/candidates', {
      params: {
        clientId: params?.clientId,
        storeId: params?.storeId,
        available: params?.available ? 'true' : undefined,
        search: params?.search || undefined,
      },
    });
    return res.data.data;
  },

  create: async (input: CreateCandidateInput): Promise<Candidate> => {
    const res = await api.post<ApiResponse<Candidate>>('/candidates', input);
    return res.data.data;
  },

  setApproval: async (id: string, isApproved: boolean): Promise<Candidate> => {
    const res = await api.patch<ApiResponse<Candidate>>(`/candidates/${id}/approve`, { isApproved });
    return res.data.data;
  },

  bulkUpload: async (file: File): Promise<BulkUploadResult> => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await api.post<ApiResponse<BulkUploadResult>>(
      '/candidates/bulk',
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    );
    return res.data.data;
  },

  downloadTemplate: async (): Promise<void> => {
    const res = await api.get('/candidates/template', { responseType: 'blob' });
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'candidate-bulk-upload-template.csv';
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },
};
