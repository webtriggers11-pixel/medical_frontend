import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { queryKeys } from '../../../api/queryKeys';
import { exportService } from '../../../services/export.service';

// Preview rows for the export table, scoped to the selected date range.
export const useExportBookings = (params: { from?: string; to?: string }) =>
  useQuery({
    queryKey: queryKeys.export.bookings(params),
    queryFn: () => exportService.getBookings(params),
    placeholderData: keepPreviousData,
  });
