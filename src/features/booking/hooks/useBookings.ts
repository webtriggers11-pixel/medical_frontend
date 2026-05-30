import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../../../api/queryKeys';
import { bookingService } from '../../../services/booking.service';
import type { CreateBookingInput, UpdateBookingStatusInput } from '../../../types/booking.types';

export const useBookings = (params?: { status?: string; clientId?: string }) =>
  useQuery({
    queryKey: params?.status ? queryKeys.bookings.byStatus(params.status) : queryKeys.bookings.all,
    queryFn: () => bookingService.getAll(params),
  });

export const usePendingBookings = () =>
  useQuery({
    queryKey: queryKeys.bookings.pending,
    queryFn: bookingService.getPending,
  });

export const useCreateBooking = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateBookingInput) => bookingService.create(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.bookings.all });
      qc.invalidateQueries({ queryKey: queryKeys.bookings.pending });
    },
  });
};

export const useUpdateBookingStatus = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateBookingStatusInput }) =>
      bookingService.updateStatus(id, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.bookings.all });
      qc.invalidateQueries({ queryKey: queryKeys.bookings.pending });
    },
  });
};
