import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../../../api/queryKeys';
import { statsService } from '../../../services/stats.service';

export const useAdminStats = () =>
  useQuery({
    queryKey: queryKeys.stats.admin,
    queryFn: () => statsService.getAdminStats(),
  });

export const useClientStats = () =>
  useQuery({
    queryKey: queryKeys.stats.client,
    queryFn: () => statsService.getClientStats(),
  });
