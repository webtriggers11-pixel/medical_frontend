import api from '../api/axios.instance';
import type { ApiResponse } from '../types/auth.types';
import type { Zone, City, Store, StoreWithLocation, CreateZoneInput, CreateCityInput, CreateStoreInput } from '../types/org.types';
import type { Paginated } from '../types/pagination.types';

export const orgService = {
  listZones: async (): Promise<Zone[]> => {
    const res = await api.get<ApiResponse<Zone[]>>('/zones');
    return res.data.data;
  },

  listCities: async (zoneId: string): Promise<City[]> => {
    const res = await api.get<ApiResponse<City[]>>('/cities', { params: { zoneId } });
    return res.data.data;
  },

  listStores: async (cityId?: string): Promise<StoreWithLocation[]> => {
    const res = await api.get<ApiResponse<StoreWithLocation[]>>('/stores', {
      params: cityId ? { cityId } : {},
    });
    return res.data.data;
  },

  // Server-paginated + searched variants for the management tables (the
  // unpaginated list* methods above stay for dropdowns / cascades).
  listZonesPage: async (params: { page: number; limit: number; search?: string }): Promise<Paginated<Zone>> => {
    const res = await api.get<ApiResponse<Paginated<Zone>>>('/zones', {
      params: { page: params.page, limit: params.limit, search: params.search?.trim() || undefined },
    });
    return res.data.data;
  },

  listCitiesPage: async (zoneId: string, params: { page: number; limit: number; search?: string }): Promise<Paginated<City>> => {
    const res = await api.get<ApiResponse<Paginated<City>>>('/cities', {
      params: { zoneId, page: params.page, limit: params.limit, search: params.search?.trim() || undefined },
    });
    return res.data.data;
  },

  listStoresPage: async (params: { page: number; limit: number; search?: string; zoneId?: string; cityId?: string }): Promise<Paginated<StoreWithLocation>> => {
    const res = await api.get<ApiResponse<Paginated<StoreWithLocation>>>('/stores', {
      params: {
        page: params.page,
        limit: params.limit,
        search: params.search?.trim() || undefined,
        zoneId: params.zoneId || undefined,
        cityId: params.cityId || undefined,
      },
    });
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
