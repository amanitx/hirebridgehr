import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Job, JobStatus, Paginated, Platform } from '@/types';

interface ListJobsParams {
  status?: JobStatus | 'ALL';
  search?: string;
  page?: number;
  limit?: number;
}

export function useJobs(params: ListJobsParams = {}) {
  const search = new URLSearchParams();
  if (params.status && params.status !== 'ALL') search.set('status', params.status);
  if (params.search) search.set('search', params.search);
  search.set('page', String(params.page ?? 1));
  search.set('limit', String(params.limit ?? 20));

  return useQuery({
    queryKey: ['jobs', params],
    queryFn: async () => {
      const { data } = await api.get(`/jobs?${search.toString()}`);
      return data.data as Paginated<Job>;
    },
  });
}

export function useJob(id: string | undefined) {
  return useQuery({
    queryKey: ['job', id],
    queryFn: async () => {
      const { data } = await api.get(`/jobs/${id}`);
      return data.data as Job;
    },
    enabled: !!id,
  });
}

export function useCreateJob() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<Job>) => {
      const { data } = await api.post('/jobs', payload);
      return data.data as Job;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['jobs'] });
      qc.invalidateQueries({ queryKey: ['analytics'] });
    },
  });
}

export function useUpdateJob() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...payload }: Partial<Job> & { id: string }) => {
      const { data } = await api.patch(`/jobs/${id}`, payload);
      return data.data as Job;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['jobs'] });
      qc.invalidateQueries({ queryKey: ['job', vars.id] });
    },
  });
}

export function useDeleteJob() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/jobs/${id}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['jobs'] });
      qc.invalidateQueries({ queryKey: ['analytics'] });
    },
  });
}

export function usePublishJob() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, platforms }: { id: string; platforms: Platform[] }) => {
      const { data } = await api.post(`/jobs/${id}/publish`, { platforms });
      return data.data;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['jobs'] });
      qc.invalidateQueries({ queryKey: ['job', vars.id] });
      qc.invalidateQueries({ queryKey: ['analytics'] });
    },
  });
}

export function useCloseJob() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.post(`/jobs/${id}/close`);
      return data.data as Job;
    },
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: ['jobs'] });
      qc.invalidateQueries({ queryKey: ['job', id] });
    },
  });
}
