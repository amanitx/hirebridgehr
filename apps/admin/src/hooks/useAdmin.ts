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

export function useAllDistributions(status?: string, platform?: string) {
  const params = new URLSearchParams();
  if (status && status !== 'ALL') params.set('status', status);
  if (platform && platform !== 'ALL') params.set('platform', platform);

  return useQuery({
    queryKey: ['admin', 'distributions', status, platform],
    queryFn: async () => {
      const { data } = await api.get(`/admin/distributions?${params.toString()}`);
      return data.data as any[];
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

export function useAllOrganizations(search?: string) {
  return useQuery({
    queryKey: ['admin', 'organizations', search],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      const { data } = await api.get(`/admin/organizations?${params.toString()}`);
      return data.data as any[];
    },
  });
}

export function useOrganizationDetail(id: string | undefined) {
  return useQuery({
    queryKey: ['admin', 'organization', id],
    queryFn: async () => {
      const { data } = await api.get(`/admin/organizations/${id}`);
      return data.data;
    },
    enabled: !!id,
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