import { useRef, useState } from 'react';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Combobox } from '../../../components/ui/Combobox';
import { Switch } from '../../../components/ui/Switch';
import { Avatar } from '../../../components/ui/Avatar';
import { getApiErrorMessage } from '../../../lib/apiError';
import { useCreateReport, useUploadReportFiles } from '../hooks/useUploadReport';
import type { FitnessStatus, UploadedFile } from '../../../types/report.types';

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

type FileStatus = 'uploading' | 'done' | 'error';

interface PickedFile {
  key: string;
  name: string;
  size: number;
  status: FileStatus;
  uploaded?: UploadedFile;
  testsCovered: string[];
  error?: string;
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

interface Props {
  open: boolean;
  onClose: () => void;
  bookingId: string;
  candidateName: string;
  /** Tests bundled in the booking's panel — offered as "Uploaded for" tags. */
  tests: string[];
}

export function UploadReportModal({ open, onClose, bookingId, candidateName, tests }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const keySeq = useRef(0);

  const [files, setFiles] = useState<PickedFile[]>([]);
  const [fitnessStatus, setFitnessStatus] = useState<FitnessStatus | ''>('');
  const [labInternalRef, setLabInternalRef] = useState('');
  const [isInsure, setIsInsure] = useState('');
  const [approvalStatus, setApprovalStatus] = useState(false);
  const [remarks, setRemarks] = useState('');
  const [apiError, setApiError] = useState('');

  const uploadFiles = useUploadReportFiles();
  const createReport = useCreateReport();

  const reset = () => {
    setFiles([]);
    setFitnessStatus('');
    setLabInternalRef('');
    setIsInsure('');
    setApprovalStatus(false);
    setRemarks('');
    setApiError('');
    keySeq.current = 0;
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const patchFile = (key: string, patch: Partial<PickedFile>) =>
    setFiles((prev) => prev.map((f) => (f.key === key ? { ...f, ...patch } : f)));

  const handlePick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = Array.from(e.target.files ?? []);
    e.target.value = ''; // allow re-picking the same file
    if (!picked.length) return;
    setApiError('');

    const entries: PickedFile[] = picked.map((file) => ({
      key: `f${keySeq.current++}`,
      name: file.name,
      size: file.size,
      status: 'uploading',
      testsCovered: [...tests], // default: covers all tests in the panel
    }));
    setFiles((prev) => [...prev, ...entries]);

    // Upload each picked file independently so one failure doesn't sink the rest.
    await Promise.all(
      picked.map(async (file, i) => {
        const key = entries[i].key;
        try {
          const [uploaded] = await uploadFiles.mutateAsync([file]);
          patchFile(key, { status: 'done', uploaded });
        } catch (err) {
          patchFile(key, { status: 'error', error: getApiErrorMessage(err) });
        }
      }),
    );
  };

  const removeFile = (key: string) => setFiles((prev) => prev.filter((f) => f.key !== key));

  const toggleTest = (key: string, test: string) =>
    setFiles((prev) =>
      prev.map((f) =>
        f.key === key
          ? {
              ...f,
              testsCovered: f.testsCovered.includes(test)
                ? f.testsCovered.filter((t) => t !== test)
                : [...f.testsCovered, test],
            }
          : f,
      ),
    );

  const handleSubmit = async () => {
    const done = files.filter((f) => f.status === 'done' && f.uploaded);
    if (!files.length) return setApiError('Add at least one report file.');
    if (files.some((f) => f.status === 'uploading'))
      return setApiError('Please wait for files to finish uploading.');
    if (!done.length) return setApiError('No files uploaded successfully.');
    if (tests.length && done.some((f) => f.testsCovered.length === 0))
      return setApiError('Select what each file is uploaded for.');
    if (!fitnessStatus) return setApiError('Fitness status is required.');

    setApiError('');
    try {
      await createReport.mutateAsync({
        bookingId,
        fitnessStatus,
        files: done.map((f) => ({
          fileUrl: f.uploaded!.fileUrl,
          fileKey: f.uploaded!.fileKey,
          fileName: f.uploaded!.fileName,
          fileSize: f.uploaded!.fileSize,
          testsCovered: f.testsCovered,
        })),
        labInternalRef: labInternalRef.trim() || undefined,
        isInsure: isInsure === 'yes',
        approvalStatus,
        remarks: remarks.trim() || undefined,
      });
      handleClose();
    } catch (err) {
      setApiError(getApiErrorMessage(err));
    }
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={`Upload Report of ${candidateName}`}
      size="xl"
      footer={
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={handleClose} disabled={createReport.isPending}>
            Close
          </Button>
          <Button loading={createReport.isPending} onClick={handleSubmit}>
            Send
          </Button>
        </div>
      }
    >
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={ACCEPT}
        className="hidden"
        onChange={handlePick}
      />

      <div className="space-y-5">
        {/* candidate pill */}
        <div className="flex items-center gap-3 p-3 rounded-xl bg-primary-50 border border-primary-100">
          <Avatar name={candidateName} size="sm" />
          <div>
            <p className="text-xs text-primary-500 font-semibold uppercase tracking-wider">Uploading for</p>
            <p className="text-sm font-semibold text-primary-900">{candidateName}</p>
          </div>
        </div>

        {/* uploaded files */}
        {files.length > 0 && (
          <div className="space-y-3">
            {files.map((f) => (
              <FileRow
                key={f.key}
                file={f}
                tests={tests}
                onToggleTest={(t) => toggleTest(f.key, t)}
                onRemove={() => removeFile(f.key)}
              />
            ))}
          </div>
        )}

        <Button
          variant="secondary"
          icon={
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          }
          onClick={() => fileInputRef.current?.click()}
        >
          Select Multiple Files
        </Button>

        {apiError && (
          <div className="flex items-center gap-2 rounded-xl bg-red-50 border border-red-100 px-3 py-2.5 text-sm text-red-600">
            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
            {apiError}
          </div>
        )}

        {/* metadata fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          <Input
            label="Lab Internal Ref."
            placeholder="Reference no."
            value={labInternalRef}
            onChange={(e) => setLabInternalRef(e.target.value)}
          />
          <Combobox
            label="Is Insure"
            placeholder="Select…"
            options={YES_NO}
            value={isInsure}
            onChange={setIsInsure}
          />
          <div>
            <p className="block text-sm font-medium text-slate-700 mb-2">Approval Status</p>
            <div className="flex items-center gap-2 h-10">
              <Switch checked={approvalStatus} onChange={setApprovalStatus} label="Approval status" />
              <span className={`text-sm font-medium ${approvalStatus ? 'text-primary-600' : 'text-slate-400'}`}>
                {approvalStatus ? 'Approved' : 'Pending'}
              </span>
            </div>
          </div>
          <Combobox
            label="Fitness Status"
            required
            placeholder="Select…"
            options={FITNESS_OPTIONS}
            value={fitnessStatus}
            onChange={(v) => setFitnessStatus(v as FitnessStatus)}
          />
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Reason / Remarks
            </label>
            <textarea
              rows={3}
              placeholder="Optional — reason for fitness status, observations, etc."
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
            />
          </div>
        </div>
      </div>
    </Modal>
  );
}

/* ── single uploaded-file row ─────────────────────────────────── */

function FileRow({
  file,
  tests,
  onToggleTest,
  onRemove,
}: {
  file: PickedFile;
  tests: string[];
  onToggleTest: (test: string) => void;
  onRemove: () => void;
}) {
  return (
    <div className="rounded-xl border border-border bg-surface p-3.5">
      <div className="flex items-start gap-3">
        {/* file icon */}
        <span className="shrink-0 mt-0.5 flex h-9 w-9 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
          </svg>
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="truncate text-sm font-medium text-slate-800" title={file.name}>{file.name}</p>
            {file.status === 'uploading' && (
              <svg className="animate-spin h-3.5 w-3.5 text-primary-500 shrink-0" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            )}
          </div>
          <p className="text-xs text-slate-400">{formatSize(file.size)}</p>
          {file.status === 'error' && (
            <p className="text-xs text-danger font-medium mt-0.5">{file.error || 'Upload failed'}</p>
          )}

          {/* "Uploaded for" test tags */}
          {tests.length > 0 && file.status !== 'error' && (
            <div className="mt-2.5">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Uploaded for</p>
              <div className="flex flex-wrap gap-1.5">
                {tests.map((t) => {
                  const on = file.testsCovered.includes(t);
                  return (
                    <button
                      key={t}
                      type="button"
                      onClick={() => onToggleTest(t)}
                      className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
                        on
                          ? 'bg-primary-50 border-primary-200 text-primary-700'
                          : 'bg-surface border-border text-slate-400 hover:border-slate-300'
                      }`}
                    >
                      {t}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* actions */}
        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={onRemove}
            className="p-1.5 rounded-lg text-slate-400 hover:text-danger hover:bg-red-50 transition-colors"
            title="Remove"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
