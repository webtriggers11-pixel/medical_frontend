import { useMemo, useRef, useState } from 'react';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { Combobox } from '../../../components/ui/Combobox';
import { useBulkUploadCandidates } from '../hooks/useBulkUploadCandidates';
import { useZones, useCities, useStores } from '../hooks/useOrgCascade';
import { candidatesService } from '../../../services/candidates.service';
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

  // Store is chosen here (not in the CSV); all uploaded candidates go to it.
  const [zoneId, setZoneId] = useState('');
  const [cityId, setCityId] = useState('');
  const [storeId, setStoreId] = useState('');

  const { data: zones, isLoading: zonesLoading } = useZones();
  const { data: cities, isLoading: citiesLoading } = useCities(zoneId || undefined);
  const { data: stores, isLoading: storesLoading } = useStores(cityId || undefined);

  const zoneOptions = useMemo(() => (zones ?? []).map((z) => ({ label: z.name, value: z.id })), [zones]);
  const cityOptions = useMemo(() => (cities ?? []).map((c) => ({ label: c.name, value: c.id })), [cities]);
  const storeOptions = useMemo(
    () => (stores ?? []).map((s) => ({ label: `${s.name} (${s.storeCode})`, value: s.id })),
    [stores],
  );

  const close = () => {
    setFile(null);
    setError('');
    setResult(null);
    setZoneId('');
    setCityId('');
    setStoreId('');
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

  const onZoneChange = (id: string) => { setZoneId(id); setCityId(''); setStoreId(''); setError(''); };
  const onCityChange = (id: string) => { setCityId(id); setStoreId(''); setError(''); };

  const handleUpload = async () => {
    if (!storeId) {
      setError('Select the store these candidates belong to first.');
      return;
    }
    if (!file) {
      setError('Choose a CSV file first.');
      return;
    }
    setError('');
    try {
      const res = await mutateAsync({ file, storeId });
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
            <Button onClick={handleUpload} loading={isPending} disabled={!file || !storeId}>
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
            <fieldset disabled={isPending} className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <Combobox
                label="Zone"
                required
                options={zoneOptions}
                value={zoneId}
                onChange={onZoneChange}
                placeholder={zonesLoading ? 'Loading…' : 'Select zone'}
                searchPlaceholder="Search zones…"
                loading={zonesLoading}
              />
              <Combobox
                label="City"
                required
                options={cityOptions}
                value={cityId}
                onChange={onCityChange}
                placeholder={!zoneId ? 'Select zone first' : citiesLoading ? 'Loading…' : 'Select city'}
                searchPlaceholder="Search cities…"
                disabled={!zoneId}
                loading={citiesLoading}
              />
              <Combobox
                label="Store"
                required
                options={storeOptions}
                value={storeId}
                onChange={(id) => { setStoreId(id); setError(''); }}
                placeholder={!cityId ? 'Select city first' : storesLoading ? 'Loading…' : 'Select store'}
                searchPlaceholder="Search stores…"
                disabled={!cityId}
                loading={storesLoading}
              />
            </fieldset>

            <p className="text-sm text-slate-500">
              Pick the store above — <span className="font-medium text-slate-600">every candidate in the file is assigned to it</span>. Then upload a CSV with columns{' '}
              <code className="text-xs bg-slate-100 px-1.5 py-0.5 rounded">name, employeeCode, mobile, gender, age, candidateType, doj, appointmentDate, pincode, email, panNumber</code>.
              Dates use <code className="text-xs bg-slate-100 px-1 py-0.5 rounded">YYYY-MM-DD</code>, and <code className="text-xs bg-slate-100 px-1 py-0.5 rounded">appointmentDate</code> must be a future date.
              All required except <code className="text-xs bg-slate-100 px-1 py-0.5 rounded">panNumber</code>. Need the format?{' '}
              <button
                type="button"
                onClick={() => candidatesService.downloadTemplate()}
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                Download the template
              </button>
              .
            </p>

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
