import axios from 'axios';
import { useAuthStore } from '../store/auth.store';

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api/v1`,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const url: string = error.config?.url ?? '';
    // Auth endpoints (login, register, OTP, set-password) return 401 for bad
    // credentials — let those errors reach the form instead of forcing a
    // logout + redirect, which reloads the page and wipes the error message.
    const isAuthRoute = url.includes('/auth/');
    if (error.response?.status === 401 && !isAuthRoute) {
      useAuthStore.getState().logout();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  },
);

export default api;
