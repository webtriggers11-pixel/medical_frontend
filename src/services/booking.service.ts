import api from '../api/axios.instance';
import type { ApiResponse } from '../types/auth.types';
import type { Booking, CreateBookingInput, UpdateBookingStatusInput } from '../types/booking.types';

export const bookingService = {
  create: async (input: CreateBookingInput): Promise<Booking> => {
    const res = await api.post<ApiResponse<Booking>>('/bookings', input);
    return res.data.data;
  },

  getAll: async (params?: { status?: string; clientId?: string }): Promise<Booking[]> => {
    const res = await api.get<ApiResponse<Booking[]>>('/bookings', { params });
    return res.data.data;
  },

  getPending: async (): Promise<Booking[]> => {
    const res = await api.get<ApiResponse<Booking[]>>('/bookings/pending');
    return res.data.data;
  },

  getById: async (id: string): Promise<Booking> => {
    const res = await api.get<ApiResponse<Booking>>(`/bookings/${id}`);
    return res.data.data;
  },

  updateStatus: async (id: string, input: UpdateBookingStatusInput): Promise<Booking> => {
    const res = await api.patch<ApiResponse<Booking>>(`/bookings/${id}/status`, input);
    return res.data.data;
  },
};
