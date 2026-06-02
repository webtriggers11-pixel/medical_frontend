import { useEffect, useMemo, useRef, useState } from 'react';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { Combobox } from '../../../components/ui/Combobox';
import { Input } from '../../../components/ui/Input';
import { Switch } from '../../../components/ui/Switch';
import { Avatar } from '../../../components/ui/Avatar';
import { getApiErrorMessage } from '../../../lib/apiError';
import { useUploadReportFiles, useUpdateReport, useDeleteReport } from '../hooks/useUploadReport';
import { downloadReportFile } from '../lib/fileDownload';
import { FilePreview } from './FilePreview';
import type { FitnessStatus, Report, ReportFile, UploadedFile } from '../../../types/report.types';

const FITNESS_OPTIONS = [
  { value: 'FIT', label: 'Fit' },
  { value: 'UNFIT', label: 'Unfit' },
  { value: 'HOLD', label: 'Hold' },
];
const YES_NO = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' },
];
const ACCEPT = '.pdf,.png,.jpg,.jpeg';

function fmtSize(bytes?: number | null) {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const sameTests = (a: string[], b: string[]) =>
  a.length === b.length && a.every((t) => b.includes(t));

/* ── staged state ─────────────────────────────────────────────── */

interface ExistingState {
  file: ReportFile;
  remove: boolean;
  testsCovered: string[];
}
interface NewState {
  key: string;
  name: string;
  size: number;
  status: 'uploading' | 'done' | 'error';
  uploaded?: UploadedFile;
  testsCovered: string[];
  error?: string;
  localUrl: string;
}
type Selected = { kind: 'existing'; id: string } | { kind: 'new'; key: string } | null;

interface Props {
  open: boolean;
  onClose: () => void;
  report: Report;
  candidateName: string;
  /** Tests bundled in the booking's panel — offered as "Uploaded for" tags. */
  tests: string[];
}

export function ReportManagerModal({ open, onClose, report, candidateName, tests }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const keySeq = useRef(0);
  const blobUrls = useRef<string[]>([]);

  const uploadFiles = useUploadReportFiles();
  const updateReport = useUpdateReport();
  const deleteReport = useDeleteReport();

  const [tab, setTab] = useState<'preview' | 'details'>('details');

  // files — seeded from props (the modal is mounted with key={report.id}, so a
  // different report remounts it fresh; no re-seed effect needed).
  const [existing, setExisting] = useState<ExistingState[]>(() =>
    (report.files ?? []).map((f) => ({ file: f, remove: false, testsCovered: [...(f.testsCovered ?? [])] })),
  );
  const [newFiles, setNewFiles] = useState<NewState[]>([]);
  const [selected, setSelected] = useState<Selected>(() =>
    report.files?.length ? { kind: 'existing', id: report.files[0].id } : null,
  );

  // metadata
  const [fitnessStatus, setFitnessStatus] = useState<FitnessStatus>(report.fitnessStatus);
  const [remarks, setRemarks] = useState(report.remarks ?? '');
  const [labInternalRef, setLabInternalRef] = useState(report.labInternalRef ?? '');
  const [isInsure, setIsInsure] = useState(report.isInsure ? 'yes' : 'no');
  const [approvalStatus, setApprovalStatus] = useState(report.approvalStatus);

  const [apiError, setApiError] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);

  // tests offered = panel tests ∪ any tests already on existing files
  const availableTests = useMemo(() => {
    const set = new Set<string>(tests);
    (report.files ?? []).forEach((f) => f.testsCovered?.forEach((t) => set.add(t)));
    return Array.from(set);
  }, [tests, report.files]);

  // revoke any object URLs created for previews when the modal unmounts
  useEffect(() => () => blobUrls.current.forEach(URL.revokeObjectURL), []);

  const patchNew = (key: string, patch: Partial<NewState>) =>
    setNewFiles((prev) => prev.map((f) => (f.key === key ? { ...f, ...patch } : f)));

  const handlePick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = Array.from(e.target.files ?? []);
    e.target.value = '';
    if (!picked.length) return;
    setApiError('');

    const entries: NewState[] = picked.map((file) => {
      const localUrl = URL.createObjectURL(file);
      blobUrls.current.push(localUrl);
      return {
        key: `n${keySeq.current++}`,
        name: file.name,
        size: file.size,
        status: 'uploading' as const,
        testsCovered: [...tests],
        localUrl,
      };
    });
    setNewFiles((prev) => [...prev, ...entries]);
    setSelected({ kind: 'new', key: entries[0].key });

    await Promise.all(
      picked.map(async (file, i) => {
        const key = entries[i].key;
        try {
          const [uploaded] = await uploadFiles.mutateAsync([file]);
          patchNew(key, { status: 'done', uploaded });
        } catch (err) {
          patchNew(key, { status: 'error', error: getApiErrorMessage(err) });
        }
      }),
    );
  };

  const toggleRemoveExisting = (id: string) =>
    setExisting((prev) => prev.map((e) => (e.file.id === id ? { ...e, remove: !e.remove } : e)));

  const removeNew = (key: string) =>
    setNewFiles((prev) => prev.filter((f) => f.key !== key));

  const toggleTestExisting = (id: string, test: string) =>
    setExisting((prev) =>
      prev.map((e) =>
        e.file.id === id
          ? { ...e, testsCovered: e.testsCovered.includes(test) ? e.testsCovered.filter((t) => t !== test) : [...e.testsCovered, test] }
          : e,
      ),
    );

  const toggleTestNew = (key: string, test: string) =>
    setNewFiles((prev) =>
      prev.map((f) =>
        f.key === key
          ? { ...f, testsCovered: f.testsCovered.includes(test) ? f.testsCovered.filter((t) => t !== test) : [...f.testsCovered, test] }
          : f,
      ),
    );

  const keptExisting = existing.filter((e) => !e.remove);
  const doneNew = newFiles.filter((f) => f.status === 'done' && f.uploaded);
  const totalFiles = keptExisting.length + doneNew.length;

  const handleSave = async () => {
    if (newFiles.some((f) => f.status === 'uploading'))
      return setApiError('Please wait for files to finish uploading.');
    if (totalFiles < 1)
      return setApiError('A report must keep at least one file.');
    if (availableTests.length) {
      const untagged = [...keptExisting.map((e) => e.testsCovered), ...doneNew.map((f) => f.testsCovered)].some((t) => t.length === 0);
      if (untagged) return setApiError('Select what each file is uploaded for.');
    }

    setApiError('');
    const removeFileIds = existing.filter((e) => e.remove).map((e) => e.file.id);
    const addFiles = doneNew.map((f) => ({
      fileUrl: f.uploaded!.fileUrl,
      fileKey: f.uploaded!.fileKey,
      fileName: f.uploaded!.fileName,
      fileSize: f.uploaded!.fileSize,
      testsCovered: f.testsCovered,
    }));
    const fileUpdates = keptExisting
      .filter((e) => !sameTests(e.testsCovered, e.file.testsCovered ?? []))
      .map((e) => ({ id: e.file.id, testsCovered: e.testsCovered }));

    try {
      await updateReport.mutateAsync({
        id: report.id,
        input: {
          fitnessStatus,
          // a reason only applies to unfit / hold — clear it otherwise
          remarks: fitnessStatus === 'UNFIT' || fitnessStatus === 'HOLD' ? remarks.trim() : '',
          labInternalRef: labInternalRef.trim() || undefined,
          isInsure: isInsure === 'yes',
          approvalStatus,
          addFiles: addFiles.length ? addFiles : undefined,
          removeFileIds: removeFileIds.length ? removeFileIds : undefined,
          fileUpdates: fileUpdates.length ? fileUpdates : undefined,
        },
      });
      onClose();
    } catch (err) {
      setApiError(getApiErrorMessage(err));
    }
  };

  const handleDeleteReport = async () => {
    setApiError('');
    try {
      await deleteReport.mutateAsync(report.id);
      onClose();
    } catch (err) {
      setApiError(getApiErrorMessage(err));
      setConfirmDelete(false);
    }
  };

  const busy = updateReport.isPending || deleteReport.isPending;
  const selectedName =
    selected?.kind === 'existing'
      ? existing.find((e) => e.file.id === selected.id)?.file.fileName ?? ''
      : selected?.kind === 'new'
        ? newFiles.find((f) => f.key === selected.key)?.name ?? ''
        : '';

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Report — ${candidateName}`}
      size="xl"
      footer={
        confirmDelete ? (
          <div className="flex items-center justify-between gap-3 w-full">
            <p className="text-sm text-red-600 font-medium">Delete this entire report and its files?</p>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setConfirmDelete(false)} disabled={busy}>Cancel</Button>
              <Button variant="danger" loading={deleteReport.isPending} onClick={handleDeleteReport}>Delete report</Button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-3 w-full">
            <Button variant="ghost" onClick={() => setConfirmDelete(true)} disabled={busy} className="text-red-600 hover:bg-red-50">
              Delete report
            </Button>
            <div className="flex gap-3">
              <Button variant="outline" onClick={onClose} disabled={busy}>Close</Button>
              <Button loading={updateReport.isPending} onClick={handleSave}>Save changes</Button>
            </div>
          </div>
        )
      }
    >
      <input ref={fileInputRef} type="file" multiple accept={ACCEPT} className="hidden" onChange={handlePick} />

      <div className="space-y-4">
        {/* candidate + tabs */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Avatar name={candidateName} size="sm" />
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Report for</p>
              <p className="text-sm font-semibold text-slate-900">{candidateName}</p>
            </div>
          </div>
          <div className="inline-flex rounded-xl border border-border bg-slate-50 p-0.5 text-sm">
            {(['details', 'preview'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className={`px-3.5 py-1.5 rounded-lg font-medium capitalize transition-colors ${tab === t ? 'bg-white text-primary-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                {t === 'preview' ? 'Files & preview' : 'Details'}
              </button>
            ))}
          </div>
        </div>

        {apiError && (
          <div className="flex items-center gap-2 rounded-xl bg-red-50 border border-red-100 px-3 py-2.5 text-sm text-red-600">
            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" /></svg>
            {apiError}
          </div>
        )}

        {tab === 'preview' ? (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
            {/* file list */}
            <div className="lg:col-span-2 space-y-2.5">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Files ({totalFiles})</p>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => fileInputRef.current?.click()}
                  icon={<svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>}
                >
                  Upload
                </Button>
              </div>

              <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
                {existing.map((e) => (
                  <FileCard
                    key={e.file.id}
                    name={e.file.fileName}
                    size={e.file.fileSize}
                    active={selected?.kind === 'existing' && selected.id === e.file.id}
                    removed={e.remove}
                    tests={availableTests}
                    testsCovered={e.testsCovered}
                    onToggleTest={(t) => toggleTestExisting(e.file.id, t)}
                    onSelect={() => setSelected({ kind: 'existing', id: e.file.id })}
                    onDownload={() => downloadReportFile(e.file)}
                    onRemove={() => toggleRemoveExisting(e.file.id)}
                  />
                ))}
                {newFiles.map((f) => (
                  <FileCard
                    key={f.key}
                    name={f.name}
                    size={f.size}
                    isNew
                    status={f.status}
                    error={f.error}
                    active={selected?.kind === 'new' && selected.key === f.key}
                    tests={availableTests}
                    testsCovered={f.testsCovered}
                    onToggleTest={(t) => toggleTestNew(f.key, t)}
                    onSelect={() => setSelected({ kind: 'new', key: f.key })}
                    onRemove={() => removeNew(f.key)}
                  />
                ))}
                {totalFiles === 0 && existing.length === 0 && newFiles.length === 0 && (
                  <p className="text-sm text-slate-400 py-6 text-center">No files. Upload one above.</p>
                )}
              </div>
            </div>

            {/* preview pane */}
            <div className="lg:col-span-3">
              {selected ? (
                <FilePreview
                  key={selected.kind === 'existing' ? `e:${selected.id}` : `n:${selected.key}`}
                  name={selectedName}
                  fileId={selected.kind === 'existing' ? selected.id : undefined}
                  localUrl={selected.kind === 'new' ? newFiles.find((f) => f.key === selected.key)?.localUrl : undefined}
                  onDownload={
                    selected.kind === 'existing'
                      ? () => { const e = existing.find((x) => x.file.id === selected.id); if (e) downloadReportFile(e.file); }
                      : undefined
                  }
                />
              ) : (
                <div className="h-[460px] rounded-xl border border-border bg-slate-50 flex items-center justify-center">
                  <p className="text-sm text-slate-400 px-6 text-center">Select a file to preview it here.</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* details tab */
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Combobox label="Fitness Status" required options={FITNESS_OPTIONS} value={fitnessStatus} onChange={(v) => setFitnessStatus(v as FitnessStatus)} placeholder="Select…" />
            <Input label="Lab Internal Ref." placeholder="Reference no." value={labInternalRef} onChange={(e) => setLabInternalRef(e.target.value)} />
            <Combobox label="Is Insure" options={YES_NO} value={isInsure} onChange={setIsInsure} placeholder="Select…" />
            <div>
              <p className="block text-sm font-medium text-slate-700 mb-2">Approval Status</p>
              <div className="flex items-center gap-2 h-10">
                <Switch checked={approvalStatus} onChange={setApprovalStatus} label="Approval status" />
                <span className={`text-sm font-medium ${approvalStatus ? 'text-primary-600' : 'text-slate-400'}`}>{approvalStatus ? 'Approved' : 'Pending'}</span>
              </div>
            </div>
            {(fitnessStatus === 'UNFIT' || fitnessStatus === 'HOLD') && (
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Reason / Remarks</label>
                <textarea rows={3} placeholder="Reason for the unfit / hold decision, observations, etc." value={remarks} onChange={(e) => setRemarks(e.target.value)} className="w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none" />
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}

/* ── single file card ─────────────────────────────────────────── */

function FileCard({
  name, size, active, removed, isNew, status, error, tests, testsCovered,
  onToggleTest, onSelect, onDownload, onRemove,
}: {
  name: string;
  size?: number | null;
  active?: boolean;
  removed?: boolean;
  isNew?: boolean;
  status?: 'uploading' | 'done' | 'error';
  error?: string;
  tests: string[];
  testsCovered: string[];
  onToggleTest: (t: string) => void;
  onSelect: () => void;
  onDownload?: () => void;
  onRemove: () => void;
}) {
  return (
    <div className={`rounded-xl border p-3 transition-colors ${active ? 'border-primary-300 bg-primary-50/50' : 'border-border bg-surface'} ${removed ? 'opacity-60' : ''}`}>
      <div className="flex items-start gap-2.5">
        <button type="button" onClick={onSelect} className="shrink-0 mt-0.5 flex h-9 w-9 items-center justify-center rounded-lg bg-primary-50 text-primary-600" title="Preview">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>
        </button>

        <div className="min-w-0 flex-1">
          <button type="button" onClick={onSelect} className="block w-full text-left">
            <div className="flex items-center gap-1.5">
              <p className={`truncate text-sm font-medium ${removed ? 'line-through text-slate-400' : 'text-slate-800'}`} title={name}>{name}</p>
              {isNew && status === 'uploading' && (
                <svg className="animate-spin h-3.5 w-3.5 text-primary-500 shrink-0" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
              )}
              {isNew && status === 'done' && <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-full px-1.5 shrink-0">new</span>}
            </div>
            <p className="text-xs text-slate-400">{fmtSize(size)}{removed ? ' · will be removed' : ''}</p>
          </button>
          {status === 'error' && <p className="text-xs text-danger font-medium mt-0.5">{error || 'Upload failed'}</p>}

          {tests.length > 0 && status !== 'error' && !removed && (
            <div className="mt-2 flex flex-wrap gap-1">
              {tests.map((t) => {
                const on = testsCovered.includes(t);
                return (
                  <button key={t} type="button" onClick={() => onToggleTest(t)} className={`px-2 py-0.5 rounded-full text-[11px] font-medium border transition-colors ${on ? 'bg-primary-50 border-primary-200 text-primary-700' : 'bg-surface border-border text-slate-400 hover:border-slate-300'}`}>{t}</button>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-0.5">
          {onDownload && (
            <button type="button" onClick={onDownload} className="p-1.5 rounded-lg text-slate-400 hover:text-primary-600 hover:bg-primary-50 transition-colors" title="Download">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg>
            </button>
          )}
          <button type="button" onClick={onRemove} className={`p-1.5 rounded-lg transition-colors ${removed ? 'text-primary-600 hover:bg-primary-50' : 'text-slate-400 hover:text-danger hover:bg-red-50'}`} title={isNew ? 'Remove' : removed ? 'Keep file' : 'Mark for removal'}>
            {removed ? (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" /></svg>
            ) : (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
