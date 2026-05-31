import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../../../api/queryKeys';
import { reportService } from '../../../services/report.service';

/** All reports visible to the caller (ADMIN: all; USER: own candidates only). */
export const useReports = () =>
  useQuery({
    queryKey: queryKeys.reports.all,
    queryFn: reportService.getAll,
  });
