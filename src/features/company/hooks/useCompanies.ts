import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../../../api/queryKeys';
import { companyService } from '../../../services/company.service';
import type { CreateCompanyInput, UpdateCompanyInput } from '../../../types/company.types';

export const useCompanies = () =>
  useQuery({ queryKey: queryKeys.companies.all, queryFn: companyService.getAll });

export const useCreateCompany = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateCompanyInput) => companyService.create(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.companies.all }),
  });
};

export const useUpdateCompany = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateCompanyInput }) =>
      companyService.update(id, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.companies.all }),
  });
};

export const useDeleteCompany = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => companyService.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.companies.all }),
  });
};
