import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { testMasterService } from '../../../services/testMaster.service';
import { queryKeys } from '../../../api/queryKeys';
import type { CreateTestMasterInput, UpdateTestMasterInput } from '../../../types/testMaster.types';

export const useTestMasters = () =>
  useQuery({
    queryKey: queryKeys.testMasters.all,
    queryFn: testMasterService.getAll,
  });

export const useCreateTestMaster = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateTestMasterInput) => testMasterService.create(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.testMasters.all }),
  });
};

export const useUpdateTestMaster = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateTestMasterInput }) =>
      testMasterService.update(id, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.testMasters.all }),
  });
};

export const useDeleteTestMaster = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => testMasterService.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.testMasters.all }),
  });
};
