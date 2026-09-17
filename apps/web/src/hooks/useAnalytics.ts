import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { AnalyticsOverview, PipelineConversion, SourceBreakdown } from '@/types';

export function useAnalyticsOverview() {
  return useQuery({
    queryKey: ['analytics', 'overview'],
    queryFn: async () => {
      const { data } = await api.get('/analytics/overview');
      return data.data as AnalyticsOverview;
    },
  });
}

export function usePipelineConversion() {
  return useQuery({
    queryKey: ['analytics', 'pipeline'],
    queryFn: async () => {
      const { data } = await api.get('/analytics/pipeline');
      return data.data as PipelineConversion;
    },
  });
}

export function useSourceBreakdown() {
  return useQuery({
    queryKey: ['analytics', 'sources'],
    queryFn: async () => {
      const { data } = await api.get('/analytics/sources');
      return data.data as SourceBreakdown;
    },
  });
}
