import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { queryKeys } from '../../../api/queryKeys';
import { labService } from '../../../services/lab.service';
import type { CreateLabInput, UpdateLabInput, CreateBundledTestInput, UpdateBundledTestInput } from '../../../types/lab.types';

export const useLabs = () =>
  useQuery({ queryKey: queryKeys.labs.all, queryFn: labService.getAll });

export const useLabsPage = (params: { page: number; limit: number; search?: string }) =>
  useQuery({
    queryKey: ['labs', 'page', params],
    queryFn: () => labService.getPage(params),
    placeholderData: keepPreviousData,
  });

export const useCreateLab = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateLabInput) => labService.create(input),
    meta: { successMessage: 'Lab created' },
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.labs.all }),
  });
};

export const useUpdateLab = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateLabInput }) =>
      labService.update(id, input),
    meta: { successMessage: 'Lab updated' },
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.labs.all }),
  });
};

export const useDeleteLab = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => labService.remove(id),
    meta: { successMessage: 'Lab deleted' },
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.labs.all }),
  });
};

export const useBundledTests = (labId: string) =>
  useQuery({
    queryKey: queryKeys.labs.bundledTests(labId),
    queryFn: () => labService.getBundledTests(labId),
    enabled: !!labId,
  });

export const useCreateBundledTest = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateBundledTestInput) => labService.createBundledTest(input),
    meta: { successMessage: 'Test package created' },
    onSuccess: (_data, vars) =>
      qc.invalidateQueries({ queryKey: queryKeys.labs.bundledTests(vars.labId) }),
  });
};

export const useUpdateBundledTest = (labId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateBundledTestInput }) =>
      labService.updateBundledTest(id, input),
    meta: { successMessage: 'Test package updated' },
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.labs.bundledTests(labId) }),
  });
};

export const useDeleteBundledTest = (labId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => labService.deleteBundledTest(id),
    meta: { successMessage: 'Test package deleted' },
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.labs.bundledTests(labId) }),
  });
};
