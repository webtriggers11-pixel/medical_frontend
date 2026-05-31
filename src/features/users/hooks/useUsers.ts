import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { usersService } from '../../../services/users.service';
import { queryKeys } from '../../../api/queryKeys';
import type { CreateClientInput } from '../../../types/user.types';

// Clients are users (role USER).
export const useUsers = () =>
  useQuery({
    queryKey: queryKeys.users.all,
    queryFn: usersService.getAll,
  });

export const useClientById = (id: string) =>
  useQuery({
    queryKey: queryKeys.users.byId(id),
    queryFn: () => usersService.getById(id),
    enabled: !!id,
  });

export const useCreateClient = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateClientInput) => usersService.create(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.users.all }),
  });
};

export const useSetClientActive = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      usersService.setActive(id, isActive),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.users.all }),
  });
};

export const useResetPassword = () =>
  useMutation({
    mutationFn: ({ id, password }: { id: string; password: string }) =>
      usersService.resetPassword(id, password),
  });

export const useDeleteClient = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => usersService.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.users.all }),
  });
};
