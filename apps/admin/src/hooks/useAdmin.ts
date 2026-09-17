import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { PlatformStats, QueueItem } from '@/types';

export function usePublishingQueue() {
  return useQuery({
    queryKey: ['admin', 'publishing-queue'],
    queryFn: async () => {
      const { data } = await api.get('/admin/publishing-queue');
      return data.data as QueueItem[];
    },
    refetchInterval: 30000,
  });
}

export function useAllDistributions(status?: string) {
  return useQuery({
    queryKey: ['admin', 'distributions', status],
    queryFn: async () => {
      const url = status ? `/admin/distributions?status=${status}` : '/admin/distributions';
      const { data } = await api.get(url);
      return data.data;
    },
  });
}

export function usePlatformStats() {
  return useQuery({
    queryKey: ['admin', 'platform-stats'],
    queryFn: async () => {
      const { data } = await api.get('/admin/analytics');
      return data.data as PlatformStats;
    },
  });
}

export function useMarkPublished() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, externalJobId }: { id: string; externalJobId?: string }) => {
      const { data } = await api.post(`/admin/distributions/${id}/mark-published`, {
        externalJobId,
      });
      return data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin'] });
    },
  });
}

export function useRejectDistribution() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      const { data } = await api.post(`/admin/distributions/${id}/reject`, { reason });
      return data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin'] });
    },
  });
}
