import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '../../../components/ui/Button';
import { FilePreview } from './FilePreview';
import { downloadReportFile, downloadReportFiles } from '../lib/fileDownload';
import type { ReportFile } from '../../../types/report.types';

const fmtSize = (b?: number | null) =>
  !b ? '' : b < 1024 ? `${b} B` : b < 1048576 ? `${(b / 1024).toFixed(0)} KB` : `${(b / 1048576).toFixed(1)} MB`;

interface Props {
  open: boolean;
  onClose: () => void;
  candidateName: string;
  files: ReportFile[];
  initialIndex?: number;
}

/** Right-hand slide-over to preview a candidate's report files. */
export function ReportPreviewDrawer({ open, onClose, candidateName, files, initialIndex = 0 }: Props) {
  const [index, setIndex] = useState(initialIndex);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;
  const current = files[index] ?? files[0];

  return createPortal(
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div className="absolute right-0 top-0 h-full w-full max-w-2xl bg-surface shadow-xl flex flex-col animate-slide-over-right">
        {/* header */}
        <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-border">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Report preview</p>
            <p className="text-sm font-semibold text-slate-900 truncate">{candidateName}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors" aria-label="Close">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* body */}
        <div className="flex-1 min-h-0 flex flex-col gap-3 p-5">
          {files.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-sm text-slate-400">No report files.</div>
          ) : (
            <>
              {files.length > 1 && (
                <div className="flex flex-wrap gap-1.5">
                  {files.map((f, i) => (
                    <button
                      key={f.id}
                      onClick={() => setIndex(i)}
                      className={`px-2.5 py-1 rounded-full text-xs font-medium border max-w-[220px] truncate transition-colors ${i === index ? 'bg-primary-50 border-primary-200 text-primary-700' : 'bg-surface border-border text-slate-500 hover:border-slate-300'}`}
                      title={f.fileName}
                    >
                      {f.fileName}
                    </button>
                  ))}
                </div>
              )}
              <FilePreview
                key={current.id}
                name={current.fileName}
                fileId={current.id}
                heightClass="flex-1 min-h-0"
                onDownload={() => downloadReportFile(current)}
              />
            </>
          )}
        </div>

        {/* footer */}
        {files.length > 0 && (
          <div className="flex items-center justify-between gap-3 px-5 py-3 border-t border-border bg-slate-50/50">
            <p className="text-xs text-slate-400 truncate">{current?.fileName}{current?.fileSize ? ` · ${fmtSize(current.fileSize)}` : ''}</p>
            <div className="flex gap-2 shrink-0">
              {files.length > 1 && <Button size="sm" variant="outline" onClick={() => downloadReportFiles(files)}>Download all</Button>}
              <Button size="sm" onClick={() => downloadReportFile(current)}>Download</Button>
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}
