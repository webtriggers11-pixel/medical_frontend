import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useCompanies, useCreateCompany, useUpdateCompany, useDeleteCompany } from '../../features/company/hooks/useCompanies';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Modal } from '../../components/ui/Modal';
import { SearchInput } from '../../components/ui/SearchInput';
import { SkeletonTable } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { getApiErrorMessage } from '../../lib/apiError';
import type { Company, CreateCompanyInput, CheckupFrequency } from '../../types/company.types';

const FREQUENCY_OPTIONS = [
  { value: 'MONTHLY', label: 'Monthly' },
  { value: 'QUARTERLY', label: 'Quarterly' },
  { value: 'HALF_YEARLY', label: 'Half-yearly' },
  { value: 'YEARLY', label: 'Yearly' },
];

const PlusIcon = (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
  </svg>
);

interface CompanyFormValues {
  name: string;
  industryType: string;
  contactName: string;
  contactMobile: string;
  billingEmail: string;
  checkupFrequency: CheckupFrequency;
  gstNumber: string;
  code: string;
}

function CompanyModal({
  open,
  onClose,
  editing,
}: {
  open: boolean;
  onClose: () => void;
  editing: Company | null;
}) {
  const createCompany = useCreateCompany();
  const updateCompany = useUpdateCompany();
  const [apiError, setApiError] = useState('');

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<CompanyFormValues>({
    defaultValues: editing
      ? {
          name: editing.name,
          industryType: editing.industryType,
          contactName: editing.contactName,
          contactMobile: editing.contactMobile,
          billingEmail: editing.billingEmail,
          checkupFrequency: editing.checkupFrequency,
          gstNumber: editing.gstNumber ?? '',
          code: editing.code,
        }
      : { checkupFrequency: 'YEARLY' },
  });

  const handleClose = () => { reset(); setApiError(''); onClose(); };

  const onSubmit = async (values: CompanyFormValues) => {
    setApiError('');
    try {
      if (editing) {
        await updateCompany.mutateAsync({ id: editing.id, input: values });
      } else {
        const input: CreateCompanyInput = {
          name: values.name,
          industryType: values.industryType,
          contactName: values.contactName,
          contactMobile: values.contactMobile,
          billingEmail: values.billingEmail,
          checkupFrequency: values.checkupFrequency,
          gstNumber: values.gstNumber || undefined,
          code: values.code || undefined,
        };
        await createCompany.mutateAsync(input);
      }
      handleClose();
    } catch (err) {
      setApiError(getApiErrorMessage(err));
    }
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={editing ? 'Edit company' : 'Add company'}
      size="lg"
      footer={
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={handleClose}>Cancel</Button>
          <Button type="submit" form="company-form" loading={isSubmitting}>
            {editing ? 'Save changes' : 'Create company'}
          </Button>
        </div>
      }
    >
      <form id="company-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {apiError && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{apiError}</p>}
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Company name"
            required
            {...register('name', { required: 'Required' })}
            error={errors.name?.message}
          />
          <Input
            label="Company code"
            placeholder="Auto-generated if blank"
            {...register('code')}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Industry type"
            required
            {...register('industryType', { required: 'Required' })}
            error={errors.industryType?.message}
          />
          <Input
            label="GST number"
            {...register('gstNumber')}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Contact name"
            required
            {...register('contactName', { required: 'Required' })}
            error={errors.contactName?.message}
          />
          <Input
            label="Contact mobile"
            required
            {...register('contactMobile', {
              required: 'Required',
              pattern: { value: /^\d{10}$/, message: 'Must be 10 digits' },
            })}
            error={errors.contactMobile?.message}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Billing email"
            type="email"
            required
            {...register('billingEmail', { required: 'Required' })}
            error={errors.billingEmail?.message}
          />
          <Select
            label="Checkup frequency"
            required
            options={FREQUENCY_OPTIONS}
            {...register('checkupFrequency', { required: 'Required' })}
            error={errors.checkupFrequency?.message}
          />
        </div>
      </form>
    </Modal>
  );
}

export function CompaniesPage() {
  const { data: companies, isLoading, error } = useCompanies();
  const deleteCompany = useDeleteCompany();
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Company | null>(null);

  const filtered = companies?.filter((c) => {
    const q = search.toLowerCase();
    return c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q) || c.industryType.toLowerCase().includes(q);
  });

  const handleEdit = (c: Company) => { setEditing(c); setModalOpen(true); };
  const handleClose = () => { setEditing(null); setModalOpen(false); };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Companies</h1>
          <p className="text-slate-500 mt-1">
            Manage client companies
            {companies && <span className="text-slate-400"> &middot; {companies.length} total</span>}
          </p>
        </div>
        <Button icon={PlusIcon} onClick={() => setModalOpen(true)}>Add company</Button>
      </div>

      <SearchInput
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        onClear={() => setSearch('')}
        placeholder="Search companies..."
        className="w-full sm:w-72"
      />

      {isLoading && <SkeletonTable rows={5} />}

      {error && (
        <Card>
          <p className="text-sm text-red-600 font-medium">Failed to load companies. Please try again.</p>
        </Card>
      )}

      {filtered && filtered.length > 0 && (
        <Card padding="none">
          <div className="overflow-x-auto">
            <table className="w-full text-sm whitespace-nowrap">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Company</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Industry</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Contact</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Frequency</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-5 py-3.5" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((c) => (
                  <tr key={c.id} className="group hover:bg-slate-50/70 transition-colors">
                    <td className="px-5 py-3.5">
                      <p className="font-medium text-slate-900">{c.name}</p>
                      <p className="text-xs text-slate-500">{c.code}</p>
                    </td>
                    <td className="px-5 py-3.5 text-slate-600">{c.industryType}</td>
                    <td className="px-5 py-3.5">
                      <p className="text-slate-800">{c.contactName}</p>
                      <p className="text-xs text-slate-500">{c.contactMobile}</p>
                    </td>
                    <td className="px-5 py-3.5 text-slate-600 capitalize">
                      {c.checkupFrequency.replace('_', ' ').toLowerCase()}
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge variant={c.status === 'ACTIVE' ? 'success' : 'default'} size="sm">
                        {c.status.toLowerCase()}
                      </Badge>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(c)}>Edit</Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteCompany.mutate(c.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {filtered?.length === 0 && (
        <Card>
          <EmptyState
            icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" /></svg>}
            title={search ? 'No companies found' : 'No companies yet'}
            description={search ? `No results for "${search}"` : 'Add your first company to get started.'}
            action={!search ? <Button size="sm" icon={PlusIcon} onClick={() => setModalOpen(true)}>Add company</Button> : undefined}
          />
        </Card>
      )}

      <CompanyModal open={modalOpen} onClose={handleClose} editing={editing} />
    </div>
  );
}
