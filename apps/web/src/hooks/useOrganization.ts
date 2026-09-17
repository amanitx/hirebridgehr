import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { TeamMember } from '@/types';

export function useOrganization() {
  return useQuery({
    queryKey: ['organization'],
    queryFn: async () => {
      const { data } = await api.get('/organizations/me');
      return data.data;
    },
  });
}

export function useTeamMembers() {
  return useQuery({
    queryKey: ['team-members'],
    queryFn: async () => {
      const { data } = await api.get('/organizations/me/members');
      return data.data as TeamMember[];
    },
  });
}

export function useUpdateOrganization() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: any) => {
      const { data } = await api.patch('/organizations/me', payload);
      return data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['organization'] });
    },
  });
}

export function useInviteMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { name: string; email: string; role: string }) => {
      const { data } = await api.post('/organizations/me/members/invite', payload);
      return data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['team-members'] });
    },
  });
}
