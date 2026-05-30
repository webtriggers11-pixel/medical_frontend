import { useState } from 'react';
import { usePendingBookings, useUpdateBookingStatus } from '../../features/booking/hooks/useBookings';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { SearchInput } from '../../components/ui/SearchInput';
import { SkeletonTable } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { format } from 'date-fns';
import type { Booking } from '../../types/booking.types';

export function BookingRequestsPage() {
  const { data: bookings, isLoading, error } = usePendingBookings();
  const updateStatus = useUpdateBookingStatus();
  const [search, setSearch] = useState('');
  const [bookNowTarget, setBookNowTarget] = useState<Booking | null>(null);

  const filtered = bookings?.filter((b) => {
    const q = search.toLowerCase();
    return (
      (b.candidate?.name ?? '').toLowerCase().includes(q) ||
      (b.client?.name ?? b.client?.email ?? '').toLowerCase().includes(q) ||
      (b.panel?.name ?? '').toLowerCase().includes(q)
    );
  }) ?? [];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Booking Requests</h1>
          <p className="text-slate-500 mt-1">
            Appointment requests from clients waiting for confirmation
            {bookings && <span className="text-slate-400"> · {bookings.length} pending</span>}
          </p>
        </div>
        <SearchInput
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onClear={() => setSearch('')}
          placeholder="Search by candidate or client..."
          className="w-full sm:w-72"
        />
      </div>

      {isLoading && <SkeletonTable rows={5} />}

      {error && (
        <Card>
          <p className="text-sm text-red-600 font-medium">Failed to load booking requests.</p>
        </Card>
      )}

      {!isLoading && filtered.length === 0 && (
        <Card>
          <EmptyState
            icon={
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
              </svg>
            }
            title={search ? 'No requests found' : 'No pending booking requests'}
            description={search ? `No results for "${search}"` : 'When clients request appointments for their candidates, they will appear here.'}
          />
        </Card>
      )}

      {filtered.length > 0 && (
        <Card padding="none">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-slate-50/60">
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Candidate</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Client</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Panel</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Lab</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Preferred date</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Time slot</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-5 py-3.5" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-4">
                      <p className="font-medium text-slate-900">{b.candidate?.name ?? '—'}</p>
                      <p className="text-xs text-slate-400">{b.candidate?.employeeCode}</p>
                    </td>
                    <td className="px-5 py-4 text-slate-600">
                      {b.client?.name ?? b.client?.email ?? '—'}
                    </td>
                    <td className="px-5 py-4 text-slate-700">{b.panel?.name ?? '—'}</td>
                    <td className="px-5 py-4 text-slate-600">{b.lab?.name ?? '—'}</td>
                    <td className="px-5 py-4 text-slate-700 font-medium">
                      {format(new Date(b.reqDate), 'd MMM yyyy')}
                    </td>
                    <td className="px-5 py-4 text-slate-500 text-xs">
                      {b.timeSlot ?? '—'}
                    </td>
                    <td className="px-5 py-4">
                      <Badge variant="warning" size="sm">Requested</Badge>
                    </td>
                    <td className="px-5 py-4">
                      <Button
                        size="sm"
                        onClick={() => setBookNowTarget(b)}
                      >
                        Book Now
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <ConfirmDialog
        open={!!bookNowTarget}
        onClose={() => setBookNowTarget(null)}
        loading={updateStatus.isPending}
        title="Confirm booking"
        confirmLabel="Book Now"
        message={
          bookNowTarget ? (
            <div className="space-y-2 text-sm">
              <p>Confirm appointment for <strong>{bookNowTarget.candidate?.name}</strong>?</p>
              <div className="mt-3 rounded-lg bg-slate-50 border border-border p-3 space-y-1 text-slate-600">
                <p><span className="font-medium">Panel:</span> {bookNowTarget.panel?.name}</p>
                <p><span className="font-medium">Lab:</span> {bookNowTarget.lab?.name}</p>
                <p><span className="font-medium">Date:</span> {format(new Date(bookNowTarget.reqDate), 'd MMM yyyy')}</p>
                {bookNowTarget.timeSlot && <p><span className="font-medium">Time:</span> {bookNowTarget.timeSlot}</p>}
              </div>
            </div>
          ) : null
        }
        onConfirm={() => {
          if (!bookNowTarget) return;
          updateStatus.mutate(
            {
              id: bookNowTarget.id,
              input: {
                status: 'SCHEDULED',
                scheduledDate: bookNowTarget.reqDate,
                timeSlot: bookNowTarget.timeSlot ?? undefined,
              },
            },
            { onSuccess: () => setBookNowTarget(null) },
          );
        }}
      />
    </div>
  );
}
