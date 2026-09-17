import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Candidate, Paginated, Source } from '@/types';

interface ListCandidatesParams {
  search?: string;
  source?: Source | 'ALL';
  skill?: string;
  location?: string;
  page?: number;
  limit?: number;
}

export function useCandidates(params: ListCandidatesParams = {}) {
  const search = new URLSearchParams();
  if (params.search) search.set('search', params.search);
  if (params.source && params.source !== 'ALL') search.set('source', params.source);
  if (params.skill) search.set('skill', params.skill);
  if (params.location) search.set('location', params.location);
  search.set('page', String(params.page ?? 1));
  search.set('limit', String(params.limit ?? 20));

  return useQuery({
    queryKey: ['candidates', params],
    queryFn: async () => {
      const { data } = await api.get(`/candidates?${search.toString()}`);
      return data.data as Paginated<Candidate>;
    },
  });
}

export function useCandidate(id: string | undefined) {
  return useQuery({
    queryKey: ['candidate', id],
    queryFn: async () => {
      const { data } = await api.get(`/candidates/${id}`);
      return data.data as Candidate;
    },
    enabled: !!id,
  });
}

export function useCreateCandidate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<Candidate> & { name: string }) => {
      const { data } = await api.post('/candidates', payload);
      return data.data as Candidate;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['candidates'] });
      qc.invalidateQueries({ queryKey: ['analytics'] });
    },
  });
}

export function useUpdateCandidate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...payload }: Partial<Candidate> & { id: string }) => {
      const { data } = await api.patch(`/candidates/${id}`, payload);
      return data.data as Candidate;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['candidates'] });
      qc.invalidateQueries({ queryKey: ['candidate', vars.id] });
    },
  });
}

export function useDeleteCandidate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/candidates/${id}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['candidates'] });
      qc.invalidateQueries({ queryKey: ['analytics'] });
    },
  });
}

export function useAssignCandidate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ownerId }: { id: string; ownerId: string }) => {
      const { data } = await api.post(`/candidates/${id}/assign`, { ownerId });
      return data.data as Candidate;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['candidate', vars.id] });
    },
  });
}
