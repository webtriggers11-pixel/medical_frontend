import { useQuery } from '@tanstack/react-query';
import { authService } from '../services/auth.service';
import { useAuthStore } from '../store/auth.store';
import { queryKeys } from '../api/queryKeys';

export const useCurrentUser = () => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return useQuery({
    queryKey: queryKeys.auth.me,
    queryFn: authService.getMe,
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000,
  });
};
