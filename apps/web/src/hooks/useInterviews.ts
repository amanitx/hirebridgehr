import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Interview, InterviewStatus, Recommendation } from '@/types';

interface ListInterviewsParams {
  status?: InterviewStatus | 'ALL';
  upcoming?: boolean;
  jobId?: string;
}

export function useInterviews(params: ListInterviewsParams = {}) {
  const search = new URLSearchParams();
  if (params.status && params.status !== 'ALL') search.set('status', params.status);
  if (params.upcoming) search.set('upcoming', 'true');
  if (params.jobId) search.set('jobId', params.jobId);

  return useQuery({
    queryKey: ['interviews', params],
    queryFn: async () => {
      const { data } = await api.get(`/interviews?${search.toString()}`);
      return data.data as Interview[];
    },
  });
}

export function useInterview(id: string | undefined) {
  return useQuery({
    queryKey: ['interview', id],
    queryFn: async () => {
      const { data } = await api.get(`/interviews/${id}`);
      return data.data as Interview;
    },
    enabled: !!id,
  });
}

export function useCreateInterview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      candidateId: string;
      jobId: string;
      interviewerId: string;
      scheduledAt: string;
      durationMin?: number;
      type?: string;
      meetingLink?: string;
      notes?: string;
    }) => {
      const { data } = await api.post('/interviews', payload);
      return data.data as Interview;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['interviews'] });
      qc.invalidateQueries({ queryKey: ['analytics'] });
    },
  });
}

export function useUpdateInterviewStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: InterviewStatus }) => {
      const { data } = await api.patch(`/interviews/${id}/status`, { status });
      return data.data as Interview;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['interviews'] });
    },
  });
}

export function useSubmitFeedback() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      interviewId,
      ...payload
    }: {
      interviewId: string;
      technical: number;
      communication: number;
      problemSolving: number;
      experience: number;
      overall: number;
      recommendation: Recommendation;
      comments?: string;
    }) => {
      const { data } = await api.post(`/interviews/${interviewId}/feedback`, payload);
      return data.data;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['interview', vars.interviewId] });
      qc.invalidateQueries({ queryKey: ['interviews'] });
    },
  });
}
