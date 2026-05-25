import api from '../api/axios.instance';
import type { UserRecord } from '../types/user.types';
import type { ApiResponse } from '../types/auth.types';

export const usersService = {
  getAll: async (): Promise<UserRecord[]> => {
    const res = await api.get<ApiResponse<UserRecord[]>>('/users');
    return res.data.data;
  },

  getById: async (id: string): Promise<UserRecord> => {
    const res = await api.get<ApiResponse<UserRecord>>(`/users/${id}`);
    return res.data.data;
  },
};
