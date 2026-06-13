import { useMutation } from '@tanstack/react-query';
import { authService } from '../../../services/auth.service';
import { useAuthStore } from '../../../store/auth.store';

export const useCompleteRegister = () => {
  const setAuth = useAuthStore((s) => s.setAuth);

  return useMutation({
    mutationFn: ({ setupToken, password }: { setupToken: string; password: string }) =>
      authService.completeRegister(setupToken, password),
    meta: { skipErrorToast: true },
    onSuccess: (data) => {
      setAuth(data.user, data.accessToken);
    },
  });
};
