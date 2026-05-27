import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../../../api/queryKeys';
import { panelService } from '../../../services/panel.service';
import type { CreatePanelInput, UpdatePanelInput, SetClientPricingInput } from '../../../types/panel.types';

export const usePanels = (labId?: string) =>
  useQuery({
    queryKey: labId ? queryKeys.panels.byLabId(labId) : queryKeys.panels.all,
    queryFn: () => panelService.getAll(labId),
  });

export const useCreatePanel = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreatePanelInput) => panelService.create(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.panels.all }),
  });
};

export const useUpdatePanel = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdatePanelInput }) =>
      panelService.update(id, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.panels.all }),
  });
};

export const useDeletePanel = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => panelService.remove(id),
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
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.panels.pricing(panelId) }),
  });
};
