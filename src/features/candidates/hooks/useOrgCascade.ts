import { useQuery } from '@tanstack/react-query';
import { orgService } from '../../../services/org.service';
import { queryKeys } from '../../../api/queryKeys';

/** All zones (cascade step 1). */
export const useZones = () =>
  useQuery({
    queryKey: queryKeys.org.zones,
    queryFn: orgService.listZones,
  });

/** Cities for a zone (cascade step 2) — disabled until a zone is chosen. */
export const useCities = (zoneId: string | undefined) =>
  useQuery({
    queryKey: queryKeys.org.cities(zoneId ?? ''),
    queryFn: () => orgService.listCities(zoneId as string),
    enabled: !!zoneId,
  });

/** Stores for a city (cascade step 3) — disabled until a city is chosen. */
export const useStores = (cityId: string | undefined) =>
  useQuery({
    queryKey: queryKeys.org.stores(cityId ?? ''),
    queryFn: () => orgService.listStores(cityId as string),
    enabled: !!cityId,
  });
