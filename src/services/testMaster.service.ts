import api from '../api/axios.instance';
import type { ApiResponse } from '../types/auth.types';
import type { TestMaster, CreateTestMasterInput, UpdateTestMasterInput } from '../types/testMaster.types';

export const testMasterService = {
  getAll: async (): Promise<TestMaster[]> => {
    const res = await api.get<ApiResponse<TestMaster[]>>('/test-masters');
    return res.data.data;
  },

  create: async (input: CreateTestMasterInput): Promise<TestMaster> => {
    const res = await api.post<ApiResponse<TestMaster>>('/test-masters', input);
    return res.data.data;
  },

  update: async (id: string, input: UpdateTestMasterInput): Promise<TestMaster> => {
    const res = await api.patch<ApiResponse<TestMaster>>(`/test-masters/${id}`, input);
    return res.data.data;
  },

  remove: async (id: string): Promise<void> => {
    await api.delete(`/test-masters/${id}`);
  },
};
