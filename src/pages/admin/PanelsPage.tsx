import { useState } from 'react';
import { usePanels } from '../../features/panel/hooks/usePanels';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { SearchInput } from '../../components/ui/SearchInput';
import { SkeletonTable } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { Pagination } from '../../components/ui/Pagination';
import { usePagination } from '../../hooks/usePagination';

const fmt = (n: number) => `₹${Number(n).toLocaleString('en-IN')}`;

export function PanelsPage() {
  const { data: panels, isLoading, error } = usePanels();
  const [search, setSearch] = useState('');

  const filtered = panels?.filter((p) => {
    const q = search.toLowerCase();
    const testNames = p.panelTests?.map((pt) => pt.testMaster?.name ?? '').join(' ') ?? '';
    return (
      p.name.toLowerCase().includes(q) ||
      (p.lab?.name ?? '').toLowerCase().includes(q) ||
      (p.bundledTest?.name ?? '').toLowerCase().includes(q) ||
      testNames.toLowerCase().includes(q)
    );
  });

  const { page, setPage, totalPages, pageItems } = usePagination(filtered ?? [], {
    resetKey: `${search}`,
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Panels</h1>
        <p className="text-slate-500 mt-1">
          Master catalog of all health checkup panels
          {panels && <span className="text-slate-400"> · {panels.length} total</span>}
        </p>
      </div>

      <SearchInput
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        onClear={() => setSearch('')}
        placeholder="Search panels..."
        className="w-full sm:w-72"
      />

      {isLoading && <SkeletonTable rows={5} />}

      {error && (
        <Card>
          <p className="text-sm text-red-600 font-medium">Failed to load panels. Please try again.</p>
        </Card>
      )}

      {filtered && filtered.length > 0 && (
        <Card padding="none">
          <div className="overflow-x-auto">
            <table className="w-max min-w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-slate-50/60">
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap">ID</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">Panel</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">Timing</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">Lab</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">Lab contact</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">Service cities</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">Tests included</th>
                  <th className="text-right px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">MRP</th>
                  <th className="text-right px-5 py-3.5 text-xs font-semibold text-orange-600 uppercase tracking-wider whitespace-nowrap">Vendor cost</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">Client pricing</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">Status</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {pageItems.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/50 transition-colors align-top">
                    <td className="px-5 py-4 whitespace-nowrap">
                      <span className="text-xs font-mono font-semibold text-slate-400">{p.panelId ?? '—'}</span>
                    </td>
                    {/* Panel name */}
                    <td className="px-5 py-4">
                      <p className="font-semibold text-slate-900 whitespace-nowrap">{p.name}</p>
                    </td>
                    {/* Timing */}
                    <td className="px-5 py-4 text-slate-600 whitespace-nowrap">{p.timing || '—'}</td>
                    {/* Lab + address */}
                    <td className="px-5 py-4">
                      <p className="text-slate-700 whitespace-nowrap">{p.lab?.name ?? '—'}</p>
                      {p.lab?.address && (
                        <p
                          className="text-xs text-slate-400 mt-0.5 max-w-[200px] leading-snug line-clamp-2"
                          title={`${p.lab.address}${p.lab.pincode ? ` – ${p.lab.pincode}` : ''}`}
                        >
                          {p.lab.address}{p.lab.pincode ? ` – ${p.lab.pincode}` : ''}
                        </p>
                      )}
                    </td>
                    {/* Lab contact */}
                    <td className="px-5 py-4 text-slate-600 whitespace-nowrap">{p.labContact || '—'}</td>
                    {/* Service cities */}
                    <td className="px-5 py-4">
                      {p.lab?.serviceCities?.length ? (
                        <div className="flex flex-wrap items-center gap-1 max-w-[180px]">
                          {p.lab.serviceCities.slice(0, 3).map((c) => (
                            <Badge key={c} size="sm" variant="default">{c}</Badge>
                          ))}
                          {p.lab.serviceCities.length > 3 && (
                            <span className="text-xs text-slate-400" title={p.lab.serviceCities.join(', ')}>
                              +{p.lab.serviceCities.length - 3}
                            </span>
                          )}
                        </div>
                      ) : '—'}
                    </td>
                    {/* Tests included — from TestMaster join, with fallback to legacy bundledTest data */}
                    <td className="px-5 py-4">
                      {p.panelTests?.length ? (
                        <div className="flex flex-wrap items-center gap-1 max-w-[220px]">
                          {p.panelTests.slice(0, 4).map((pt) => (
                            <Badge key={pt.id} size="sm" variant="default">{pt.testMaster?.name ?? '—'}</Badge>
                          ))}
                          {p.panelTests.length > 4 && (
                            <span className="text-xs text-slate-400" title={p.panelTests.map((pt) => pt.testMaster?.name).join(', ')}>
                              +{p.panelTests.length - 4}
                            </span>
                          )}
                        </div>
                      ) : p.bundledTest?.testsIncluded?.length ? (
                        <div className="flex flex-wrap items-center gap-1 max-w-[220px]">
                          {p.bundledTest.testsIncluded.slice(0, 4).map((t) => (
                            <Badge key={t} size="sm" variant="default">{t}</Badge>
                          ))}
                          {p.bundledTest.testsIncluded.length > 4 && (
                            <span className="text-xs text-slate-400">+{p.bundledTest.testsIncluded.length - 4}</span>
                          )}
                        </div>
                      ) : '—'}
                    </td>
                    {/* MRP */}
                    <td className="px-5 py-4 text-right font-medium text-slate-700 whitespace-nowrap">
                      {fmt(Number(p.mrp))}
                    </td>
                    {/* Vendor cost */}
                    <td className="px-5 py-4 text-right font-semibold text-orange-600 whitespace-nowrap">
                      {fmt(Number(p.costToVendor))}
                    </td>
                    {/* Client pricing */}
                    <td className="px-5 py-4">
                      {p.clientPricing?.length ? (
                        <div className="space-y-1 max-w-[240px]">
                          {p.clientPricing.slice(0, 2).map((cp) => (
                            <div key={cp.id} className="text-xs text-slate-600 truncate" title={`${cp.client?.name ?? cp.client?.email ?? 'Client'}: ${fmt(Number(cp.costToClient))}`}>
                              <span className="font-medium text-slate-700">{cp.client?.name ?? cp.client?.email ?? 'Client'}</span>
                              {': '}
                              {fmt(Number(cp.costToClient))}
                              {cp.discountAfterN > 0 && (
                                <span className="text-emerald-600"> · {fmt(Number(cp.discountedPrice))} after {cp.discountAfterN}</span>
                              )}
                            </div>
                          ))}
                          {p.clientPricing.length > 2 && (
                            <span className="text-xs text-slate-400">+{p.clientPricing.length - 2} more</span>
                          )}
                        </div>
                      ) : <span className="text-xs text-slate-400">No client pricing</span>}
                    </td>
                    {/* Status */}
                    <td className="px-5 py-4">
                      <Badge variant={p.status === 'ACTIVE' ? 'success' : 'default'} size="sm">
                        {p.status.toLowerCase()}
                      </Badge>
                    </td>
                    {/* Created */}
                    <td className="px-5 py-4 text-slate-500 text-xs whitespace-nowrap">
                      {new Date(p.createdAt).toLocaleDateString('en-IN')}
                    </td>
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
      )}

      {filtered?.length === 0 && (
        <Card>
          <EmptyState
            icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M11.35 3.836c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m8.9-4.414c.376.023.75.05 1.124.08 1.131.094 1.976 1.057 1.976 2.192V16.5A2.25 2.25 0 0118 18.75h-2.25m-7.5-10.5H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V18.75m-7.5-10.5h6.375c.621 0 1.125.504 1.125 1.125v9.375m-8.25-3l1.5 1.5 3-3.75" /></svg>}
            title={search ? 'No panels found' : 'No panels yet'}
            description={search ? `No results for "${search}"` : 'Panels are created from Client Detail — go to Clients → select a client → Add panel.'}
          />
        </Card>
      )}
    </div>
  );
}
