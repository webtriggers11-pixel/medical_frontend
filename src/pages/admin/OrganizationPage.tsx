import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useCompanies } from '../../features/company/hooks/useCompanies';
import {
  useZones, useCities,
  useStores, useCreateStore, useDeleteStore,
} from '../../features/org/hooks/useOrg';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Modal } from '../../components/ui/Modal';
import { SkeletonTable } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { getApiErrorMessage } from '../../lib/apiError';
import type { Zone, City, Store } from '../../types/org.types';

const PlusIcon = (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
  </svg>
);

const ChevronRight = (
  <svg className="w-4 h-4 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
  </svg>
);

// ── Zones panel (global master, browse only) ─────────────────────

function ZonesPanel({ onSelect, selectedZoneId }: {
  onSelect: (z: Zone) => void;
  selectedZoneId: string;
}) {
  const { data: zones, isLoading } = useZones();

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-slate-900">Zones</h3>
        <a href="/admin/zones" className="text-xs text-primary-600 hover:underline">Manage →</a>
      </div>

      {isLoading && <SkeletonTable rows={3} />}

      <div className="space-y-1">
        {zones?.map((z) => (
          <div
            key={z.id}
            onClick={() => onSelect(z)}
            className={`flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${
              selectedZoneId === z.id ? 'bg-primary-50 text-primary-700' : 'hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center gap-2 min-w-0">
              <span className="font-medium text-sm truncate">{z.name}</span>
              <Badge variant={z.status === 'ACTIVE' ? 'success' : 'default'} size="sm">{z.status.toLowerCase()}</Badge>
            </div>
            {ChevronRight}
          </div>
        ))}
        {zones?.length === 0 && !isLoading && (
          <p className="text-sm text-slate-500 py-2">No zones yet. <a href="/admin/zones" className="text-primary-600 hover:underline">Add zones →</a></p>
        )}
      </div>
    </Card>
  );
}

// ── Cities panel (global master for selected zone, browse only) ──

function CitiesPanel({ zone, onSelect, selectedCityId }: {
  zone: Zone;
  onSelect: (c: City) => void;
  selectedCityId: string;
}) {
  const { data: cities, isLoading } = useCities(zone.id);

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-xs text-slate-500 mb-0.5">Zone</p>
          <h3 className="font-semibold text-slate-900">{zone.name}</h3>
        </div>
        <a href="/admin/cities" className="text-xs text-primary-600 hover:underline">Manage →</a>
      </div>

      {isLoading && <SkeletonTable rows={3} />}

      <div className="space-y-1">
        {cities?.map((c) => (
          <div
            key={c.id}
            onClick={() => onSelect(c)}
            className={`flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${
              selectedCityId === c.id ? 'bg-primary-50 text-primary-700' : 'hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center gap-2 min-w-0">
              <span className="font-medium text-sm truncate">{c.name}</span>
              <Badge variant={c.status === 'ACTIVE' ? 'success' : 'default'} size="sm">{c.status.toLowerCase()}</Badge>
            </div>
            {ChevronRight}
          </div>
        ))}
        {cities?.length === 0 && !isLoading && (
          <p className="text-sm text-slate-500 py-2">No cities in this zone. <a href="/admin/cities" className="text-primary-600 hover:underline">Add cities →</a></p>
        )}
      </div>
    </Card>
  );
}

// ── Stores panel (company-scoped stores in the selected city) ────

interface StoreFormValues {
  storeCode: string;
  name: string;
  address: string;
  storeHeadName: string;
  storeHeadMobile: string;
  email: string;
}

function StoresPanel({ city, companyId }: { city: City; companyId: string }) {
  const { data: stores, isLoading } = useStores(city.id);
  const createStore = useCreateStore();
  const deleteStore = useDeleteStore(city.id);
  const [addOpen, setAddOpen] = useState(false);
  const [apiError, setApiError] = useState('');
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<StoreFormValues>();

  const companyStores = stores?.filter((s: Store) => s.companyId === companyId);

  const onSubmit = async (values: StoreFormValues) => {
    setApiError('');
    try {
      await createStore.mutateAsync({
        ...values,
        companyId,
        cityId: city.id,
        email: values.email || undefined,
      });
      reset();
      setAddOpen(false);
    } catch (err) { setApiError(getApiErrorMessage(err)); }
  };

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-xs text-slate-500 mb-0.5">City</p>
          <h3 className="font-semibold text-slate-900">{city.name}</h3>
        </div>
        <Button size="sm" icon={PlusIcon} onClick={() => setAddOpen(true)}>Add store</Button>
      </div>

      {isLoading && <SkeletonTable rows={3} />}

      <div className="space-y-2">
        {companyStores?.map((s: Store) => (
          <div key={s.id} className="group flex items-start justify-between p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
            <div className="min-w-0">
              <p className="font-medium text-sm text-slate-900">{s.name}</p>
              <p className="text-xs text-slate-500">{s.storeCode} &middot; {s.storeHeadName}</p>
              <p className="text-xs text-slate-400 mt-0.5 truncate max-w-[200px]">{s.address}</p>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <Badge variant={s.status === 'ACTIVE' ? 'success' : 'default'} size="sm">{s.status.toLowerCase()}</Badge>
              <button
                onClick={() => deleteStore.mutate(s.id)}
                className="text-slate-400 hover:text-red-500 p-1 rounded opacity-0 group-hover:opacity-100 transition-all ml-1"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        ))}
        {companyStores?.length === 0 && !isLoading && (
          <p className="text-sm text-slate-500 py-2">No stores for this company in {city.name}.</p>
        )}
      </div>

      <Modal
        open={addOpen}
        onClose={() => { reset(); setAddOpen(false); }}
        title="Add store"
        size="lg"
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button type="submit" form="store-form" loading={isSubmitting}>Add store</Button>
          </div>
        }
      >
        <form id="store-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {apiError && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{apiError}</p>}
          <div className="grid grid-cols-2 gap-4">
            <Input label="Store code" required {...register('storeCode', { required: 'Required' })} error={errors.storeCode?.message} />
            <Input label="Store name" required {...register('name', { required: 'Required' })} error={errors.name?.message} />
          </div>
          <Input label="Address" required {...register('address', { required: 'Required' })} error={errors.address?.message} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Store head name" required {...register('storeHeadName', { required: 'Required' })} error={errors.storeHeadName?.message} />
            <Input
              label="Store head mobile"
              required
              {...register('storeHeadMobile', { required: 'Required', pattern: { value: /^\d{10}$/, message: 'Must be 10 digits' } })}
              error={errors.storeHeadMobile?.message}
            />
          </div>
          <Input label="Email" type="email" {...register('email')} />
        </form>
      </Modal>
    </Card>
  );
}

// ── Main page ─────────────────────────────────────────────────────

export function OrganizationPage() {
  const { data: companies } = useCompanies();
  const [selectedCompanyId, setSelectedCompanyId] = useState('');
  const [selectedZone, setSelectedZone] = useState<Zone | null>(null);
  const [selectedCity, setSelectedCity] = useState<City | null>(null);

  const companyOptions = companies?.map((c) => ({ value: c.id, label: c.name })) ?? [];

  const handleCompanyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCompanyId(e.target.value);
    setSelectedZone(null);
    setSelectedCity(null);
  };

  const handleZoneSelect = (z: Zone) => {
    setSelectedZone(z);
    setSelectedCity(null);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Organization</h1>
        <p className="text-slate-500 mt-1">
          Browse zones and cities to view and manage a company's stores
        </p>
      </div>

      <div className="max-w-sm">
        <Select
          label="Select company"
          options={companyOptions}
          placeholder="Choose a company..."
          value={selectedCompanyId}
          onChange={handleCompanyChange}
        />
      </div>

      {!selectedCompanyId ? (
        <Card>
          <EmptyState
            icon={
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
              </svg>
            }
            title="Select a company"
            description="Choose a company to view its stores by zone and city."
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <ZonesPanel onSelect={handleZoneSelect} selectedZoneId={selectedZone?.id ?? ''} />
          {selectedZone && (
            <CitiesPanel zone={selectedZone} onSelect={setSelectedCity} selectedCityId={selectedCity?.id ?? ''} />
          )}
          {selectedCity && (
            <StoresPanel city={selectedCity} companyId={selectedCompanyId} />
          )}
        </div>
      )}
    </div>
  );
}
