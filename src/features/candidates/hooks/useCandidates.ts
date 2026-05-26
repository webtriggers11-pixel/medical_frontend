import { useQuery } from '@tanstack/react-query';
import { candidatesService } from '../../../services/candidates.service';
import { queryKeys } from '../../../api/queryKeys';

export const useCandidates = () =>
  useQuery({
    queryKey: queryKeys.candidates.all,
    queryFn: candidatesService.getAll,
  });
