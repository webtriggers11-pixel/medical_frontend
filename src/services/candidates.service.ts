import api from '../api/axios.instance';
import type { ApiResponse } from '../types/auth.types';
import type {
  Candidate,
  CandidateTypeCounts,
  CreateCandidateInput,
  UpdateCandidateInput,
  BulkUploadResult,
  BulkDeleteResult,
} from '../types/candidate.types';
import type { Paginated } from '../types/pagination.types';

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

  // Server-paginated candidate list. `with` opts into nested relations
  // (e.g. 'booking' for the latest booking, 'reports' for report info) so a
  // page renders cross-entity columns without loading whole tables.
  getPage: async (params: {
    page: number;
    limit: number;
    search?: string;
    type?: string;
    clientId?: string;
    storeId?: string;
    zoneId?: string;
    cityId?: string;
    labId?: string;
    approve?: string;
    status?: string;
    from?: string;
    to?: string;
    with?: string;
  }): Promise<Paginated<Candidate>> => {
    const res = await api.get<ApiResponse<Paginated<Candidate>>>('/candidates', {
      params: {
        page: params.page,
        limit: params.limit,
        search: params.search?.trim() || undefined,
        type: params.type || undefined,
        clientId: params.clientId || undefined,
        storeId: params.storeId || undefined,
        zoneId: params.zoneId || undefined,
        cityId: params.cityId || undefined,
        labId: params.labId || undefined,
        approve: params.approve || undefined,
        status: params.status || undefined,
        from: params.from || undefined,
        to: params.to || undefined,
        with: params.with || undefined,
      },
    });
    return res.data.data;
  },

  getTypeCounts: async (): Promise<CandidateTypeCounts> => {
    const res = await api.get<ApiResponse<CandidateTypeCounts>>(
      '/candidates/type-counts',
    );
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

  // Admin-only: edit a candidate's details.
  update: async (id: string, input: UpdateCandidateInput): Promise<Candidate> => {
    const res = await api.patch<ApiResponse<Candidate>>(`/candidates/${id}`, input);
    return res.data.data;
  },

  // Soft-delete a single candidate (cascades to its bookings & reports).
  remove: async (id: string): Promise<{ id: string }> => {
    const res = await api.delete<ApiResponse<{ id: string }>>(`/candidates/${id}`);
    return res.data.data;
  },

  // Soft-delete many candidates. Returns how many were deleted and which ids
  // were skipped (out of scope / already deleted).
  bulkRemove: async (ids: string[]): Promise<BulkDeleteResult> => {
    const res = await api.post<ApiResponse<BulkDeleteResult>>('/candidates/bulk-delete', { ids });
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
