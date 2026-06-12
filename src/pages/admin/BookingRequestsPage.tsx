import { useState } from 'react';
import { useBookingRequests, useCreateBooking } from '../../features/booking/hooks/useBookings';
import { usePanels } from '../../features/panel/hooks/usePanels';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Combobox } from '../../components/ui/Combobox';
import { Avatar } from '../../components/ui/Avatar';
import { SearchInput } from '../../components/ui/SearchInput';
import { SkeletonTable } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { Pagination } from '../../components/ui/Pagination';
import { usePagination } from '../../hooks/usePagination';
import { getApiErrorMessage } from '../../lib/apiError';
import { format } from 'date-fns';
import type { BookingRequest } from '../../types/booking.types';

const fmt = (n: number) => `₹${Number(n).toLocaleString('en-IN')}`;

// ── Book Now modal — admin assigns panel ──────────────────────────

function BookNowModal({ request, open, onClose }: { request: BookingRequest; open: boolean; onClose: () => void }) {
  const { data: allPanels } = usePanels();
  const createBooking = useCreateBooking();
  const [panelId, setPanelId] = useState('');
  const [apiError, setApiError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Only panels assigned to THIS client
  const assignedPanels = allPanels?.filter((p) =>
    p.clientPricing?.some((cp) => cp.clientId === request.clientId)
  ) ?? [];

  const panelOptions = assignedPanels.map((p) => ({ value: p.id, label: p.name }));
  const selectedPanel = assignedPanels.find((p) => p.id === panelId);
  const clientPricing = selectedPanel?.clientPricing?.find((cp) => cp.clientId === request.clientId);

  const handleClose = () => { setPanelId(''); setApiError(''); onClose(); };

  const handleSubmit = async () => {
    if (!panelId) { setApiError('Please select a panel'); return; }
    setApiError('');
    setSubmitting(true);
    try {
      await createBooking.mutateAsync({ candidateId: request.id, panelId });
      handleClose();
    } catch (err) {
      setApiError(getApiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Book appointment"
      size="md"
      footer={
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={handleClose}>Cancel</Button>
          <Button loading={submitting} onClick={handleSubmit} disabled={!panelId}>Book Now</Button>
        </div>
      }
    >
      <div className="space-y-4">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-border">
          <Avatar name={request.name} size="sm" />
          <div className="flex-1">
            <p className="font-medium text-slate-900">{request.name}</p>
            <p className="text-xs text-slate-500">
              {request.client?.name ?? request.client?.email}
              {request.appointmentDate && ` · ${format(new Date(request.appointmentDate), 'd MMM yyyy')}`}
            </p>
          </div>
        </div>

        {apiError && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{apiError}</p>}

        <Combobox
          label="Select panel for this candidate"
          required
          options={panelOptions}
          value={panelId}
          onChange={setPanelId}
          placeholder="Choose a panel"
          searchPlaceholder="Search panels..."
          emptyText="No panels assigned to this client"
        />

        {selectedPanel && (
          <div className="rounded-xl border border-border bg-white p-4 space-y-2 text-sm">
            <div className="flex justify-between gap-3">
              <span className="text-slate-500">Lab</span>
              <span className="font-medium text-slate-800 text-right">
                {selectedPanel.lab?.name ?? '—'}
                {selectedPanel.lab?.address && (
                  <span className="block text-xs font-normal text-slate-400 leading-snug">
                    {selectedPanel.lab.address}{selectedPanel.lab.pincode ? ` – ${selectedPanel.lab.pincode}` : ''}
                  </span>
                )}
              </span>
            </div>
            {selectedPanel.bundledTest?.testsIncluded && (
              <div className="flex flex-wrap gap-1">
                {selectedPanel.bundledTest.testsIncluded.map((t) => (
                  <span key={t} className="text-xs px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">{t}</span>
                ))}
              </div>
            )}
            <div className="flex justify-between pt-1 border-t border-border">
              <span className="text-slate-500">Client pays</span>
              <span className="font-semibold text-blue-700">
                {clientPricing ? fmt(Number(clientPricing.costToClient)) : fmt(Number(selectedPanel.mrp))}
              </span>
            </div>
          </div>
        )}

        {panelOptions.length === 0 && (
          <p className="text-xs text-amber-600 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
            This client has no panels assigned. Assign panels first from the client detail page.
          </p>
        )}
      </div>
    </Modal>
  );
}

// ── Main page ─────────────────────────────────────────────────────

export function BookingRequestsPage() {
  const { data: requests, isLoading, error } = useBookingRequests();
  const [search, setSearch] = useState('');
  const [bookTarget, setBookTarget] = useState<BookingRequest | null>(null);

  const filtered = requests?.filter((r) => {
    const q = search.toLowerCase();
    return (
      r.name.toLowerCase().includes(q) ||
      (r.employeeCode ?? '').toLowerCase().includes(q) ||
      (r.client?.name ?? r.client?.email ?? '').toLowerCase().includes(q)
    );
  }) ?? [];

  const { page, setPage, totalPages, pageItems } = usePagination(filtered ?? [], { resetKey: `${search}` });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Booking Requests</h1>
          <p className="text-slate-500 mt-1">
            Candidates awaiting booking — assign a panel and confirm
            {requests && <span className="text-slate-400"> · {requests.length} pending</span>}
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
            description={search ? `No results for "${search}"` : 'When clients add candidates with an appointment date, they appear here for booking.'}
          />
        </Card>
      )}

      {filtered.length > 0 && (
        <Card padding="none">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-slate-50/60">
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">ID</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Candidate</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Client</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Store</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Mobile</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Appointment date</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-5 py-3.5" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {pageItems.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-4">
                      <span className="text-xs font-mono font-semibold text-slate-400">{r.candidateId ?? '—'}</span>
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-medium text-slate-900">{r.name}</p>
                      <p className="text-xs text-slate-400">{r.employeeCode || '—'}</p>
                    </td>
                    <td className="px-5 py-4 text-slate-600">{r.client?.name ?? r.client?.email ?? '—'}</td>
                    <td className="px-5 py-4 text-slate-600">{r.store?.name ?? '—'}</td>
                    <td className="px-5 py-4 text-slate-600">{r.mobile}</td>
                    <td className="px-5 py-4 text-slate-700 font-medium">
                      {r.appointmentDate ? format(new Date(r.appointmentDate), 'd MMM yyyy') : '—'}
                    </td>
                    <td className="px-5 py-4"><Badge variant="warning" size="sm">Requested</Badge></td>
                    <td className="px-5 py-4">
                      <Button size="sm" onClick={() => setBookTarget(r)}>Book Now</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div className="flex justify-end px-5 py-3 border-t border-border">
              <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
            </div>
          )}
        </Card>
      )}

      {bookTarget && (
        <BookNowModal request={bookTarget} open={!!bookTarget} onClose={() => setBookTarget(null)} />
      )}
    </div>
  );
}
