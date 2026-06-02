import { useEffect, useState } from 'react';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { Combobox } from '../../../components/ui/Combobox';
import { Input } from '../../../components/ui/Input';
import { Switch } from '../../../components/ui/Switch';
import { Avatar } from '../../../components/ui/Avatar';
import { getApiErrorMessage } from '../../../lib/apiError';
import { useUpdateReport } from '../hooks/useUploadReport';
import type { FitnessStatus, Report } from '../../../types/report.types';

const FITNESS_OPTIONS = [
  { value: 'FIT', label: 'Fit' },
  { value: 'UNFIT', label: 'Unfit' },
  { value: 'HOLD', label: 'Hold' },
];

const YES_NO = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' },
];

interface Props {
  open: boolean;
  onClose: () => void;
  report: Report;
  candidateName: string;
}

export function EditReportModal({ open, onClose, report, candidateName }: Props) {
  const updateReport = useUpdateReport();

  const [fitnessStatus, setFitnessStatus] = useState<FitnessStatus>(report.fitnessStatus);
  const [remarks, setRemarks] = useState(report.remarks ?? '');
  const [labInternalRef, setLabInternalRef] = useState(report.labInternalRef ?? '');
  const [isInsure, setIsInsure] = useState(report.isInsure ? 'yes' : 'no');
  const [approvalStatus, setApprovalStatus] = useState(report.approvalStatus);
  const [apiError, setApiError] = useState('');

  // Re-seed state whenever a different report is opened.
  useEffect(() => {
    setFitnessStatus(report.fitnessStatus);
    setRemarks(report.remarks ?? '');
    setLabInternalRef(report.labInternalRef ?? '');
    setIsInsure(report.isInsure ? 'yes' : 'no');
    setApprovalStatus(report.approvalStatus);
    setApiError('');
  }, [report.id]);

  const handleClose = () => {
    setApiError('');
    onClose();
  };

  const handleSubmit = async () => {
    setApiError('');
    try {
      await updateReport.mutateAsync({
        id: report.id,
        input: {
          fitnessStatus,
          remarks: remarks.trim() || undefined,
          labInternalRef: labInternalRef.trim() || undefined,
          isInsure: isInsure === 'yes',
          approvalStatus,
        },
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
      title={`Edit Report — ${candidateName}`}
      size="md"
      footer={
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={handleClose} disabled={updateReport.isPending}>
            Cancel
          </Button>
          <Button loading={updateReport.isPending} onClick={handleSubmit}>
            Save changes
          </Button>
        </div>
      }
    >
      <div className="space-y-5">
        {/* candidate pill */}
        <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-border">
          <Avatar name={candidateName} size="sm" />
          <div>
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Editing report for</p>
            <p className="text-sm font-semibold text-slate-900">{candidateName}</p>
          </div>
        </div>

        {apiError && (
          <div className="flex items-center gap-2 rounded-xl bg-red-50 border border-red-100 px-3 py-2.5 text-sm text-red-600">
            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
            {apiError}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Combobox
            label="Fitness Status"
            required
            options={FITNESS_OPTIONS}
            value={fitnessStatus}
            onChange={(v) => setFitnessStatus(v as FitnessStatus)}
            placeholder="Select…"
          />
          <Input
            label="Lab Internal Ref."
            placeholder="Reference no."
            value={labInternalRef}
            onChange={(e) => setLabInternalRef(e.target.value)}
          />
          <Combobox
            label="Is Insure"
            options={YES_NO}
            value={isInsure}
            onChange={setIsInsure}
            placeholder="Select…"
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
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Reason / Remarks
            </label>
            <textarea
              rows={3}
              placeholder="Reason for fitness status, observations, etc."
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
