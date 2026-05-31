import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { candidatesService } from '../../../services/candidates.service';
import { queryKeys } from '../../../api/queryKeys';

export const useCandidates = () =>
  useQuery({
    queryKey: queryKeys.candidates.all,
    queryFn: candidatesService.getAll,
  });

export const useSetCandidateApproval = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isApproved }: { id: string; isApproved: boolean }) =>
      candidatesService.setApproval(id, isApproved),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.candidates.all }),
  });
};
