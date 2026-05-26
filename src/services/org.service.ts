import api from '../api/axios.instance';
import type { ApiResponse } from '../types/auth.types';
import type { Zone, City, Store } from '../types/org.types';

/** Read-only org hierarchy lookups for the candidate cascade. */
export const orgService = {
  listZones: async (): Promise<Zone[]> => {
    const res = await api.get<ApiResponse<Zone[]>>('/zones');
    return res.data.data;
  },

  listCities: async (zoneId: string): Promise<City[]> => {
    const res = await api.get<ApiResponse<City[]>>('/cities', { params: { zoneId } });
    return res.data.data;
  },

  listStores: async (cityId: string): Promise<Store[]> => {
    const res = await api.get<ApiResponse<Store[]>>('/stores', { params: { cityId } });
    return res.data.data;
  },
};
