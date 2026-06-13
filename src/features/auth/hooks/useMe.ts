import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../../../api/queryKeys';
import { authService } from '../../../services/auth.service';

// Full profile of the signed-in user (name, mobile, display id, etc.).
export const useMe = () =>
  useQuery({
    queryKey: queryKeys.auth.me,
    queryFn: authService.getMe,
  });
