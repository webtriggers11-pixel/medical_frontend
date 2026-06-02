import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useCandidates } from '../../features/candidates/hooks/useCandidates';
import { useBookings } from '../../features/booking/hooks/useBookings';
import { RescheduleModal } from '../../features/booking/components/RescheduleModal';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Avatar } from '../../components/ui/Avatar';
import { Button } from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { format } from 'date-fns';
import type { CandidateType } from '../../types/candidate.types';
import { bookingStatusLabel, bookingStatusVariant, isSchedulePassed } from '../../types/booking.types';

const typeVariant: Record<CandidateType, 'primary' | 'success' | 'warning'> = {
  NEW_JOINER: 'success',
  EXISTING: 'primary',
  ANNUAL: 'warning',
};

const typeLabel: Record<CandidateType, string> = {
  NEW_JOINER: 'New Joiner',
  EXISTING: 'Existing',
  ANNUAL: 'Annual',
};

const BackIcon = (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
  </svg>
);

const fmtDate = (d?: string | null) => (d ? format(new Date(d), 'd MMM yyyy') : '—');

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">{label}</p>
      <p className="text-sm font-medium text-slate-800">{value ?? '—'}</p>
    </div>
  );
}

function SectionCard({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <Card padding="none">
      <div className="flex items-center gap-2 border-b border-border px-5 py-3">
        <span className="text-primary-600">{icon}</span>
        <h2 className="text-sm font-semibold text-slate-800">{title}</h2>
      </div>
      <div className="p-5">{children}</div>
    </Card>
  );
}

export function CandidateDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [rescheduling, setRescheduling] = useState(false);

  const { data: candidates, isLoading } = useCandidates();
  const { data: bookings } = useBookings();

  const candidate = candidates?.find((c) => c.id === id);
  const booking = (bookings ?? []).find((b) => b.candidateId === id && b.status !== 'CANCELLED');

  if (isLoading) {
    return (
      <div className="space-y-4 animate-fade-in">
        <Skeleton className="h-9 w-32" />
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (!candidate) {
    return (
      <div className="animate-fade-in">
        <Button variant="ghost" size="sm" icon={BackIcon} onClick={() => navigate('/candidates')} className="mb-4">
          Back to candidates
        </Button>
        <Card>
          <EmptyState
            icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></svg>}
            title="Candidate not found"
            description="This candidate may have been removed or you don't have access to it."
          />
        </Card>
      </div>
    );
  }

  const isBooked = !!booking;

  // Once the scheduled date has passed (and the candidate still hasn't
  // visited), the client can request a reschedule from their own panel.
  const schedulePassed = isSchedulePassed(booking);

  return (
    <div className="space-y-5 animate-fade-in">
      <Button variant="ghost" size="sm" icon={BackIcon} onClick={() => navigate('/candidates')}>
        Back to candidates
      </Button>

      {/* hero header */}
      <Card>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Avatar name={candidate.name} size="lg" />
            <div>
              <h1 className="text-xl font-bold capitalize text-slate-900">{candidate.name}</h1>
              <p className="text-sm text-slate-500">{candidate.email}</p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <Badge variant={typeVariant[candidate.candidateType]} size="sm">{typeLabel[candidate.candidateType]}</Badge>
                {isBooked ? (
                  <Badge variant={bookingStatusVariant(booking)} size="sm">{bookingStatusLabel(booking)}</Badge>
                ) : candidate.appointmentDate ? (
                  <Badge variant="warning" size="sm">Requested</Badge>
                ) : (
                  <Badge variant="default" size="sm">No appointment</Badge>
                )}
                <Badge variant={candidate.isApproved ? 'success' : 'default'} size="sm">
                  {candidate.isApproved ? 'Approved' : 'Not approved'}
                </Badge>
                <Badge variant={candidate.isActive ? 'success' : 'danger'} size="sm">
                  {candidate.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </div>
          </div>
          <div className="shrink-0 rounded-xl bg-slate-50 px-4 py-2 text-right">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Emp. Code</p>
            <p className="font-mono text-sm font-semibold text-slate-700">{candidate.employeeCode}</p>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Candidate info */}
        <SectionCard
          title="Candidate Information"
          icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}><path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
        >
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <Field label="Mobile" value={candidate.mobile} />
            <Field label="Gender" value={<span className="capitalize">{candidate.gender.toLowerCase()}</span>} />
            <Field label="Age" value={candidate.age} />
            <Field label="Date of Joining" value={fmtDate(candidate.doj)} />
            <Field label="PAN" value={candidate.panNumber || '—'} />
            <Field label="Pincode" value={candidate.pincode} />
            <Field label="Appointment" value={fmtDate(candidate.appointmentDate)} />
            <Field label="Added on" value={fmtDate(candidate.createdAt)} />
          </div>
        </SectionCard>

        {/* Store / location */}
        <SectionCard
          title="Store & Location"
          icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.75c0 .415.336.75.75.75z" /></svg>}
        >
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <Field label="Store" value={candidate.store?.name} />
            <Field label="Store Code" value={candidate.store?.storeCode} />
            <Field label="City" value={candidate.store?.city?.name} />
            <Field label="Zone" value={candidate.store?.city?.zone?.name} />
            <div className="col-span-2 sm:col-span-3">
              <Field label="Address" value={candidate.store?.address || '—'} />
            </div>
            <Field
              label="Store Head"
              value={
                candidate.store?.storeHeadName
                  ? `${candidate.store.storeHeadName}${candidate.store.storeHeadMobile ? ` · ${candidate.store.storeHeadMobile}` : ''}`
                  : '—'
              }
            />
          </div>
        </SectionCard>
      </div>

      {/* Booking / schedule */}
      <SectionCard
        title="Booking & Schedule"
        icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /></svg>}
      >
        {isBooked ? (
          <>
          {schedulePassed && (
            <div className="mb-4 flex flex-col gap-3 rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-amber-700">
                The scheduled appointment date has passed. You can reschedule this appointment.
              </p>
              <Button size="sm" onClick={() => setRescheduling(true)}>Reschedule</Button>
            </div>
          )}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-primary-500 mb-1">Panel</p>
              <p className="text-sm font-semibold text-slate-800">{booking.panel?.name ?? '—'}</p>
              <div className="mt-1.5 flex flex-wrap gap-1">
                {(booking.panel?.bundledTest?.testsIncluded ?? []).map((t) => (
                  <span key={t} className="rounded-full border border-primary-200 bg-primary-50 px-1.5 py-0.5 text-[11px] font-medium text-primary-700">{t}</span>
                ))}
              </div>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-primary-500 mb-1">Lab</p>
              <p className="text-sm font-semibold text-slate-800">{booking.lab?.name ?? '—'}</p>
              <p className="text-xs text-slate-500">{booking.lab?.contactMobile}</p>
              {booking.lab?.address && (
                <p className="mt-0.5 text-xs text-slate-500">{booking.lab.address}{booking.lab.pincode ? ` - ${booking.lab.pincode}` : ''}</p>
              )}
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-primary-500 mb-1">Scheduled date &amp; time</p>
              <p className="text-sm font-semibold text-slate-800">
                {booking.scheduledDate ? fmtDate(booking.scheduledDate) : fmtDate(booking.reqDate)}
              </p>
              <p className="text-xs text-slate-500">{booking.timeSlot ?? '—'}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-primary-500 mb-1">Status</p>
              <Badge variant={bookingStatusVariant(booking)} size="sm">{bookingStatusLabel(booking)}</Badge>
              <p className="mt-1.5 text-xs text-slate-500">Requested: {fmtDate(booking.reqDate)}</p>
            </div>
          </div>

          {(booking.scheduleHistory?.length ?? 0) > 0 && (
            <div className="mt-5 border-t border-border pt-4">
              <p className="text-[10px] font-bold uppercase tracking-wider text-primary-500 mb-2">Reschedule history</p>
              <ol className="space-y-2">
                {booking.scheduleHistory!.map((h) => (
                  <li key={h.id} className="flex items-start gap-2 text-sm">
                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary-400 shrink-0" />
                    <div>
                      <p className="text-slate-700">
                        {h.previousDate ? fmtDate(h.previousDate) : '—'}{h.previousTimeSlot ? ` · ${h.previousTimeSlot}` : ''}
                        <span className="text-slate-400"> → </span>
                        <span className="font-medium">{h.newDate ? fmtDate(h.newDate) : '—'}{h.newTimeSlot ? ` · ${h.newTimeSlot}` : ''}</span>
                      </p>
                      <p className="text-xs text-slate-400">
                        Changed {fmtDate(h.createdAt)}{h.reason ? ` · ${h.reason}` : ''}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          )}
          </>
        ) : (
          <EmptyState
            icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /></svg>}
            title="No booking yet"
            description={candidate.appointmentDate ? 'Awaiting admin to book a lab for this candidate.' : 'No appointment has been requested for this candidate.'}
          />
        )}
      </SectionCard>

      {booking && rescheduling && (
        <RescheduleModal
          open={rescheduling}
          onClose={() => setRescheduling(false)}
          booking={booking}
          candidateName={candidate.name}
        />
      )}
    </div>
  );
}
