import api from '../api/axios.instance';
import type { ApiResponse } from '../types/auth.types';
import type { Lab, CreateLabInput, UpdateLabInput, BundledTest, CreateBundledTestInput } from '../types/lab.types';

export const labService = {
  getAll: async (): Promise<Lab[]> => {
    const res = await api.get<ApiResponse<Lab[]>>('/labs');
    return res.data.data;
  },

  getById: async (id: string): Promise<Lab> => {
    const res = await api.get<ApiResponse<Lab>>(`/labs/${id}`);
    return res.data.data;
  },

  create: async (input: CreateLabInput): Promise<Lab> => {
    const res = await api.post<ApiResponse<Lab>>('/labs', input);
    return res.data.data;
  },

  update: async (id: string, input: UpdateLabInput): Promise<Lab> => {
    const res = await api.patch<ApiResponse<Lab>>(`/labs/${id}`, input);
    return res.data.data;
  },

  remove: async (id: string): Promise<void> => {
    await api.delete(`/labs/${id}`);
  },

  // Bundled Tests
  getBundledTests: async (labId: string): Promise<BundledTest[]> => {
    const res = await api.get<ApiResponse<BundledTest[]>>('/lab-bundled-tests', { params: { labId } });
    return res.data.data;
  },

  createBundledTest: async (input: CreateBundledTestInput): Promise<BundledTest> => {
    const res = await api.post<ApiResponse<BundledTest>>('/lab-bundled-tests', input);
    return res.data.data;
  },

  deleteBundledTest: async (id: string): Promise<void> => {
    await api.delete(`/lab-bundled-tests/${id}`);
  },
};
