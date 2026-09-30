import { useQuery } from '@tanstack/react-query';
import { getCompetition, ApiCompetition } from '@services/competitionApi';

export const useCompetition = (id: string, initialData?: ApiCompetition) =>
  useQuery({
    queryKey: ['competition', id],
    queryFn: () => getCompetition(id),
    initialData,
    enabled: !!id,
  });