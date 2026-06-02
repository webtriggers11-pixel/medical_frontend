import { useState } from 'react';
import { format } from 'date-fns';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { DatePicker } from '../../../components/ui/DatePicker';
import { Combobox } from '../../../components/ui/Combobox';
import { useRescheduleBooking } from '../hooks/useBookings';
import { getApiErrorMessage } from '../../../lib/apiError';
import { TIME_SLOTS } from '../../../types/booking.types';
import type { Booking } from '../../../types/booking.types';

interface Props {
  open: boolean;
  onClose: () => void;
  booking: Booking;
  candidateName: string;
}

export function RescheduleModal({ open, onClose, booking, candidateName }: Props) {
  const reschedule = useRescheduleBooking();
  // Start empty so the picker opens on the current month with future dates
  // selectable. Pre-filling the old (often past-due) date would open the
  // calendar on a fully-disabled past month and look like "all dates disabled".
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [slot, setSlot] = useState(booking.timeSlot ?? '');
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  const submit = async () => {
    if (!date) { setError('Please select a new date.'); return; }
    setError('');
    try {
      await reschedule.mutateAsync({
        id: booking.id,
        input: {
          scheduledDate: format(date, 'yyyy-MM-dd'),
          timeSlot: slot || undefined,
          reason: reason.trim() || undefined,
        },
      });
      onClose();
    } catch (err) {
      setError(getApiErrorMessage(err, 'Reschedule failed.'));
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Reschedule appointment"
      size="md"
      footer={
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose} disabled={reschedule.isPending}>Cancel</Button>
          <Button loading={reschedule.isPending} onClick={submit}>Reschedule</Button>
        </div>
      }
    >
      <div className="space-y-4">
        <div className="rounded-xl bg-slate-50 border border-border px-4 py-3 text-sm">
          <p className="font-medium text-slate-800">{candidateName}</p>
          <p className="text-xs text-slate-500 mt-0.5">
            Currently scheduled:{' '}
            <span className="font-medium text-slate-700">
              {booking.scheduledDate ? format(new Date(booking.scheduledDate), 'd MMM yyyy') : '—'}
              {booking.timeSlot ? ` · ${booking.timeSlot}` : ''}
            </span>
          </p>
        </div>

        <DatePicker
          label="New date"
          required
          value={date}
          onChange={setDate}
          minDate={new Date()}
          placeholder="Select date"
        />

        <Combobox
          label="Time slot"
          placeholder="Select a time slot…"
          options={TIME_SLOTS.map((t) => ({ value: t, label: t }))}
          value={slot}
          onChange={setSlot}
        />

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Reason <span className="text-slate-400 font-normal">(optional)</span></label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={2}
            placeholder="Why is this being rescheduled?"
            className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none resize-none"
          />
        </div>

        {error && (
          <div className="flex items-center gap-2 rounded-xl bg-red-50 border border-red-100 px-3 py-2.5 text-sm text-red-600">
            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" /></svg>
            {error}
          </div>
        )}
      </div>
    </Modal>
  );
}
