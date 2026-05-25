import { useMutation } from '@tanstack/react-query';
import { authService } from '../../../services/auth.service';
import { useAuthStore } from '../../../store/auth.store';

export const useLogin = () => {
  const setAuth = useAuthStore((s) => s.setAuth);

  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      authService.login(email, password),
    onSuccess: (data) => {
      setAuth(data.user, data.accessToken);
    },
  });
};
