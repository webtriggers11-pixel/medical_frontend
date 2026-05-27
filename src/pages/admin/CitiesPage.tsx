import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useZones, useCities, useCreateCity, useUpdateCity, useDeleteCity } from '../../features/org/hooks/useOrg';
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
import type { City } from '../../types/org.types';

const PlusIcon = (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
  </svg>
);

function CityModal({
  open, onClose, zoneId, editing,
}: {
  open: boolean; onClose: () => void; zoneId: string; editing: City | null;
}) {
  const createCity = useCreateCity();
  const updateCity = useUpdateCity(zoneId);
  const [apiError, setApiError] = useState('');

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<{ name: string }>({
    defaultValues: editing ? { name: editing.name } : {},
  });

  const handleClose = () => { reset(); setApiError(''); onClose(); };

  const onSubmit = async ({ name }: { name: string }) => {
    setApiError('');
    try {
      if (editing) {
        await updateCity.mutateAsync({ id: editing.id, name });
      } else {
        await createCity.mutateAsync({ zoneId, name });
      }
      handleClose();
    } catch (err) { setApiError(getApiErrorMessage(err)); }
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={editing ? 'Edit city' : 'Add city'}
      footer={
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={handleClose}>Cancel</Button>
          <Button type="submit" form="city-form" loading={isSubmitting}>
            {editing ? 'Save changes' : 'Add city'}
          </Button>
        </div>
      }
    >
      <form id="city-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {apiError && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{apiError}</p>}
        <Input
          label="City name"
          required
          placeholder="e.g. Mumbai, Delhi, Pune"
          {...register('name', { required: 'Required' })}
          error={errors.name?.message}
        />
      </form>
    </Modal>
  );
}

export function CitiesPage() {
  const [selectedZoneId, setSelectedZoneId] = useState('');
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<City | null>(null);

  const { data: zones } = useZones();
  const { data: cities, isLoading, error } = useCities(selectedZoneId);
  const deleteCity = useDeleteCity(selectedZoneId);

  const zoneOptions = zones?.map((z) => ({ value: z.id, label: z.name })) ?? [];
  const selectedZone = zones?.find((z) => z.id === selectedZoneId);

  const filtered = cities?.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleEdit = (c: City) => { setEditing(c); setModalOpen(true); };
  const handleClose = () => { setEditing(null); setModalOpen(false); };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Cities</h1>
          <p className="text-slate-500 mt-1">
            City master list by zone
            {cities && selectedZoneId && (
              <span className="text-slate-400"> &middot; {cities.length} total</span>
            )}
          </p>
        </div>
        {selectedZoneId && (
          <Button icon={PlusIcon} onClick={() => setModalOpen(true)}>Add city</Button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-end gap-4">
        <div className="w-72">
          <Select
            label="Zone"
            options={zoneOptions}
            placeholder="Select a zone..."
            value={selectedZoneId}
            onChange={(e) => { setSelectedZoneId(e.target.value); setSearch(''); }}
          />
        </div>
        {selectedZoneId && (
          <SearchInput
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onClear={() => setSearch('')}
            placeholder="Search cities..."
            className="w-64"
          />
        )}
      </div>

      {!selectedZoneId && (
        <Card>
          <EmptyState
            icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z" /></svg>}
            title="Select a zone"
            description="Choose a zone to view and manage its cities."
          />
        </Card>
      )}

      {selectedZoneId && isLoading && <SkeletonTable rows={4} />}

      {selectedZoneId && error && (
        <Card>
          <p className="text-sm text-red-600 font-medium">Failed to load cities. Please try again.</p>
        </Card>
      )}

      {filtered && filtered.length > 0 && (
        <Card padding="none">
          <div className="overflow-x-auto">
            <table className="w-full text-sm whitespace-nowrap">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">City name</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Zone</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Created</th>
                  <th className="px-5 py-3.5" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((c) => (
                  <tr key={c.id} className="group hover:bg-slate-50/70 transition-colors">
                    <td className="px-5 py-3.5 font-medium text-slate-900">{c.name}</td>
                    <td className="px-5 py-3.5 text-slate-600">{selectedZone?.name ?? '—'}</td>
                    <td className="px-5 py-3.5">
                      <Badge variant={c.status === 'ACTIVE' ? 'success' : 'default'} size="sm">
                        {c.status.toLowerCase()}
                      </Badge>
                    </td>
                    <td className="px-5 py-3.5 text-slate-500 text-xs">
                      {new Date(c.createdAt).toLocaleDateString('en-IN')}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(c)}>Edit</Button>
                        <Button variant="ghost" size="sm" onClick={() => deleteCity.mutate(c.id)}>Delete</Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {filtered?.length === 0 && selectedZoneId && (
        <Card>
          <EmptyState
            icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" /></svg>}
            title={search ? 'No cities found' : 'No cities yet'}
            description={search ? `No results for "${search}"` : 'Add the first city for this zone.'}
            action={!search ? <Button size="sm" icon={PlusIcon} onClick={() => setModalOpen(true)}>Add city</Button> : undefined}
          />
        </Card>
      )}

      <CityModal
        open={modalOpen}
        onClose={handleClose}
        zoneId={selectedZoneId}
        editing={editing}
      />
    </div>
  );
}
