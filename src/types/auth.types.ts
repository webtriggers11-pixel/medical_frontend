export type Role = 'ADMIN' | 'USER';

export interface User {
  id: string;
  email: string;
  role: Role;
  isActive: boolean;
  isEmailVerified: boolean;
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
}

export interface LoginResponse {
  accessToken: string;
  user: User;
}

export interface InitiateRegisterResponse {
  message: string;
  resendAllowedAt: string;
}

export interface VerifyOtpResponse {
  setupToken: string;
}

export interface ApiResponse<T> {
  statusCode: number;
  data: T;
  timestamp: string;
}
