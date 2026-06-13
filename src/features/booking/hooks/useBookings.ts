import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../../../api/queryKeys';
import { bookingService } from '../../../services/booking.service';
import type { CreateBookingInput, UpdateBookingStatusInput, RescheduleBookingInput } from '../../../types/booking.types';

export const useBookings = (params?: { status?: string; clientId?: string }) =>
  useQuery({
    queryKey: params?.status ? queryKeys.bookings.byStatus(params.status) : queryKeys.bookings.all,
    queryFn: () => bookingService.getAll(params),
  });

// Admin — candidates awaiting booking
export const useBookingRequests = () =>
  useQuery({
    queryKey: queryKeys.bookings.pending,
    queryFn: bookingService.getRequests,
  });

// Admin — book a candidate with a panel
export const useCreateBooking = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateBookingInput) => bookingService.create(input),
    meta: { successMessage: 'Booking created' },
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
    meta: { successMessage: 'Booking updated' },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.bookings.all });
      qc.invalidateQueries({ queryKey: queryKeys.bookings.pending });
    },
  });
};

// Admin — reschedule a booking (keeps a history of the previous schedule)
export const useRescheduleBooking = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: RescheduleBookingInput }) =>
      bookingService.reschedule(id, input),
    meta: { successMessage: 'Booking rescheduled' },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.bookings.all });
    },
  });
};
