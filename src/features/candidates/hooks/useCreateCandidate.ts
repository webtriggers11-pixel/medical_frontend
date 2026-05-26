import { useMutation, useQueryClient } from '@tanstack/react-query';
import { candidatesService } from '../../../services/candidates.service';
import { queryKeys } from '../../../api/queryKeys';
import type { CreateCandidateInput } from '../../../types/candidate.types';

export const useCreateCandidate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateCandidateInput) => candidatesService.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.candidates.all });
    },
  });
};
