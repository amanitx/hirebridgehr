import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Application } from '@/types';

export function useApplications(limit = 5) {
  return useQuery({
    queryKey: ['applications', { limit }],
    queryFn: async () => {
      const { data } = await api.get(`/applications?limit=${limit}`);
      return data.data.data as Application[];
    },
  });
}
