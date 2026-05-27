import api from '../api/axios.instance';
import type { ApiResponse } from '../types/auth.types';
import type { Zone, City, Store, CreateZoneInput, CreateCityInput, CreateStoreInput } from '../types/org.types';

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

  createZone: async (input: CreateZoneInput): Promise<Zone> => {
    const res = await api.post<ApiResponse<Zone>>('/zones', input);
    return res.data.data;
  },

  updateZone: async (id: string, input: Partial<CreateZoneInput>): Promise<Zone> => {
    const res = await api.patch<ApiResponse<Zone>>(`/zones/${id}`, input);
    return res.data.data;
  },

  deleteZone: async (id: string): Promise<void> => { await api.delete(`/zones/${id}`); },

  createCity: async (input: CreateCityInput): Promise<City> => {
    const res = await api.post<ApiResponse<City>>('/cities', input);
    return res.data.data;
  },

  updateCity: async (id: string, input: Partial<CreateCityInput>): Promise<City> => {
    const res = await api.patch<ApiResponse<City>>(`/cities/${id}`, input);
    return res.data.data;
  },

  deleteCity: async (id: string): Promise<void> => { await api.delete(`/cities/${id}`); },

  createStore: async (input: CreateStoreInput): Promise<Store> => {
    const res = await api.post<ApiResponse<Store>>('/stores', input);
    return res.data.data;
  },

  updateStore: async (id: string, input: Partial<CreateStoreInput>): Promise<Store> => {
    const res = await api.patch<ApiResponse<Store>>(`/stores/${id}`, input);
    return res.data.data;
  },

  deleteStore: async (id: string): Promise<void> => { await api.delete(`/stores/${id}`); },
};
