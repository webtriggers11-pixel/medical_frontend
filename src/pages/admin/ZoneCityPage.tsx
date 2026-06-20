import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import {
  useZonesPage, useCreateZone, useUpdateZone, useDeleteZone,
  useCitiesPage, useCreateCity, useUpdateCity, useDeleteCity,
} from '../../features/org/hooks/useOrg';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { SearchInput } from '../../components/ui/SearchInput';
import { BusyOverlay } from '../../components/ui/BusyOverlay';
import { EmptyState } from '../../components/ui/EmptyState';
import { Pagination } from '../../components/ui/Pagination';
import { getApiErrorMessage } from '../../lib/apiError';
import type { Zone, City } from '../../types/org.types';

const PlusIcon = (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
  </svg>
);

const MapPinIcon = (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
  </svg>
);

// ── Zone modal ────────────────────────────────────────────────────

function ZoneModal({ open, onClose, editing }: { open: boolean; onClose: () => void; editing: Zone | null }) {
  const createZone = useCreateZone();
  const updateZone = useUpdateZone();
  const [apiError, setApiError] = useState('');

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<{ name: string }>({
    defaultValues: editing ? { name: editing.name } : {},
  });

  const handleClose = () => { reset(); setApiError(''); onClose(); };

  const onSubmit = async ({ name }: { name: string }) => {
    setApiError('');
    try {
      if (editing) await updateZone.mutateAsync({ id: editing.id, name });
      else await createZone.mutateAsync({ name });
      handleClose();
    } catch (err) { setApiError(getApiErrorMessage(err)); }
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={editing ? 'Edit zone' : 'Add zone'}
      size="sm"
      footer={
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={handleClose}>Cancel</Button>
          <Button type="submit" form="zone-form" loading={isSubmitting}>{editing ? 'Save' : 'Add zone'}</Button>
        </div>
      }
    >
      <form id="zone-form" onSubmit={handleSubmit(onSubmit)}>
        <fieldset disabled={isSubmitting} className="space-y-4">
        {apiError && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{apiError}</p>}
        <Input
          label="Zone name"
          required
          placeholder="e.g. North, South, East"
          {...register('name', { required: 'Required' })}
          error={errors.name?.message}
        />
        </fieldset>
      </form>
    </Modal>
  );
}

// ── City modal ────────────────────────────────────────────────────

function CityModal({
  open, onClose, zoneId, zoneName, editing,
}: {
  open: boolean; onClose: () => void; zoneId: string; zoneName: string; editing: City | null;
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
      if (editing) await updateCity.mutateAsync({ id: editing.id, name });
      else await createCity.mutateAsync({ zoneId, name });
      handleClose();
    } catch (err) { setApiError(getApiErrorMessage(err)); }
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={editing ? 'Edit city' : `Add city to ${zoneName}`}
      size="sm"
      footer={
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={handleClose}>Cancel</Button>
          <Button type="submit" form="city-form" loading={isSubmitting}>{editing ? 'Save' : 'Add city'}</Button>
        </div>
      }
    >
      <form id="city-form" onSubmit={handleSubmit(onSubmit)}>
        <fieldset disabled={isSubmitting} className="space-y-4">
        {apiError && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{apiError}</p>}
        <Input
          label="City name"
          required
          placeholder="e.g. Mumbai, Delhi"
          {...register('name', { required: 'Required' })}
          error={errors.name?.message}
        />
        </fieldset>
      </form>
    </Modal>
  );
}

// ── Main page ─────────────────────────────────────────────────────

export function ZoneCityPage() {
  const deleteZone = useDeleteZone();
  const deleteCity = useDeleteCity;

  const [selectedZone, setSelectedZone] = useState<Zone | null>(null);

  // Zones table — server-side search + pagination
  const [zoneSearch, setZoneSearch] = useState('');
  const zoneDebounced = useDebouncedValue(zoneSearch, 300);
  const [zonePage, setZonePage] = useState(1);
  useEffect(() => setZonePage(1), [zoneDebounced]);
  const { data: zoneData, isLoading: zonesLoading, isFetching: zoneFetching } = useZonesPage({ page: zonePage, limit: 10, search: zoneDebounced });
  const zoneItems = zoneData?.items ?? [];
  const zoneTotalPages = zoneData?.meta.totalPages ?? 1;
  const zoneTotal = zoneData?.meta.total ?? 0;

  // Cities table — server-side search + pagination (per selected zone)
  const [citySearch, setCitySearch] = useState('');
  const cityDebounced = useDebouncedValue(citySearch, 300);
  const [cityPage, setCityPage] = useState(1);
  useEffect(() => setCityPage(1), [cityDebounced, selectedZone?.id]);
  const { data: cityData, isLoading: citiesLoading, isFetching: cityFetching } = useCitiesPage(selectedZone?.id ?? '', { page: cityPage, limit: 10, search: cityDebounced });
  const cityItems = cityData?.items ?? [];
  const cityTotalPages = cityData?.meta.totalPages ?? 1;
  const cityTotal = cityData?.meta.total ?? 0;

  const [zoneModal, setZoneModal] = useState(false);
  const [editingZone, setEditingZone] = useState<Zone | null>(null);
  const [deleteZoneTarget, setDeleteZoneTarget] = useState<Zone | null>(null);

  const [cityModal, setCityModal] = useState(false);
  const [editingCity, setEditingCity] = useState<City | null>(null);
  const [deleteCityTarget, setDeleteCityTarget] = useState<City | null>(null);

  const deleteCityMutation = deleteCity(selectedZone?.id ?? '');

  const handleZoneSelect = (z: Zone) => {
    setSelectedZone(z);
    setCitySearch('');
    setEditingCity(null);
  };

  const openEditZone = (z: Zone, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingZone(z);
    setZoneModal(true);
  };

  const openDeleteZone = (z: Zone, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteZoneTarget(z);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Zone & City</h1>
          <p className="text-slate-500 mt-1">
            Manage geographic zones and their cities
            {zoneTotal > 0 && <span className="text-slate-400"> · {zoneTotal} zones</span>}
          </p>
        </div>
        <Button icon={PlusIcon} onClick={() => { setEditingZone(null); setZoneModal(true); }}>
          Add zone
        </Button>
      </div>

      {/* Split pane */}
      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-5">

        {/* LEFT — Zones list */}
        <div className="space-y-3">
          <SearchInput
            value={zoneSearch}
            onChange={(e) => setZoneSearch(e.target.value)}
            onClear={() => setZoneSearch('')}
            placeholder="Search zones..."
          />

          {zonesLoading && (
            <div className="space-y-2">
              {[1,2,3,4].map((i) => <div key={i} className="h-14 rounded-xl bg-slate-100 animate-pulse" />)}
            </div>
          )}

          {!zonesLoading && zoneItems.length === 0 && (
            <Card>
              <EmptyState
                icon={MapPinIcon}
                title={zoneSearch ? 'No zones found' : 'No zones yet'}
                description={zoneSearch ? `No results for "${zoneSearch}"` : 'Add the first zone to get started.'}
                action={!zoneSearch ? <Button size="sm" icon={PlusIcon} onClick={() => setZoneModal(true)}>Add zone</Button> : undefined}
              />
            </Card>
          )}

          <div className="relative space-y-1.5">
            <BusyOverlay show={zoneFetching && !zonesLoading} />
            {zoneItems.map((z) => {
              const isSelected = selectedZone?.id === z.id;
              return (
                <div
                  key={z.id}
                  onClick={() => handleZoneSelect(z)}
                  className={`group flex items-center justify-between px-4 py-3.5 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-primary-50 border-primary-300 shadow-sm'
                      : 'bg-white border-border hover:bg-slate-50 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-2 h-2 rounded-full shrink-0 ${isSelected ? 'bg-primary-500' : 'bg-slate-300 group-hover:bg-slate-400'}`} />
                    <div className="min-w-0">
                      <p className={`text-sm font-semibold truncate ${isSelected ? 'text-primary-700' : 'text-slate-800'}`}>
                        {z.name}
                      </p>
                      <Badge variant={z.status === 'ACTIVE' ? 'success' : 'default'} size="sm">
                        {z.status.toLowerCase()}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-2">
                    <Button variant="ghost" size="sm" onClick={(e) => openEditZone(z, e)}>Edit</Button>
                    <Button variant="ghost" size="sm" onClick={(e) => openDeleteZone(z, e)}>Delete</Button>
                  </div>
                </div>
              );
            })}
          </div>

          {zoneTotalPages > 1 && (
            <div className="flex justify-end pt-1">
              <Pagination currentPage={zonePage} totalPages={zoneTotalPages} onPageChange={setZonePage} />
            </div>
          )}
        </div>

        {/* RIGHT — Cities for selected zone */}
        <div className="space-y-3">
          {!selectedZone ? (
            <Card>
              <EmptyState
                icon={MapPinIcon}
                title="Select a zone"
                description="Click on a zone on the left to view and manage its cities."
              />
            </Card>
          ) : (
            <>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-base font-semibold text-slate-900">
                    {selectedZone.name} Zone
                  </p>
                  <p className="text-sm text-slate-500">
                    {cityTotal} {cityTotal === 1 ? 'city' : 'cities'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <SearchInput
                    value={citySearch}
                    onChange={(e) => setCitySearch(e.target.value)}
                    onClear={() => setCitySearch('')}
                    placeholder="Search cities..."
                    className="w-full sm:w-52"
                  />
                  <Button
                    size="sm"
                    icon={PlusIcon}
                    onClick={() => { setEditingCity(null); setCityModal(true); }}
                  >
                    Add city
                  </Button>
                </div>
              </div>

              {citiesLoading && (
                <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-2">
                  {[1,2,3,4,5,6].map((i) => <div key={i} className="h-12 rounded-lg bg-slate-100 animate-pulse" />)}
                </div>
              )}

              {!citiesLoading && cityItems.length === 0 && (
                <Card>
                  <EmptyState
                    icon={MapPinIcon}
                    title={citySearch ? 'No cities found' : `No cities in ${selectedZone.name} yet`}
                    description={citySearch ? `No results for "${citySearch}"` : 'Add the first city to this zone.'}
                    action={!citySearch
                      ? <Button size="sm" icon={PlusIcon} onClick={() => setCityModal(true)}>Add city</Button>
                      : undefined}
                  />
                </Card>
              )}

              {!citiesLoading && cityItems.length > 0 && (
                <div className="relative">
                  <BusyOverlay show={cityFetching && !citiesLoading} />
                  <Card padding="none">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border bg-slate-50/60">
                          <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">City</th>
                          <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                          <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Added</th>
                          <th className="px-5 py-3" />
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {cityItems.map((c) => (
                          <tr key={c.id} className="group hover:bg-slate-50/60 transition-colors">
                            <td className="px-5 py-3 font-medium text-slate-900">{c.name}</td>
                            <td className="px-5 py-3">
                              <Badge variant={c.status === 'ACTIVE' ? 'success' : 'default'} size="sm">
                                {c.status.toLowerCase()}
                              </Badge>
                            </td>
                            <td className="px-5 py-3 text-slate-500 text-xs">
                              {new Date(c.createdAt).toLocaleDateString('en-IN')}
                            </td>
                            <td className="px-5 py-3">
                              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button variant="ghost" size="sm" onClick={() => { setEditingCity(c); setCityModal(true); }}>
                                  Edit
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => setDeleteCityTarget(c)}>
                                  Delete
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {cityTotalPages > 1 && (
                    <div className="flex justify-end px-5 py-3 border-t border-border">
                      <Pagination currentPage={cityPage} totalPages={cityTotalPages} onPageChange={setCityPage} />
                    </div>
                  )}
                  </Card>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Zone modals */}
      <ZoneModal
        open={zoneModal}
        onClose={() => { setZoneModal(false); setEditingZone(null); }}
        editing={editingZone}
      />
      <ConfirmDialog
        open={!!deleteZoneTarget}
        onClose={() => setDeleteZoneTarget(null)}
        loading={deleteZone.isPending}
        title="Delete zone"
        confirmLabel="Delete zone"
        message={<>Delete <strong>{deleteZoneTarget?.name}</strong>? All cities in this zone must be removed first.</>}
        onConfirm={() => {
          if (!deleteZoneTarget) return;
          deleteZone.mutate(deleteZoneTarget.id, {
            onSuccess: () => {
              setDeleteZoneTarget(null);
              if (selectedZone?.id === deleteZoneTarget.id) setSelectedZone(null);
            },
          });
        }}
      />

      {/* City modals */}
      {selectedZone && (
        <>
          <CityModal
            open={cityModal}
            onClose={() => { setCityModal(false); setEditingCity(null); }}
            zoneId={selectedZone.id}
            zoneName={selectedZone.name}
            editing={editingCity}
          />
          <ConfirmDialog
            open={!!deleteCityTarget}
            onClose={() => setDeleteCityTarget(null)}
            loading={deleteCityMutation.isPending}
            title="Delete city"
            confirmLabel="Delete city"
            message={<>Delete <strong>{deleteCityTarget?.name}</strong>? This cannot be undone.</>}
            onConfirm={() => {
              if (!deleteCityTarget) return;
              deleteCityMutation.mutate(deleteCityTarget.id, { onSuccess: () => setDeleteCityTarget(null) });
            }}
          />
        </>
      )}
    </div>
  );
}
