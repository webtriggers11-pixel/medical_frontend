import api from '../api/axios.instance';
import type { ApiResponse } from '../types/auth.types';
import type { Panel, CreatePanelInput, UpdatePanelInput, CompanyPanelPricing, SetCompanyPricingInput } from '../types/panel.types';

export const panelService = {
  getAll: async (labId?: string): Promise<Panel[]> => {
    const res = await api.get<ApiResponse<Panel[]>>('/panels', { params: labId ? { labId } : {} });
    return res.data.data;
  },

  getById: async (id: string): Promise<Panel> => {
    const res = await api.get<ApiResponse<Panel>>(`/panels/${id}`);
    return res.data.data;
  },

  create: async (input: CreatePanelInput): Promise<Panel> => {
    const res = await api.post<ApiResponse<Panel>>('/panels', input);
    return res.data.data;
  },

  update: async (id: string, input: UpdatePanelInput): Promise<Panel> => {
    const res = await api.patch<ApiResponse<Panel>>(`/panels/${id}`, input);
    return res.data.data;
  },

  remove: async (id: string): Promise<void> => {
    await api.delete(`/panels/${id}`);
  },

  // Company pricing
  getPricing: async (panelId: string): Promise<CompanyPanelPricing[]> => {
    const res = await api.get<ApiResponse<CompanyPanelPricing[]>>(`/panels/${panelId}/pricing`);
    return res.data.data;
  },

  setPricing: async (panelId: string, input: SetCompanyPricingInput): Promise<CompanyPanelPricing> => {
    const res = await api.post<ApiResponse<CompanyPanelPricing>>(`/panels/${panelId}/pricing`, input);
    return res.data.data;
  },

  removePricing: async (panelId: string, companyId: string): Promise<void> => {
    await api.delete(`/panels/${panelId}/pricing/${companyId}`);
  },
};
