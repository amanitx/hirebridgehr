import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Application, ApplicationStatus, Paginated, PipelineResponse, Source } from '@/types';

interface ListApplicationsParams {
  jobId?: string;
  candidateId?: string;
  status?: ApplicationStatus | 'ALL';
  source?: Source | 'ALL';
  page?: number;
  limit?: number;
}

export function useApplicationsList(params: ListApplicationsParams = {}) {
  const search = new URLSearchParams();
  if (params.jobId) search.set('jobId', params.jobId);
  if (params.candidateId) search.set('candidateId', params.candidateId);
  if (params.status && params.status !== 'ALL') search.set('status', params.status);
  if (params.source && params.source !== 'ALL') search.set('source', params.source);
  search.set('page', String(params.page ?? 1));
  search.set('limit', String(params.limit ?? 20));

  return useQuery({
    queryKey: ['applications-list', params],
    queryFn: async () => {
      const { data } = await api.get(`/applications?${search.toString()}`);
      return data.data as Paginated<Application>;
    },
  });
}

export function usePipeline(jobId: string | undefined) {
  return useQuery({
    queryKey: ['pipeline', jobId],
    queryFn: async () => {
      const { data } = await api.get(`/jobs/${jobId}/pipeline`);
      return data.data as PipelineResponse;
    },
    enabled: !!jobId,
  });
}

export function useUpdateApplicationStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: ApplicationStatus }) => {
      const { data } = await api.patch(`/applications/${id}/status`, { status });
      return data.data as Application;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['pipeline'] });
      qc.invalidateQueries({ queryKey: ['applications-list'] });
      qc.invalidateQueries({ queryKey: ['applications'] });
      qc.invalidateQueries({ queryKey: ['analytics'] });
    },
  });
}

export function useRejectApplication() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason?: string }) => {
      const { data } = await api.post(`/applications/${id}/reject`, { reason });
      return data.data as Application;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['pipeline'] });
      qc.invalidateQueries({ queryKey: ['applications-list'] });
    },
  });
}

export function useCreateApplication() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { candidateId: string; jobId: string; source?: Source }) => {
      const { data } = await api.post('/applications', payload);
      return data.data as Application;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['applications-list'] });
      qc.invalidateQueries({ queryKey: ['analytics'] });
      qc.invalidateQueries({ queryKey: ['candidates'] });
    },
  });
}
