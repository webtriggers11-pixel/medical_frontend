import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import {
  useZones, useCities, useStoresPage,
  useUpdateStore, useDeleteStore,
} from '../../features/org/hooks/useOrg';
import { useAuthStore } from '../../store/auth.store';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Combobox } from '../../components/ui/Combobox';
import { Modal } from '../../components/ui/Modal';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { SearchInput } from '../../components/ui/SearchInput';
import { SkeletonTable } from '../../components/ui/Skeleton';
import { BusyOverlay } from '../../components/ui/BusyOverlay';
import { EmptyState } from '../../components/ui/EmptyState';
import { Pagination } from '../../components/ui/Pagination';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import { getApiErrorMessage } from '../../lib/apiError';
import type { StoreWithLocation } from '../../types/org.types';

const PlusIcon = (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
  </svg>
);

const StoreIcon = (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.015a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.75c0 .415.336.75.75.75z" />
  </svg>
);

type StoreFormValues = {
  name: string;
  storeCode: string;
  address: string;
  storeHeadName: string;
  storeHeadMobile: string;
  email: string;
  cityId: string;
};

function StoreModal({
  open, onClose, editing,
}: {
  open: boolean; onClose: () => void; editing: StoreWithLocation | null;
}) {
  const { data: zones, isLoading: zonesLoading } = useZones();
  const [modalZoneId, setModalZoneId] = useState(editing?.city?.zoneId ?? '');
  const { data: modalCities, isLoading: citiesLoading } = useCities(modalZoneId);

  const updateStore = useUpdateStore();
  const [apiError, setApiError] = useState('');

  const { register, control, handleSubmit, reset, setValue, formState: { errors, isSubmitting } } = useForm<StoreFormValues>({
    defaultValues: editing ? {
      name: editing.name,
      storeCode: editing.storeCode,
      address: editing.address,
      storeHeadName: editing.storeHeadName,
      storeHeadMobile: editing.storeHeadMobile,
      email: editing.email ?? '',
      cityId: editing.cityId,
    } : {},
  });

  const zoneOptions = zones?.map((z) => ({ value: z.id, label: z.name })) ?? [];
  const cityOptions = modalCities?.map((c) => ({ value: c.id, label: c.name })) ?? [];

  const handleClose = () => { reset(); setApiError(''); onClose(); };

  const onSubmit = async (values: StoreFormValues) => {
    if (!editing) return;
    setApiError('');
    try {
      await updateStore.mutateAsync({
        id: editing.id,
        input: {
          name: values.name,
          storeCode: values.storeCode,
          address: values.address,
          storeHeadName: values.storeHeadName,
          storeHeadMobile: values.storeHeadMobile,
          email: values.email || undefined,
          cityId: values.cityId,
        },
      });
      handleClose();
    } catch (err) { setApiError(getApiErrorMessage(err)); }
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Edit store"
      footer={
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={handleClose}>Cancel</Button>
          <Button type="submit" form="store-form" loading={isSubmitting}>Save changes</Button>
        </div>
      }
    >
      <form id="store-form" onSubmit={handleSubmit(onSubmit)}>
        <fieldset disabled={isSubmitting} className="space-y-4">
        {apiError && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{apiError}</p>}

        {/* Client — read-only, cannot be reassigned */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Client</label>
          <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-sm text-slate-500 cursor-not-allowed">
            <svg className="w-4 h-4 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
            </svg>
            <span className="font-medium text-slate-700">
              {editing?.client?.name ?? editing?.client?.email ?? '—'}
            </span>
            {editing?.client?.name && (
              <span className="text-slate-400 text-xs">{editing.client.email}</span>
            )}
            <span className="ml-auto text-xs text-slate-400 italic">cannot change</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Combobox
            label="Zone"
            required
            options={zoneOptions}
            placeholder="Select zone..."
            searchPlaceholder="Search zones..."
            value={modalZoneId}
            onChange={(v) => {
              setModalZoneId(v);
              setValue('cityId', '');
            }}
            loading={zonesLoading}
          />
          <Controller
            name="cityId"
            control={control}
            rules={{ required: 'Required' }}
            render={({ field }) => (
              <Combobox
                label="City"
                required
                options={cityOptions}
                placeholder={modalZoneId ? 'Select city...' : 'Select zone first'}
                searchPlaceholder="Search cities..."
                disabled={!modalZoneId}
                value={field.value ?? ''}
                onChange={field.onChange}
                error={errors.cityId?.message}
                loading={citiesLoading}
              />
            )}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
          placeholder="store@example.com (optional)"
          {...register('email')}
        />
        </fieldset>
      </form>
    </Modal>
  );
}

export function StoresPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const navState = location.state as { zoneId?: string; cityId?: string } | null;
  const currentUser = useAuthStore((s) => s.user);
  const isAdmin = currentUser?.role === 'ADMIN';

  const deleteStore = useDeleteStore();

  // Filters default to empty (show all). After creating a store we arrive with
  // navState so the user immediately sees that store's city.
  const [selectedZoneId, setSelectedZoneId] = useState(navState?.zoneId ?? '');
  const [selectedCityId, setSelectedCityId] = useState(navState?.cityId ?? '');
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search, 300);
  const [page, setPage] = useState(1);
  // Reset to page 1 whenever any filter/search changes.
  useEffect(() => setPage(1), [debouncedSearch, selectedZoneId, selectedCityId]);
  const [editing, setEditing] = useState<StoreWithLocation | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<StoreWithLocation | null>(null);

  const goToAddStore = () => navigate(isAdmin ? '/admin/stores/new' : '/stores/new');

  // Server-paginated + server-filtered store list.
  const { data, isLoading, isFetching, error } = useStoresPage({
    page,
    limit: 10,
    search: debouncedSearch,
    zoneId: selectedZoneId || undefined,
    cityId: selectedCityId || undefined,
  });
  const pageItems = data?.items ?? [];
  const totalPages = data?.meta.totalPages ?? 1;
  const total = data?.meta.total ?? 0;

  // Filter dropdowns come from dedicated endpoints, not derived from the list.
  const { data: zones } = useZones();
  const { data: cities } = useCities(selectedZoneId);
  const zoneOptions = useMemo(() => (zones ?? []).map((z) => ({ value: z.id, label: z.name })), [zones]);
  const cityOptions = useMemo(() => (cities ?? []).map((c) => ({ value: c.id, label: c.name })), [cities]);

  const hasFilters = !!selectedZoneId || !!selectedCityId || !!search;
  const clearFilters = () => { setSelectedZoneId(''); setSelectedCityId(''); setSearch(''); };

  const handleEdit = (s: StoreWithLocation) => setEditing(s);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Stores</h1>
          <p className="text-slate-500 mt-1">
            All your stores
            {data && (
              <span className="text-slate-400">
                {' '}&middot; {total} {total === 1 ? 'store' : 'stores'}{hasFilters ? ' matching' : ''}
              </span>
            )}
          </p>
        </div>
        <Button icon={PlusIcon} onClick={goToAddStore}>Add store</Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-end gap-3">
        <div className="w-full sm:w-52">
          <Combobox
            label="Zone"
            options={zoneOptions}
            placeholder="All zones"
            searchPlaceholder="Search zones..."
            emptyText="No zones"
            value={selectedZoneId}
            onChange={(v) => { setSelectedZoneId(v); setSelectedCityId(''); }}
            loading={isLoading}
          />
        </div>
        <div className="w-full sm:w-52">
          <Combobox
            label="City"
            options={cityOptions}
            placeholder="All cities"
            searchPlaceholder="Search cities..."
            emptyText={selectedZoneId ? 'No cities in this zone' : 'No cities'}
            value={selectedCityId}
            onChange={setSelectedCityId}
            loading={isLoading}
          />
        </div>
        <SearchInput
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onClear={() => setSearch('')}
          placeholder="Search by name or code..."
          className="w-full sm:w-60"
        />
        {hasFilters && (
          <Button variant="ghost" onClick={clearFilters}>Clear filters</Button>
        )}
      </div>

      {isLoading && <SkeletonTable rows={5} />}

      {error && (
        <Card>
          <p className="text-sm text-red-600 font-medium">Failed to load stores. Please try again.</p>
        </Card>
      )}

      {!isLoading && !error && !hasFilters && pageItems.length === 0 && (
        <Card>
          <EmptyState
            icon={StoreIcon}
            title="No stores yet"
            description="Add your first store to get started."
            action={<Button size="sm" icon={PlusIcon} onClick={goToAddStore}>Add store</Button>}
          />
        </Card>
      )}

      {pageItems.length > 0 && (
        <div className="relative">
          <BusyOverlay show={isFetching && !isLoading} />
          <Card padding="none">
          <div className="overflow-x-auto">
            <table className="w-full text-sm whitespace-nowrap">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">ID</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Store</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Code</th>
                  {isAdmin && <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Client</th>}
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">City / Zone</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Address</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Store Head</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Created</th>
                  <th className="px-5 py-3.5" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {pageItems.map((s) => (
                  <tr key={s.id} className="group hover:bg-slate-50/70 transition-colors">
                    <td className="px-5 py-3.5">
                      <span className="text-xs font-mono font-semibold text-slate-400">{s.storeId ?? '—'}</span>
                    </td>
                    <td className="px-5 py-3.5 font-medium text-slate-900">{s.name}</td>
                    <td className="px-5 py-3.5 text-slate-500 font-mono text-xs">{s.storeCode}</td>
                    {isAdmin && (
                      <td className="px-5 py-3.5 text-slate-600">
                        <div className="font-medium">{s.client?.name ?? '—'}</div>
                        <div className="text-xs text-slate-400">{s.client?.email}</div>
                      </td>
                    )}
                    <td className="px-5 py-3.5 text-slate-600">
                      <div>{s.city?.name ?? '—'}</div>
                      <div className="text-xs text-slate-400">{s.city?.zone?.name ?? '—'}</div>
                    </td>
                    <td className="px-5 py-3.5 text-slate-600">
                      <div className="min-w-[280px] max-w-[360px] whitespace-normal leading-snug">{s.address || '—'}</div>
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
                    {isAdmin && (
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="sm" onClick={() => handleEdit(s)}>Edit</Button>
                          <Button variant="ghost" size="sm" onClick={() => setDeleteTarget(s)}>Delete</Button>
                        </div>
                      </td>
                    )}
                    {!isAdmin && <td className="px-5 py-3.5" />}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div className="flex justify-end px-5 py-3 border-t border-border">
              <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
            </div>
          )}
          </Card>
        </div>
      )}

      {!isLoading && hasFilters && pageItems.length === 0 && (
        <Card>
          <EmptyState
            icon={StoreIcon}
            title="No stores match your filters"
            description="Try a different zone, city, or search term."
            action={<Button size="sm" variant="outline" onClick={clearFilters}>Clear filters</Button>}
          />
        </Card>
      )}

      {isAdmin && (
        <>
          <StoreModal
            key={editing?.id ?? 'closed'}
            open={!!editing}
            onClose={() => setEditing(null)}
            editing={editing}
          />

          <ConfirmDialog
            open={!!deleteTarget}
            onClose={() => setDeleteTarget(null)}
            loading={deleteStore.isPending}
            title="Delete store"
            confirmLabel="Delete store"
            message={<>Delete <strong>{deleteTarget?.name}</strong>? This cannot be undone.</>}
            onConfirm={() => {
              if (!deleteTarget) return;
              deleteStore.mutate(deleteTarget.id, { onSuccess: () => setDeleteTarget(null) });
            }}
          />
        </>
      )}
    </div>
  );
}
