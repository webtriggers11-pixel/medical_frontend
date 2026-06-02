import { useEffect, useState } from 'react';
import { reportService } from '../../../services/report.service';

const isImage = (name: string) => /\.(png|jpe?g|gif|webp)$/i.test(name);
const isPdf = (name: string) => /\.pdf$/i.test(name);

interface Props {
  name: string;
  /** Existing file id — a fresh (pre-signed) URL is fetched for it. */
  fileId?: string;
  /** Local blob URL for a not-yet-saved file. */
  localUrl?: string;
  onDownload?: () => void;
  /** Height/layout classes for the outer box (defaults to a fixed height). */
  heightClass?: string;
}

/** Inline preview for a report file — PDF in an iframe, images shown directly. */
export function FilePreview({ name, fileId, localUrl, onDownload, heightClass = 'h-[460px]' }: Props) {
  const [url, setUrl] = useState(localUrl ?? '');
  const [loading, setLoading] = useState(!!fileId && !localUrl);

  // Existing files need a fresh pre-signed URL; new files use a local blob URL.
  useEffect(() => {
    if (!fileId || localUrl) return;
    let cancelled = false;
    reportService
      .getFileUrl(fileId)
      .then((u) => { if (!cancelled) setUrl(u); })
      .catch(() => { if (!cancelled) setUrl(''); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [fileId, localUrl]);

  return (
    <div className={`rounded-xl border border-border bg-slate-50 overflow-hidden flex flex-col ${heightClass}`}>
      <div className="flex items-center justify-between gap-2 border-b border-border bg-white/70 px-3 py-2">
        <p className="text-xs font-medium text-slate-500 truncate">{name || 'Preview'}</p>
        {url && <a href={url} target="_blank" rel="noreferrer" className="text-xs font-semibold text-primary-600 hover:text-primary-700 shrink-0">Open in new tab</a>}
      </div>
      <div className="flex-1 min-h-0 flex items-center justify-center">
        {loading ? (
          <svg className="animate-spin h-6 w-6 text-primary-500" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
        ) : !url ? (
          <p className="text-sm text-slate-400 px-6 text-center">Preview unavailable.</p>
        ) : isPdf(name) ? (
          <iframe src={url} title="Report preview" className="w-full h-full" />
        ) : isImage(name) ? (
          <img src={url} alt={name} className="max-h-full max-w-full object-contain" />
        ) : (
          <div className="text-center px-6">
            <p className="text-sm text-slate-500">Preview isn’t available for this file type.</p>
            {onDownload && <button onClick={onDownload} className="mt-2 text-sm font-semibold text-primary-600 hover:text-primary-700">Download instead</button>}
          </div>
        )}
      </div>
    </div>
  );
}
