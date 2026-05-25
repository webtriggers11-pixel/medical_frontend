import { useMutation } from '@tanstack/react-query';
import { authService } from '../../../services/auth.service';

export const useInitiateRegister = () =>
  useMutation({
    mutationFn: (email: string) => authService.initiateRegister(email),
  });
