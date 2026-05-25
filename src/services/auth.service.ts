import api from '../api/axios.instance';
import type {
  InitiateRegisterResponse,
  VerifyOtpResponse,
  LoginResponse,
  User,
  ApiResponse,
} from '../types/auth.types';

export const authService = {
  initiateRegister: async (email: string): Promise<InitiateRegisterResponse> => {
    const res = await api.post<ApiResponse<InitiateRegisterResponse>>('/auth/register/initiate', { email });
    return res.data.data;
  },

  verifyOtp: async (email: string, otp: string): Promise<VerifyOtpResponse> => {
    const res = await api.post<ApiResponse<VerifyOtpResponse>>('/auth/register/verify-otp', { email, otp });
    return res.data.data;
  },

  completeRegister: async (setupToken: string, password: string): Promise<LoginResponse> => {
    const res = await api.post<ApiResponse<LoginResponse>>(
      '/auth/register/complete',
      { password },
      { headers: { Authorization: `Bearer ${setupToken}` } },
    );
    return res.data.data;
  },

  login: async (email: string, password: string): Promise<LoginResponse> => {
    const res = await api.post<ApiResponse<LoginResponse>>('/auth/login', { email, password });
    return res.data.data;
  },

  getMe: async (): Promise<User> => {
    const res = await api.get<ApiResponse<User>>('/auth/me');
    return res.data.data;
  },
};
