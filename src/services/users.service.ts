import api from '../api/axios.instance';
import type { UserRecord, CreateClientInput } from '../types/user.types';
import type { ApiResponse } from '../types/auth.types';

// Clients are users (role USER). These endpoints back the Clients page.
export const usersService = {
  getAll: async (): Promise<UserRecord[]> => {
    const res = await api.get<ApiResponse<UserRecord[]>>('/users');
    return res.data.data;
  },

  getById: async (id: string): Promise<UserRecord> => {
    const res = await api.get<ApiResponse<UserRecord>>(`/users/${id}`);
    return res.data.data;
  },

  create: async (input: CreateClientInput): Promise<UserRecord> => {
    const res = await api.post<ApiResponse<UserRecord>>('/users', input);
    return res.data.data;
  },

  setActive: async (id: string, isActive: boolean): Promise<UserRecord> => {
    const res = await api.patch<ApiResponse<UserRecord>>(`/users/${id}`, { isActive });
    return res.data.data;
  },

  remove: async (id: string): Promise<void> => {
    await api.delete(`/users/${id}`);
  },

  // Admin resets a client's login password. Only the new password is sent;
  // the confirm-password match is validated in the form.
  resetPassword: async (id: string, password: string): Promise<void> => {
    await api.patch(`/users/${id}/reset-password`, { password });
  },
};
