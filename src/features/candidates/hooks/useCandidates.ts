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

// Server-paginated candidate list. Pass `with: 'booking'` / `'reports'` to
// include per-candidate cross-entity data for list columns.
export const useCandidatesPage = (params: {
  page: number;
  limit: number;
  search?: string;
  type?: string;
  clientId?: string;
  storeId?: string;
  zoneId?: string;
  cityId?: string;
  labId?: string;
  approve?: string;
  status?: string;
  from?: string;
  to?: string;
  with?: string;
}) =>
  useQuery({
    queryKey: [...queryKeys.candidates.all, 'page', params] as const,
    queryFn: () => candidatesService.getPage(params),
    placeholderData: keepPreviousData,
  });

export const useCandidateTypeCounts = () =>
  useQuery({
    queryKey: [...queryKeys.candidates.all, 'type-counts'] as const,
    queryFn: () => candidatesService.getTypeCounts(),
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
