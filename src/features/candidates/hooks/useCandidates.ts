import { useMutation, useQuery, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { candidatesService } from '../../../services/candidates.service';
import { queryKeys } from '../../../api/queryKeys';
import type { UpdateCandidateInput } from '../../../types/candidate.types';

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

// Refresh both the candidate lists/counts and the dashboard stat tiles, which
// derive from a separate /stats query.
const invalidateCandidateViews = (qc: ReturnType<typeof useQueryClient>) => {
  qc.invalidateQueries({ queryKey: queryKeys.candidates.all });
  qc.invalidateQueries({ queryKey: queryKeys.stats.admin });
  qc.invalidateQueries({ queryKey: queryKeys.stats.client });
};

// Admin-only: edit a candidate's details.
export const useUpdateCandidate = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateCandidateInput }) =>
      candidatesService.update(id, input),
    meta: { successMessage: 'Candidate updated' },
    onSuccess: () => invalidateCandidateViews(qc),
  });
};

// Soft-delete a single candidate (cascades to its bookings & reports).
export const useDeleteCandidate = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => candidatesService.remove(id),
    meta: { successMessage: 'Candidate deleted' },
    onSuccess: () => invalidateCandidateViews(qc),
  });
};

// Soft-delete many candidates at once.
export const useBulkDeleteCandidates = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (ids: string[]) => candidatesService.bulkRemove(ids),
    onSuccess: () => invalidateCandidateViews(qc),
  });
};
