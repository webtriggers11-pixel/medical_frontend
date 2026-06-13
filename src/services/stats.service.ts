import api from '../api/axios.instance';
import type { ApiResponse } from '../types/auth.types';
import type { AdminStats, ClientStats } from '../types/stats.types';

// Same endpoint for both roles — the backend scopes by the caller's role.
export const statsService = {
  getAdminStats: async (): Promise<AdminStats> => {
    const res = await api.get<ApiResponse<AdminStats>>('/stats');
    return res.data.data;
  },

  getClientStats: async (): Promise<ClientStats> => {
    const res = await api.get<ApiResponse<ClientStats>>('/stats');
    return res.data.data;
  },
};
