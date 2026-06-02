import { reportService } from '../../../services/report.service';

/** Minimal shape needed to fetch a fresh URL and name a download. */
export interface DownloadableFile {
  id: string;
  fileName: string;
}

/** Open a (pre-signed) URL for download/view via a transient anchor. */
export function triggerDownload(url: string, name: string) {
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.target = '_blank';
  a.rel = 'noreferrer';
  document.body.appendChild(a);
  a.click();
  a.remove();
}

/** Resolve a fresh pre-signed URL for the file, then download/open it. */
export async function downloadReportFile(file: DownloadableFile) {
  const url = await reportService.getFileUrl(file.id);
  triggerDownload(url, file.fileName);
}

/** Download several files, lightly staggered so the browser doesn't block them. */
export async function downloadReportFiles(files: DownloadableFile[]) {
  for (const f of files) {
    try {
      const url = await reportService.getFileUrl(f.id);
      triggerDownload(url, f.fileName);
    } catch {
      /* skip files that fail to resolve */
    }
    await new Promise((r) => setTimeout(r, 350));
  }
}
