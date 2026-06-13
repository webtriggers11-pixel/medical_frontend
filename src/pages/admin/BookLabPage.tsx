import { useMemo, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { useCandidates } from '../../features/candidates/hooks/useCandidates';
import { useClientById } from '../../features/users/hooks/useUsers';
import { useCreateBooking } from '../../features/booking/hooks/useBookings';
import { orgService } from '../../services/org.service';
import { panelService } from '../../services/panel.service';
import { queryKeys } from '../../api/queryKeys';
import { Avatar } from '../../components/ui/Avatar';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/Skeleton';
import { Modal } from '../../components/ui/Modal';
import { DatePicker } from '../../components/ui/DatePicker';
import { Combobox } from '../../components/ui/Combobox';
import { Pagination } from '../../components/ui/Pagination';
import { usePagination } from '../../hooks/usePagination';
import { TIME_SLOTS } from '../../types/booking.types';
import { getApiErrorMessage } from '../../lib/apiError';

/* ── types ──────────────────────────────────────────────────────── */

interface BookLabState {
  candidateId: string;
  clientId: string;
  storeId: string;
}

/* ── helpers ─────────────────────────────────────────────────────── */

const money = (n: number) => `₹${Number(n).toLocaleString('en-IN')}`;

/* ── icons ───────────────────────────────────────────────────────── */

const BackIcon = (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
  </svg>
);
const CheckCircleIcon = (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

/* ── Step indicator ──────────────────────────────────────────────── */

function StepBadge({ n, label, active, done }: { n: number; label: string; active: boolean; done: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-all
        ${done ? 'bg-emerald-500 text-white' : active ? 'bg-white text-primary-600 ring-2 ring-white/40' : 'bg-white/20 text-white/60'}`}>
        {done ? '✓' : n}
      </div>
      <span className={`text-sm font-medium hidden sm:block ${active ? 'text-white' : done ? 'text-white/80' : 'text-white/50'}`}>
        {label}
      </span>
    </div>
  );
}

function StepDivider({ done }: { done: boolean }) {
  return (
    <div className={`hidden sm:block h-px w-10 lg:w-16 transition-colors ${done ? 'bg-emerald-400' : 'bg-white/20'}`} />
  );
}

/* ── Info chip ───────────────────────────────────────────────────── */

function InfoChip({ icon, label, value }: { icon: React.ReactNode; label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-2.5 min-w-0">
      <span className="text-slate-400 mt-0.5 shrink-0">{icon}</span>
      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 leading-none mb-0.5">{label}</p>
        <p className="text-xs font-medium text-slate-700 truncate">{value}</p>
      </div>
    </div>
  );
}

/* ── Main page ───────────────────────────────────────────────────── */

export function BookLabPage() {
  const navigate = useNavigate();
  const { state } = useLocation() as { state: BookLabState | null };
  const panelRef = useRef<HTMLDivElement>(null);

  const { candidateId, clientId, storeId } = state ?? {};

  /* data */
  // Backend returns only "requested" candidates (active, with an appointment,
  // not yet booked) scoped to this client + store.
  const { data: storeCandidates = [], isLoading: candidatesLoading } = useCandidates({
    clientId,
    storeId,
    available: true,
  });
  const { data: client, isLoading: clientLoading } = useClientById(clientId ?? '');
  const { data: allPanels, isLoading: panelsLoading } = useQuery({
    queryKey: [...queryKeys.panels.all, 'book-lab'],
    queryFn: () => panelService.getAll(),
    staleTime: 0,
  });
  const { data: allStores, isLoading: storesLoading } = useQuery({
    queryKey: queryKeys.org.storesAll,
    queryFn: () => orgService.listStores(),
  });
  const createBooking = useCreateBooking();

  /* derived */
  const store = useMemo(() => allStores?.find((s) => s.id === storeId), [allStores, storeId]);
  // Only panels assigned to the selected client (those with client-specific pricing).
  const clientPanels = useMemo(
    () => allPanels?.filter((p) => p.clientPricing?.some((cp) => cp.clientId === clientId)) ?? [],
    [allPanels, clientId],
  );

  /* selection */
  const [selected, setSelected] = useState<Set<string>>(() => new Set(candidateId ? [candidateId] : []));
  const allChecked = storeCandidates.length > 0 && storeCandidates.every((c) => selected.has(c.id));
  const indeterminate = !allChecked && storeCandidates.some((c) => selected.has(c.id));
  const toggleAll = () => setSelected(allChecked ? new Set() : new Set(storeCandidates.map((c) => c.id)));
  const toggle = (id: string) => setSelected((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const selectedCandidates = storeCandidates.filter((c) => selected.has(c.id));

  /* candidate pagination */
  const { page: candPage, setPage: setCandPage, totalPages: candTotalPages, pageItems: candItems } =
    usePagination(storeCandidates, { resetKey: `${clientId}|${storeId}|${storeCandidates.length}` });

  /* panels */
  const [showPanels, setShowPanels] = useState(false);
  const [bookingPanelId, setBookingPanelId] = useState<string | null>(null);
  const [bookedPanelIds, setBookedPanelIds] = useState<Set<string>>(new Set());
  const [bookError, setBookError] = useState('');

  /* panel pagination */
  const { page: panelPage, setPage: setPanelPage, totalPages: panelTotalPages, pageItems: panelItems } =
    usePagination(clientPanels, { resetKey: clientPanels.length });

  const openPanels = () => {
    setShowPanels(true);
    setTimeout(() => panelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80);
  };

  /* schedule modal — collect date + time slot before booking */
  const [scheduleTarget, setScheduleTarget] = useState<string | null>(null);
  const [scheduleDate, setScheduleDate] = useState<Date | undefined>(undefined);
  const [scheduleSlot, setScheduleSlot] = useState('');

  const openSchedule = (panelId: string) => {
    setBookError('');
    setScheduleDate(undefined);
    setScheduleSlot('');
    setScheduleTarget(panelId);
  };

  const confirmBook = async () => {
    if (!scheduleTarget) return;
    if (!scheduleDate) { setBookError('Please select a schedule date.'); return; }
    if (!scheduleSlot) { setBookError('Please select a time slot.'); return; }
    const panelId = scheduleTarget;
    setBookError('');
    setBookingPanelId(panelId);
    try {
      const scheduledDate = format(scheduleDate, 'yyyy-MM-dd');
      for (const c of selectedCandidates) {
        await createBooking.mutateAsync({ candidateId: c.id, panelId, scheduledDate, timeSlot: scheduleSlot });
      }
      setBookedPanelIds((prev) => new Set([...prev, panelId]));
      setScheduleTarget(null);
      navigate('/dashboard');
    } catch (err) { setBookError(getApiErrorMessage(err)); }
    finally { setBookingPanelId(null); }
  };

  /* step state for progress bar */
  const step2Done = selected.size > 0;
  const step3Done = bookedPanelIds.size > 0;

  /* guard */
  if (!state || !clientId || !storeId) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4 animate-fade-in">
        <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center">
          <svg className="w-7 h-7 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
        </div>
        <p className="text-slate-600 font-medium">No candidate context</p>
        <p className="text-sm text-slate-400">Use the Book button from the dashboard.</p>
        <Button variant="outline" icon={BackIcon} onClick={() => navigate('/dashboard')}>Back to dashboard</Button>
      </div>
    );
  }

  /* ── render ─────────────────────────────────────────────────────── */
  return (
    <div className="max-w-6xl mx-auto pb-20 animate-fade-in">

      {/* ── Hero banner ── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-600 via-primary-500 to-primary-700 px-6 py-7 sm:px-9 sm:py-8 mb-7">
        {/* background blobs */}
        <div className="pointer-events-none absolute -right-12 -top-16 h-52 w-52 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 right-32 h-44 w-44 rounded-full bg-primary-300/30 blur-3xl" />

        <div className="relative">
          {/* back */}
          <button
            onClick={() => navigate('/dashboard')}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-white/70 hover:text-white transition-colors mb-4"
          >
            {BackIcon}
            Back to dashboard
          </button>

          {/* title */}
          <div className="mb-5">
            <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">Book Lab Appointment</h1>
            {(client || store) && !clientLoading && !storesLoading && (
              <p className="mt-1.5 text-sm text-white/70">
                {client?.name ?? client?.email?.split('@')[0] ?? '…'}
                {store && <span className="text-white/40 mx-1.5">·</span>}
                {store?.name && <span>{store.name}</span>}
              </p>
            )}
          </div>

          {/* step indicators */}
          <div className="flex items-center gap-3">
            <StepBadge n={1} label="Client & Store" active={!step2Done} done={step2Done || step3Done} />
            <StepDivider done={step2Done || step3Done} />
            <StepBadge n={2} label="Select Candidates" active={step2Done && !step3Done} done={step3Done} />
            <StepDivider done={step3Done} />
            <StepBadge n={3} label="Book Panel" active={showPanels && !step3Done} done={step3Done} />
          </div>
        </div>
      </div>

      <div className="space-y-6">

        {/* ── Section 1: Client + Store ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

          {/* Client */}
          <div className="rounded-2xl border border-border bg-surface shadow-card overflow-hidden">
            {/* card header band */}
            <div className="h-1 w-full bg-gradient-to-r from-primary-500 to-primary-400" />
            <div className="p-5">
              <div className="flex items-center gap-1.5 mb-4">
                <div className="w-6 h-6 rounded-lg bg-primary-50 flex items-center justify-center">
                  <svg className="w-3.5 h-3.5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                  </svg>
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Client</span>
              </div>

              {clientLoading ? (
                <div className="flex items-center gap-3">
                  <Skeleton className="h-14 w-14 rounded-2xl" />
                  <div className="space-y-2 flex-1"><Skeleton className="h-5 w-36" /><Skeleton className="h-3.5 w-52" /></div>
                </div>
              ) : client ? (
                <>
                  <div className="flex items-center gap-3.5 mb-4">
                    <Avatar name={client.name ?? client.email} size="lg" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-bold text-slate-900 text-lg leading-tight truncate">
                          {client.name ?? client.email.split('@')[0]}
                        </p>
                        <Badge variant={client.isActive ? 'success' : 'danger'} size="sm">
                          {client.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-500 truncate mt-0.5">{client.email}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 pt-4 border-t border-border">
                    <InfoChip icon={
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" /></svg>
                    } label="Mobile" value={client.mobile} />
                    <InfoChip icon={
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" /></svg>
                    } label="Email verified" value={client.isEmailVerified ? 'Verified' : 'Not verified'} />
                    <InfoChip icon={
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /></svg>
                    } label="Member since" value={format(new Date(client.createdAt), 'd MMM yyyy')} />
                    <InfoChip icon={
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" /></svg>
                    } label="Email" value={client.email} />
                  </div>
                </>
              ) : null}
            </div>
          </div>

          {/* Store */}
          <div className="rounded-2xl border border-border bg-surface shadow-card overflow-hidden">
            <div className="h-1 w-full bg-gradient-to-r from-emerald-500 to-teal-400" />
            <div className="p-5">
              <div className="flex items-center gap-1.5 mb-4">
                <div className="w-6 h-6 rounded-lg bg-emerald-50 flex items-center justify-center">
                  <svg className="w-3.5 h-3.5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349M3.75 21V9.349m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.015a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72M6.75 18h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.75c0 .415.336.75.75.75z" />
                  </svg>
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Store</span>
              </div>

              {storesLoading ? (
                <div className="space-y-2"><Skeleton className="h-6 w-44" /><Skeleton className="h-4 w-24" /><Skeleton className="h-3 w-56 mt-3" /></div>
              ) : store ? (
                <>
                  <div className="mb-4">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <p className="font-bold text-slate-900 text-lg leading-tight">{store.name}</p>
                      <Badge variant={store.status === 'ACTIVE' ? 'success' : 'default'} size="sm">
                        {store.status.toLowerCase()}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">{store.storeCode}</span>
                      {store.city?.zone && (
                        <span className="text-xs text-slate-400">
                          {store.city.zone.name} <span className="text-slate-300">›</span> {store.city.name}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 pt-4 border-t border-border">
                    <InfoChip icon={
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>
                    } label="Address" value={store.address} />
                    <InfoChip icon={
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" /></svg>
                    } label="Email" value={store.email} />
                    <InfoChip icon={
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>
                    } label="Store head" value={`${store.storeHeadName} · ${store.storeHeadMobile}`} />
                    {store.storeAsstHeadName && (
                      <InfoChip icon={
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" /></svg>
                      } label="Asst. head" value={`${store.storeAsstHeadName}${store.storeAsstHeadMobile ? ` · ${store.storeAsstHeadMobile}` : ''}`} />
                    )}
                    {store.storeContact && (
                      <InfoChip icon={
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" /></svg>
                      } label="Contact" value={store.storeContact} />
                    )}
                    <InfoChip icon={
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /></svg>
                    } label="Created" value={format(new Date(store.createdAt), 'd MMM yyyy')} />
                  </div>
                </>
              ) : null}
            </div>
          </div>
        </div>

        {/* ── Section 2: Candidate selection ── */}
        <div className="rounded-2xl border border-border bg-surface shadow-card overflow-hidden">
          {/* section heading */}
          <div className="flex items-center justify-between gap-4 px-6 py-4 border-b border-border bg-slate-50/60">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary-100 text-primary-700 text-sm font-bold">2</div>
              <div>
                <p className="font-semibold text-slate-900">Select Candidates</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {storeCandidates.length} candidate{storeCandidates.length !== 1 ? 's' : ''} in this store
                </p>
              </div>
            </div>
            <Button
              icon={CheckCircleIcon}
              onClick={openPanels}
              disabled={selected.size === 0}
            >
              Book Panel{selected.size > 0 ? ` (${selected.size})` : ''}
            </Button>
          </div>

          {/* floating selection bar */}
          {selected.size > 0 && (
            <div className="flex items-center gap-3 px-6 py-2.5 bg-primary-50 border-b border-primary-100 animate-fade-in">
              <div className="flex -space-x-1.5">
                {selectedCandidates.slice(0, 4).map((c) => (
                  <Avatar key={c.id} name={c.name} size="sm" />
                ))}
              </div>
              <p className="text-sm font-medium text-primary-700 flex-1 min-w-0">
                <span className="font-bold">{selected.size}</span> selected —{' '}
                <span className="truncate">{selectedCandidates.slice(0, 2).map((c) => c.name.split(' ')[0]).join(', ')}{selected.size > 2 ? ` +${selected.size - 2} more` : ''}</span>
              </p>
              <button onClick={() => setSelected(new Set())} className="text-xs font-medium text-primary-500 hover:text-primary-700 transition-colors shrink-0">
                Clear
              </button>
            </div>
          )}

          {/* candidate table */}
          {candidatesLoading ? (
            <div className="p-6 space-y-3">
              {[1,2,3,4].map((i) => <div key={i} className="flex items-center gap-4"><div className="h-4 w-4 rounded bg-slate-100 animate-pulse" /><div className="h-9 w-9 rounded-full bg-slate-100 animate-pulse" /><div className="flex-1 space-y-1.5"><div className="h-3.5 w-36 rounded bg-slate-100 animate-pulse" /><div className="h-3 w-24 rounded bg-slate-100 animate-pulse" /></div></div>)}
            </div>
          ) : storeCandidates.length === 0 ? (
            <div className="py-14 text-center">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>
              </div>
              <p className="text-sm font-medium text-slate-500">No active candidates in this store</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <div className="max-h-[380px] overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm">
                    <tr className="border-b border-border">
                      <th className="px-5 py-3 w-10">
                        <input type="checkbox" checked={allChecked}
                          ref={(el) => { if (el) el.indeterminate = indeterminate; }}
                          onChange={toggleAll}
                          className="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500 cursor-pointer" />
                      </th>
                      {['Candidate', 'Emp. Code', 'Mobile', 'Gender', 'Type', 'DOJ', 'Appointment'].map((h) => (
                        <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {candItems.map((c) => {
                      const checked = selected.has(c.id);
                      return (
                        <tr key={c.id} onClick={() => toggle(c.id)}
                          className={`cursor-pointer transition-colors ${checked ? 'bg-primary-50/70' : 'hover:bg-slate-50/60'}`}>
                          <td className="px-5 py-3.5" onClick={(e) => e.stopPropagation()}>
                            <input type="checkbox" checked={checked} onChange={() => toggle(c.id)}
                              className="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500 cursor-pointer" />
                          </td>
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-2.5">
                              <Avatar name={c.name} size="sm" />
                              <div className="min-w-0">
                                <p className="font-medium text-slate-900 truncate">{c.name}</p>
                                <p className="text-xs text-slate-400 truncate">{c.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-3.5 font-mono text-xs text-slate-600 whitespace-nowrap">{c.employeeCode || '—'}</td>
                          <td className="px-5 py-3.5 text-slate-600 whitespace-nowrap">{c.mobile}</td>
                          <td className="px-5 py-3.5"><Badge variant="default" size="sm">{c.gender.toLowerCase()}</Badge></td>
                          <td className="px-5 py-3.5"><Badge variant="primary" size="sm">{c.candidateType.replace('_', ' ').toLowerCase()}</Badge></td>
                          <td className="px-5 py-3.5 text-xs text-slate-500 whitespace-nowrap">{c.doj ? new Date(c.doj).toLocaleDateString('en-IN') : '—'}</td>
                          <td className="px-5 py-3.5">
                            {c.appointmentDate
                              ? <span className="text-xs font-semibold text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full">{format(new Date(c.appointmentDate), 'd MMM yyyy')}</span>
                              : <span className="text-xs text-slate-400">—</span>}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {candTotalPages > 1 && (
                <div className="flex justify-end px-5 py-3 border-t border-border">
                  <Pagination currentPage={candPage} totalPages={candTotalPages} onPageChange={setCandPage} />
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Section 3: Panel table ── */}
        {showPanels && (
          <div ref={panelRef} className="rounded-2xl border border-border bg-surface shadow-card overflow-hidden animate-fade-in">
            {/* section heading */}
            <div className="flex items-center justify-between gap-4 px-6 py-4 border-b border-border bg-slate-50/60">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary-100 text-primary-700 text-sm font-bold">3</div>
                <div>
                  <p className="font-semibold text-slate-900">Available Panels</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {clientPanels.length} panels · booking for{' '}
                    <span className="font-semibold text-primary-600">{selectedCandidates.length} candidate{selectedCandidates.length !== 1 ? 's' : ''}</span>
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {/* selected candidate pill previews */}
                <div className="hidden sm:flex -space-x-1.5">
                  {selectedCandidates.slice(0, 3).map((c) => (
                    <Avatar key={c.id} name={c.name} size="sm" />
                  ))}
                  {selectedCandidates.length > 3 && (
                    <div className="w-7 h-7 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center text-[10px] font-bold text-slate-600">
                      +{selectedCandidates.length - 3}
                    </div>
                  )}
                </div>
                <button onClick={() => setShowPanels(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {bookError && (
              <div className="mx-5 mt-4 flex items-center gap-2 rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-600">
                <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                </svg>
                {bookError}
              </div>
            )}

            {panelsLoading ? (
              <div className="p-6 space-y-3">
                {[1,2,3].map((i) => (
                  <div key={i} className="h-14 rounded-xl bg-slate-50 animate-pulse border border-border" />
                ))}
              </div>
            ) : !clientPanels.length ? (
              <div className="py-14 text-center">
                <p className="text-sm font-medium text-slate-500">No panels assigned to this client.</p>
                <p className="text-xs text-slate-400 mt-1">Set client pricing on a panel from the Panels page first.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <div className="max-h-[500px] overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm">
                      <tr className="border-b border-border">
                        {['Panel', 'Lab & Address', 'Bundled Test', 'Tests Included', 'Timing', 'MRP', 'Cost to Vendor', 'Client Pays', 'Status', ''].map((h) => (
                          <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {panelItems.map((panel) => {
                        const pricing = panel.clientPricing?.find((cp) => cp.clientId === clientId);
                        const isBooked = bookedPanelIds.has(panel.id);
                        const isBooking = bookingPanelId === panel.id;
                        return (
                          <tr key={panel.id}
                            className={`transition-colors ${isBooked ? 'bg-emerald-50/60' : 'hover:bg-slate-50/40'}`}>
                            {/* Panel name */}
                            <td className="px-5 py-3.5">
                              <p className="font-semibold text-slate-900 whitespace-nowrap">{panel.name}</p>
                              {panel.labContact && <p className="text-xs text-slate-400 mt-0.5">{panel.labContact}</p>}
                            </td>
                            {/* Lab + address */}
                            <td className="px-5 py-3.5 min-w-[160px] max-w-[200px]">
                              <p className="font-medium text-slate-700 whitespace-nowrap">{panel.lab?.name ?? '—'}</p>
                              {panel.lab?.address && (
                                <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                                  {panel.lab.address}{panel.lab.pincode ? ` – ${panel.lab.pincode}` : ''}
                                </p>
                              )}
                            </td>
                            {/* Bundled test */}
                            <td className="px-5 py-3.5 text-slate-600 whitespace-nowrap">{panel.bundledTest?.name ?? '—'}</td>
                            {/* Tests */}
                            <td className="px-5 py-3.5 max-w-[220px]">
                              {panel.bundledTest?.testsIncluded?.length ? (
                                <div className="flex flex-wrap gap-1">
                                  {panel.bundledTest.testsIncluded.map((t) => (
                                    <span key={t} className="text-[11px] px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-600 whitespace-nowrap font-medium">{t}</span>
                                  ))}
                                </div>
                              ) : '—'}
                            </td>
                            {/* Timing */}
                            <td className="px-5 py-3.5 text-slate-600 whitespace-nowrap text-xs">{panel.timing ?? '—'}</td>
                            {/* MRP */}
                            <td className="px-5 py-3.5 whitespace-nowrap">
                              <span className="font-semibold text-slate-800">{money(panel.mrp)}</span>
                            </td>
                            {/* Cost to vendor */}
                            <td className="px-5 py-3.5 whitespace-nowrap">
                              <span className="font-semibold text-slate-800">{money(panel.costToVendor)}</span>
                            </td>
                            {/* Client pays */}
                            <td className="px-5 py-3.5 whitespace-nowrap">
                              {pricing ? (
                                <div>
                                  <p className="font-bold text-primary-700">{money(Number(pricing.costToClient))}</p>
                                  {pricing.discountAfterN > 0 && (
                                    <p className="text-xs text-emerald-600 mt-0.5">
                                      {money(Number(pricing.discountedPrice))} after {pricing.discountAfterN}
                                    </p>
                                  )}
                                </div>
                              ) : (
                                <span className="inline-flex items-center text-xs text-amber-600 bg-amber-50 border border-amber-100 rounded-full px-2 py-0.5 font-medium">
                                  Not set
                                </span>
                              )}
                            </td>
                            {/* Status */}
                            <td className="px-5 py-3.5">
                              <Badge variant={panel.status === 'ACTIVE' ? 'success' : 'default'} size="sm">
                                {panel.status.toLowerCase()}
                              </Badge>
                            </td>
                            {/* Action */}
                            <td className="px-5 py-3.5">
                              {isBooked ? (
                                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-full px-2.5 py-1 whitespace-nowrap">
                                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                  </svg>
                                  Booked
                                </span>
                              ) : (
                                <Button size="sm" loading={isBooking} disabled={selectedCandidates.length === 0}
                                  onClick={() => openSchedule(panel.id)}>
                                  Book
                                </Button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                {panelTotalPages > 1 && (
                  <div className="flex justify-end px-5 py-3 border-t border-border">
                    <Pagination currentPage={panelPage} totalPages={panelTotalPages} onPageChange={setPanelPage} />
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {scheduleTarget && (
        <Modal
          open={!!scheduleTarget}
          onClose={() => setScheduleTarget(null)}
          title="Schedule Appointment"
          size="md"
          footer={
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setScheduleTarget(null)} disabled={createBooking.isPending}>Cancel</Button>
              <Button loading={createBooking.isPending} onClick={confirmBook}>
                Book For Selected{selectedCandidates.length > 0 ? ` (${selectedCandidates.length})` : ''}
              </Button>
            </div>
          }
        >
          <div className="space-y-4">
            <p className="text-sm text-slate-600">
              Choose a date and time slot for{' '}
              <span className="font-semibold text-slate-900">
                {selectedCandidates.length} candidate{selectedCandidates.length === 1 ? '' : 's'}
              </span>.
            </p>

            <DatePicker
              label="Schedule date"
              required
              value={scheduleDate}
              onChange={setScheduleDate}
              placeholder="Select date"
            />

            <Combobox
              label="Time slot"
              required
              placeholder="Select a time slot…"
              options={TIME_SLOTS.map((t) => ({ value: t, label: t }))}
              value={scheduleSlot}
              onChange={setScheduleSlot}
            />

            {bookError && (
              <div className="flex items-center gap-2 rounded-xl bg-red-50 border border-red-100 px-3 py-2.5 text-sm text-red-600">
                <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" /></svg>
                {bookError}
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}
