import { useMutation, useQueryClient } from '@tanstack/react-query';
import { candidatesService } from '../../../services/candidates.service';
import { queryKeys } from '../../../api/queryKeys';

export const useBulkUploadCandidates = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ file }: { file: File }) =>
      candidatesService.bulkUpload(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.candidates.all });
    },
  });
};
