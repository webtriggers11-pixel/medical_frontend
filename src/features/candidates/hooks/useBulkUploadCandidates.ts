import { useMutation, useQueryClient } from '@tanstack/react-query';
import { candidatesService } from '../../../services/candidates.service';
import { queryKeys } from '../../../api/queryKeys';

export const useBulkUploadCandidates = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ file, storeId }: { file: File; storeId: string }) =>
      candidatesService.bulkUpload(file, storeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.candidates.all });
    },
  });
};
