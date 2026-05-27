import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useCompanies } from '../../features/company/hooks/useCompanies';
import {
  useZones, useCities, useStores,
  useCreateStore, useUpdateStore, useDeleteStore,
} from '../../features/org/hooks/useOrg';
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
import type { Store, CreateStoreInput } from '../../types/org.types';

const PlusIcon = (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
  </svg>
);

type StoreFormValues = {
  name: string;
  storeCode: string;
  address: string;
  storeHeadName: string;
  storeHeadMobile: string;
  email: string;
  companyId: string;
  zoneId: string;
  cityId: string;
};

function StoreModal({
  open, onClose, filterCityId, editing,
}: {
  open: boolean; onClose: () => void; filterCityId: string; editing: Store | null;
}) {
  const { data: companies } = useCompanies();
  const { data: zones } = useZones();
  const [modalZoneId, setModalZoneId] = useState(editing?.cityId ? '' : '');
  const { data: modalCities } = useCities(modalZoneId);

  const createStore = useCreateStore();
  const updateStore = useUpdateStore(filterCityId);
  const [apiError, setApiError] = useState('');

  const { register, handleSubmit, reset, watch, setValue, formState: { errors, isSubmitting } } = useForm<StoreFormValues>({
    defaultValues: editing ? {
      name: editing.name,
      storeCode: editing.storeCode,
      address: editing.address,
      storeHeadName: editing.storeHeadName,
      storeHeadMobile: editing.storeHeadMobile,
      email: editing.email ?? '',
      companyId: editing.companyId,
      cityId: editing.cityId,
    } : {},
  });

  const companyOptions = companies?.map((c) => ({ value: c.id, label: c.name })) ?? [];
  const zoneOptions = zones?.map((z) => ({ value: z.id, label: z.name })) ?? [];
  const cityOptions = modalCities?.map((c) => ({ value: c.id, label: c.name })) ?? [];

  const handleClose = () => { reset(); setApiError(''); setModalZoneId(''); onClose(); };

  const onSubmit = async (values: StoreFormValues) => {
    setApiError('');
    try {
      if (editing) {
        await updateStore.mutateAsync({
          id: editing.id,
          input: {
            name: values.name,
            storeCode: values.storeCode,
            address: values.address,
            storeHeadName: values.storeHeadName,
            storeHeadMobile: values.storeHeadMobile,
            email: values.email || undefined,
            companyId: values.companyId,
            cityId: values.cityId,
          },
        });
      } else {
        const payload: CreateStoreInput = {
          companyId: values.companyId,
          cityId: values.cityId,
          name: values.name,
          storeCode: values.storeCode,
          address: values.address,
          storeHeadName: values.storeHeadName,
          storeHeadMobile: values.storeHeadMobile,
          email: values.email || undefined,
        };
        await createStore.mutateAsync(payload);
      }
      handleClose();
    } catch (err) { setApiError(getApiErrorMessage(err)); }
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={editing ? 'Edit store' : 'Add store'}
      footer={
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={handleClose}>Cancel</Button>
          <Button type="submit" form="store-form" loading={isSubmitting}>
            {editing ? 'Save changes' : 'Add store'}
          </Button>
        </div>
      }
    >
      <form id="store-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {apiError && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{apiError}</p>}

        <Select
          label="Company"
          required
          options={companyOptions}
          placeholder="Select company..."
          {...register('companyId', { required: 'Required' })}
          error={errors.companyId?.message}
        />

        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Zone"
            required
            options={zoneOptions}
            placeholder="Select zone..."
            value={modalZoneId}
            onChange={(e) => {
              setModalZoneId(e.target.value);
              setValue('cityId', '');
            }}
          />
          <Select
            label="City"
            required
            options={cityOptions}
            placeholder={modalZoneId ? 'Select city...' : 'Select zone first'}
            {...register('cityId', { required: 'Required' })}
            error={errors.cityId?.message}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Store name"
            required
            placeholder="e.g. Andheri Branch"
            {...register('name', { required: 'Required' })}
            error={errors.name?.message}
          />
          <Input
            label="Store code"
            required
            placeholder="e.g. MUM-AND-001"
            {...register('storeCode', { required: 'Required' })}
            error={errors.storeCode?.message}
          />
        </div>
        <Input
          label="Address"
          required
          placeholder="Full store address"
          {...register('address', { required: 'Required' })}
          error={errors.address?.message}
        />
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Store head name"
            required
            placeholder="e.g. Rahul Sharma"
            {...register('storeHeadName', { required: 'Required' })}
            error={errors.storeHeadName?.message}
          />
          <Input
            label="Store head mobile"
            required
            placeholder="e.g. 9876543210"
            {...register('storeHeadMobile', { required: 'Required' })}
            error={errors.storeHeadMobile?.message}
          />
        </div>
        <Input
          label="Email"
          type="email"
          placeholder="store@company.com (optional)"
          {...register('email')}
        />
      </form>
    </Modal>
  );
}

export function StoresPage() {
  const { data: zones } = useZones();
  const [selectedZoneId, setSelectedZoneId] = useState('');
  const [selectedCityId, setSelectedCityId] = useState('');
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Store | null>(null);

  const { data: cities } = useCities(selectedZoneId);
  const { data: stores, isLoading, error } = useStores(selectedCityId);
  const deleteStore = useDeleteStore(selectedCityId);

  const zoneOptions = zones?.map((z) => ({ value: z.id, label: z.name })) ?? [];
  const cityOptions = cities?.map((c) => ({ value: c.id, label: c.name })) ?? [];

  const selectedCity = cities?.find((c) => c.id === selectedCityId);
  const selectedZone = zones?.find((z) => z.id === selectedZoneId);

  const filtered = stores?.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.storeCode.toLowerCase().includes(search.toLowerCase())
  );

  const handleEdit = (s: Store) => { setEditing(s); setModalOpen(true); };
  const handleClose = () => { setEditing(null); setModalOpen(false); };

  const handleZoneChange = (id: string) => {
    setSelectedZoneId(id);
    setSelectedCityId('');
    setSearch('');
  };

  const canShowTable = !!selectedCityId;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Stores</h1>
          <p className="text-slate-500 mt-1">
            Stores by city
            {stores && selectedCityId && (
              <span className="text-slate-400"> &middot; {stores.length} total</span>
            )}
          </p>
        </div>
        {selectedCityId && (
          <Button icon={PlusIcon} onClick={() => setModalOpen(true)}>Add store</Button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-end gap-4">
        <div className="w-56">
          <Select
            label="Zone"
            options={zoneOptions}
            placeholder="Select a zone..."
            value={selectedZoneId}
            onChange={(e) => handleZoneChange(e.target.value)}
          />
        </div>
        {selectedZoneId && (
          <div className="w-56">
            <Select
              label="City"
              options={cityOptions}
              placeholder="Select a city..."
              value={selectedCityId}
              onChange={(e) => { setSelectedCityId(e.target.value); setSearch(''); }}
            />
          </div>
        )}
        {selectedCityId && (
          <SearchInput
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onClear={() => setSearch('')}
            placeholder="Search stores..."
            className="w-56"
          />
        )}
      </div>

      {!selectedZoneId && (
        <Card>
          <EmptyState
            icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.015a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.75c0 .415.336.75.75.75z" /></svg>}
            title="Select a zone"
            description="Choose a zone, then a city to view stores."
          />
        </Card>
      )}

      {selectedZoneId && !selectedCityId && (
        <Card>
          <EmptyState
            icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" /></svg>}
            title="Select a city"
            description="Choose a city to view and manage its stores."
          />
        </Card>
      )}

      {canShowTable && isLoading && <SkeletonTable rows={4} />}

      {canShowTable && error && (
        <Card>
          <p className="text-sm text-red-600 font-medium">Failed to load stores. Please try again.</p>
        </Card>
      )}

      {filtered && filtered.length > 0 && (
        <Card padding="none">
          <div className="overflow-x-auto">
            <table className="w-full text-sm whitespace-nowrap">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Store</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Code</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">City / Zone</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Store Head</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Created</th>
                  <th className="px-5 py-3.5" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((s) => (
                  <tr key={s.id} className="group hover:bg-slate-50/70 transition-colors">
                    <td className="px-5 py-3.5 font-medium text-slate-900">{s.name}</td>
                    <td className="px-5 py-3.5 text-slate-500 font-mono text-xs">{s.storeCode}</td>
                    <td className="px-5 py-3.5 text-slate-600">
                      <div>{selectedCity?.name ?? '—'}</div>
                      <div className="text-xs text-slate-400">{selectedZone?.name}</div>
                    </td>
                    <td className="px-5 py-3.5 text-slate-600">
                      <div>{s.storeHeadName}</div>
                      <div className="text-xs text-slate-400">{s.storeHeadMobile}</div>
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge variant={s.status === 'ACTIVE' ? 'success' : 'default'} size="sm">
                        {s.status.toLowerCase()}
                      </Badge>
                    </td>
                    <td className="px-5 py-3.5 text-slate-500 text-xs">
                      {new Date(s.createdAt).toLocaleDateString('en-IN')}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(s)}>Edit</Button>
                        <Button variant="ghost" size="sm" onClick={() => deleteStore.mutate(s.id)}>Delete</Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {filtered?.length === 0 && canShowTable && (
        <Card>
          <EmptyState
            icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.015a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.75c0 .415.336.75.75.75z" /></svg>}
            title={search ? 'No stores found' : 'No stores yet'}
            description={search ? `No results for "${search}"` : 'Add the first store for this city.'}
            action={!search ? <Button size="sm" icon={PlusIcon} onClick={() => setModalOpen(true)}>Add store</Button> : undefined}
          />
        </Card>
      )}

      <StoreModal
        open={modalOpen}
        onClose={handleClose}
        filterCityId={selectedCityId}
        editing={editing}
      />
    </div>
  );
}
