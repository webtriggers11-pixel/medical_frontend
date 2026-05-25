import { useMutation } from '@tanstack/react-query';
import { authService } from '../../../services/auth.service';

export const useVerifyOtp = () =>
  useMutation({
    mutationFn: ({ email, otp }: { email: string; otp: string }) =>
      authService.verifyOtp(email, otp),
  });
