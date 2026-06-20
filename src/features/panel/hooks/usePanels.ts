import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { queryKeys } from '../../../api/queryKeys';
import { panelService } from '../../../services/panel.service';
import type { CreatePanelInput, UpdatePanelInput, SetClientPricingInput } from '../../../types/panel.types';

export const usePanels = (labId?: string) =>
  useQuery({
    queryKey: labId ? queryKeys.panels.byLabId(labId) : queryKeys.panels.all,
    queryFn: () => panelService.getAll(labId),
  });

export const usePanelsPage = (params: { page: number; limit: number; search?: string }) =>
  useQuery({
    queryKey: ['panels', 'page', params],
    queryFn: () => panelService.getPage(params),
    placeholderData: keepPreviousData,
  });

// Panels priced for a specific client — filtered server-side (drives the
// booking panel picker; replaces fetching all panels and filtering in JS).
export const usePanelsForClient = (clientId: string | undefined) =>
  useQuery({
    queryKey: [...queryKeys.panels.all, 'client', clientId ?? ''] as const,
    queryFn: () => panelService.getForClient(clientId as string),
    enabled: !!clientId,
  });

export const useCreatePanel = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreatePanelInput) => panelService.create(input),
    meta: { successMessage: 'Panel created' },
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.panels.all }),
  });
};

export const useUpdatePanel = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdatePanelInput }) =>
      panelService.update(id, input),
    meta: { successMessage: 'Panel updated' },
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.panels.all }),
  });
};

export const useDeletePanel = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => panelService.remove(id),
    meta: { successMessage: 'Panel deleted' },
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.panels.all }),
  });
};

export const usePanelPricing = (panelId: string) =>
  useQuery({
    queryKey: queryKeys.panels.pricing(panelId),
    queryFn: () => panelService.getPricing(panelId),
    enabled: !!panelId,
  });

export const useSetPanelPricing = (panelId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: SetClientPricingInput) => panelService.setPricing(panelId, input),
    meta: { successMessage: 'Pricing saved' },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.panels.all });
      qc.invalidateQueries({ queryKey: queryKeys.panels.pricing(panelId) });
    },
  });
};

export const useRemovePanelPricing = (panelId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (clientId: string) => panelService.removePricing(panelId, clientId),
    meta: { successMessage: 'Pricing removed' },
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.panels.all }),
  });
};
