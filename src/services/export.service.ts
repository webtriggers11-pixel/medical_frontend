import api from '../api/axios.instance';
import type { ApiResponse } from '../types/auth.types';

export interface BookingMatrix {
  columns: string[];
  rows: (string | number)[][];
}

// Triggers a browser download of the bookings billing CSV for the given range.
// Dates are ISO YYYY-MM-DD; omit both to export everything.
export const exportService = {
  // Columns + rows for the on-screen preview table (same data as the CSV).
  getBookings: async (params: { from?: string; to?: string }): Promise<BookingMatrix> => {
    const res = await api.get<ApiResponse<BookingMatrix>>('/export/bookings/data', {
      params: { from: params.from, to: params.to },
    });
    return res.data.data;
  },

  downloadBookings: async (params: { from?: string; to?: string }): Promise<void> => {
    const res = await api.get('/export/bookings', {
      params: { from: params.from, to: params.to },
      responseType: 'blob',
    });

    // Prefer the server-provided filename, fall back to a dated default.
    const disposition = res.headers['content-disposition'] as string | undefined;
    const match = disposition?.match(/filename="?([^"]+)"?/);
    const filename = match?.[1] ?? `medisync-bookings-${new Date().toISOString().slice(0, 10)}.csv`;

    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },
};
