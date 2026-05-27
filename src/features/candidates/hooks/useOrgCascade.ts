import { useQuery } from '@tanstack/react-query';
import { orgService } from '../../../services/org.service';
import { queryKeys } from '../../../api/queryKeys';

export const useZones = () =>
  useQuery({
    queryKey: queryKeys.org.zones,
    queryFn: () => orgService.listZones(),
  });

export const useCities = (zoneId: string | undefined) =>
  useQuery({
    queryKey: queryKeys.org.cities(zoneId ?? ''),
    queryFn: () => orgService.listCities(zoneId as string),
    enabled: !!zoneId,
  });

export const useStores = (cityId: string | undefined) =>
  useQuery({
    queryKey: queryKeys.org.stores(cityId ?? ''),
    queryFn: () => orgService.listStores(cityId as string),
    enabled: !!cityId,
  });
