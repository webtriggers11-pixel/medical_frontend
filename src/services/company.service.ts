import api from '../api/axios.instance';
import type { ApiResponse } from '../types/auth.types';
import type { Company, CreateCompanyInput, UpdateCompanyInput } from '../types/company.types';

export const companyService = {
  getAll: async (): Promise<Company[]> => {
    const res = await api.get<ApiResponse<Company[]>>('/companies');
    return res.data.data;
  },

  getById: async (id: string): Promise<Company> => {
    const res = await api.get<ApiResponse<Company>>(`/companies/${id}`);
    return res.data.data;
  },

  create: async (input: CreateCompanyInput): Promise<Company> => {
    const res = await api.post<ApiResponse<Company>>('/companies', input);
    return res.data.data;
  },

  update: async (id: string, input: UpdateCompanyInput): Promise<Company> => {
    const res = await api.patch<ApiResponse<Company>>(`/companies/${id}`, input);
    return res.data.data;
  },

  remove: async (id: string): Promise<void> => {
    await api.delete(`/companies/${id}`);
  },
};
