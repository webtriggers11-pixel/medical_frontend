import { useMutation, useQuery, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { candidatesService } from '../../../services/candidates.service';
import { queryKeys } from '../../../api/queryKeys';

export const useCandidates = (params?: {
  clientId?: string;
  storeId?: string;
  available?: boolean;
  search?: string;
}) =>
  useQuery({
    queryKey: params
      ? [...queryKeys.candidates.all, params]
      : queryKeys.candidates.all,
    queryFn: () => candidatesService.getAll(params),
    // keep the current rows visible while a new search/filter result loads
    placeholderData: keepPreviousData,
  });

export const useSetCandidateApproval = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isApproved }: { id: string; isApproved: boolean }) =>
      candidatesService.setApproval(id, isApproved),
    meta: { successMessage: 'Candidate approval updated' },
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.candidates.all }),
  });
};
