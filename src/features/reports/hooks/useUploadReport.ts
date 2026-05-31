import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../../../api/queryKeys';
import { reportService } from '../../../services/report.service';
import type { CreateReportInput } from '../../../types/report.types';

/** Uploads selected files to storage, returning their stored descriptors. */
export const useUploadReportFiles = () =>
  useMutation({
    mutationFn: (files: File[]) => reportService.uploadFiles(files),
  });

/** Persists the report (metadata + already-uploaded files) for a booking. */
export const useCreateReport = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateReportInput) => reportService.create(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.bookings.all });
      qc.invalidateQueries({ queryKey: queryKeys.reports.all });
    },
  });
};
