import { useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { useBulkUploadCandidates } from '../hooks/useBulkUploadCandidates';
import { candidatesService } from '../../../services/candidates.service';
import { orgService } from '../../../services/org.service';
import { queryKeys } from '../../../api/queryKeys';
import { getApiErrorMessage } from '../../../lib/apiError';
import type { BulkUploadResult } from '../../../types/candidate.types';

interface BulkUploadModalProps {
  open: boolean;
  onClose: () => void;
}

export function BulkUploadModal({ open, onClose }: BulkUploadModalProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [result, setResult] = useState<BulkUploadResult | null>(null);
  const { mutateAsync, isPending } = useBulkUploadCandidates();

  // Reference list of the client's stores so they can copy the right storeId.
  const { data: stores, isLoading: storesLoading } = useQuery({
    queryKey: queryKeys.org.storesAll,
    queryFn: () => orgService.listStores(),
    enabled: open,
  });

  const close = () => {
    setFile(null);
    setError('');
    setResult(null);
    onClose();
  };

  const pickFile = (selected: File | null) => {
    setError('');
    setResult(null);
    if (selected && !selected.name.toLowerCase().endsWith('.csv')) {
      setError('Please choose a .csv file.');
      setFile(null);
      return;
    }
    setFile(selected);
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Choose a CSV file first.');
      return;
    }
    setError('');
    try {
      const res = await mutateAsync({ file });
      setResult(res);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Upload failed.'));
    }
  };

  return (
    <Modal
      open={open}
      onClose={close}
      title="Bulk candidate upload"
      footer={
        result ? (
          <Button onClick={close}>Done</Button>
        ) : (
          <>
            <Button variant="outline" onClick={close} disabled={isPending}>
              Cancel
            </Button>
            <Button onClick={handleUpload} loading={isPending} disabled={!file}>
              Upload
            </Button>
          </>
        )
      }
    >
      <div className="space-y-4">
        {error && (
          <div className="rounded-xl bg-red-50 border border-red-100 px-3.5 py-2.5 text-sm text-red-600">
            {error}
          </div>
        )}

        {!result && (
          <>
            <p className="text-sm text-slate-500">
              Each candidate's store is set <span className="font-medium text-slate-600">per row</span> via the{' '}
              <code className="text-xs bg-slate-100 px-1.5 py-0.5 rounded">storeId</code> column, so candidates can go to different stores in one file. Upload a CSV with columns{' '}
              <code className="text-xs bg-slate-100 px-1.5 py-0.5 rounded">zone, city, storeId, name, employeeCode, mobile, gender, age, candidateType, doj, appointmentDate, pincode, email, panNumber</code>.
              Dates use <code className="text-xs bg-slate-100 px-1 py-0.5 rounded">YYYY-MM-DD</code>, and <code className="text-xs bg-slate-100 px-1 py-0.5 rounded">appointmentDate</code> must be a future date.
              All required except <code className="text-xs bg-slate-100 px-1 py-0.5 rounded">zone</code>, <code className="text-xs bg-slate-100 px-1 py-0.5 rounded">city</code>, <code className="text-xs bg-slate-100 px-1 py-0.5 rounded">employeeCode</code>, <code className="text-xs bg-slate-100 px-1 py-0.5 rounded">email</code> and <code className="text-xs bg-slate-100 px-1 py-0.5 rounded">panNumber</code>.{' '}
              <button
                type="button"
                onClick={() => candidatesService.downloadTemplate()}
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                Download the template
              </button>{' '}
              — it comes pre-filled with your stores' zone, city and storeId so you can copy the right id into each row.
            </p>

            {/* Reference: the client's stores with zone / city / storeId */}
            <div className="rounded-xl border border-blue-100 bg-blue-50/50 px-4 py-3">
              <p className="text-xs font-semibold text-blue-700 mb-2">
                Your stores — for reference while filling the CSV
              </p>
              {storesLoading ? (
                <p className="text-sm text-slate-400">Loading your stores…</p>
              ) : stores && stores.length > 0 ? (
                <ul className="space-y-1.5 max-h-44 overflow-y-auto">
                  {stores.map((s) => (
                    <li key={s.id} className="text-sm text-slate-600">
                      <span className="text-slate-400">{s.city?.zone?.name ?? '—'} › {s.city?.name ?? '—'}</span>{' '}
                      <span className="font-medium text-slate-700">{s.name}</span>{' '}
                      <span className="text-xs text-slate-400">({s.storeCode})</span>
                      {' — '}
                      <code className="text-xs font-mono text-slate-600">{s.id}</code>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-slate-400">
                  You have no stores yet. Add a store before uploading candidates.
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={isPending}
              className="w-full rounded-2xl border-2 border-dashed border-border hover:border-primary-300 hover:bg-primary-50/30 transition-colors px-6 py-10 flex flex-col items-center gap-2 text-center disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-border disabled:hover:bg-transparent"
            >
              <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                </svg>
              </div>
              <p className="text-sm font-medium text-slate-700">
                {file ? file.name : 'Click to choose a CSV file'}
              </p>
              <p className="text-xs text-slate-400">CSV up to a few thousand rows</p>
            </button>

            <input
              ref={inputRef}
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={(e) => pickFile(e.target.files?.[0] ?? null)}
            />
          </>
        )}

        {result && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-emerald-50 border border-emerald-100 px-4 py-3">
                <p className="text-2xl font-bold text-emerald-600">{result.created}</p>
                <p className="text-xs font-medium text-emerald-700">Created</p>
              </div>
              <div className="rounded-xl bg-amber-50 border border-amber-100 px-4 py-3">
                <p className="text-2xl font-bold text-amber-600">{result.skipped}</p>
                <p className="text-xs font-medium text-amber-700">Skipped</p>
              </div>
            </div>

            {result.errors.length > 0 && (
              <div className="rounded-xl border border-border overflow-hidden">
                <p className="px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wider bg-slate-50 border-b border-border">
                  Skipped rows
                </p>
                <div className="max-h-48 overflow-y-auto divide-y divide-border">
                  {result.errors.map((err, i) => (
                    <div key={i} className="px-4 py-2 text-sm flex items-start justify-between gap-3">
                      <span className="text-slate-700">
                        Row {err.row} &middot; <span className="text-slate-500">{err.mobile}</span>
                      </span>
                      <span className="text-xs text-red-500 text-right shrink-0">{err.reason}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}
