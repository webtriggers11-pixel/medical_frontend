import { keepPreviousData, useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../../../api/queryKeys';
import { orgService } from '../../../services/org.service';
import type { CreateZoneInput, CreateCityInput, CreateStoreInput } from '../../../types/org.types';

// Zones — global master, no filter needed
export const useZones = () =>
  useQuery({
    queryKey: queryKeys.org.zones,
    queryFn: () => orgService.listZones(),
  });

// Server-paginated + searched variants for the management tables. Keyed under
// the same prefixes the full-list hooks use, so existing mutation
// invalidations (which target those prefixes) refresh these too.
export const useZonesPage = (params: { page: number; limit: number; search?: string }) =>
  useQuery({
    queryKey: [...queryKeys.org.zones, 'page', params] as const,
    queryFn: () => orgService.listZonesPage(params),
    placeholderData: keepPreviousData,
  });

export const useCitiesPage = (zoneId: string, params: { page: number; limit: number; search?: string }) =>
  useQuery({
    queryKey: [...queryKeys.org.cities(zoneId), 'page', params] as const,
    queryFn: () => orgService.listCitiesPage(zoneId, params),
    enabled: !!zoneId,
    placeholderData: keepPreviousData,
  });

export const useStoresPage = (params: { page: number; limit: number; search?: string; zoneId?: string; cityId?: string }) =>
  useQuery({
    queryKey: [...queryKeys.org.storesAll, 'page', params] as const,
    queryFn: () => orgService.listStoresPage(params),
    placeholderData: keepPreviousData,
  });

export const useCreateZone = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateZoneInput) => orgService.createZone(input),
    meta: { successMessage: 'Zone created' },
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.org.zones }),
  });
};

export const useUpdateZone = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) => orgService.updateZone(id, { name }),
    meta: { successMessage: 'Zone updated' },
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.org.zones }),
  });
};

export const useDeleteZone = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => orgService.deleteZone(id),
    meta: { successMessage: 'Zone deleted' },
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.org.zones }),
  });
};

// Cities — keyed by zoneId
export const useCities = (zoneId: string) =>
  useQuery({
    queryKey: queryKeys.org.cities(zoneId),
    queryFn: () => orgService.listCities(zoneId),
    enabled: !!zoneId,
  });

export const useCreateCity = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateCityInput) => orgService.createCity(input),
    meta: { successMessage: 'City created' },
    onSuccess: (_data, vars) =>
      qc.invalidateQueries({ queryKey: queryKeys.org.cities(vars.zoneId) }),
  });
};

export const useUpdateCity = (zoneId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) => orgService.updateCity(id, { name }),
    meta: { successMessage: 'City updated' },
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.org.cities(zoneId) }),
  });
};

export const useDeleteCity = (zoneId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => orgService.deleteCity(id),
    meta: { successMessage: 'City deleted' },
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.org.cities(zoneId) }),
  });
};

// Stores — all stores for the current client (with city + zone).
export const useStores = () =>
  useQuery({
    queryKey: queryKeys.org.storesAll,
    queryFn: () => orgService.listStores(),
  });

// Invalidating the ['org','stores'] prefix refreshes the full list and any
// city-scoped list (e.g. the candidate cascade).
export const useCreateStore = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateStoreInput) => orgService.createStore(input),
    meta: { successMessage: 'Store created' },
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.org.storesAll }),
  });
};

export const useUpdateStore = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<CreateStoreInput> }) =>
      orgService.updateStore(id, input),
    meta: { successMessage: 'Store updated' },
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.org.storesAll }),
  });
};

export const useDeleteStore = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => orgService.deleteStore(id),
    meta: { successMessage: 'Store deleted' },
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.org.storesAll }),
  });
};
