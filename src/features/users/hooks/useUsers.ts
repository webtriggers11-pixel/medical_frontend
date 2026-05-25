import { useQuery } from '@tanstack/react-query';
import { usersService } from '../../../services/users.service';
import { queryKeys } from '../../../api/queryKeys';

export const useUsers = () =>
  useQuery({
    queryKey: queryKeys.users.all,
    queryFn: usersService.getAll,
  });
