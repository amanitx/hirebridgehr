import { create } from 'zustand';
import { User, Organization } from '@/types';

interface AuthState {
  user: User | null;
  organizations: Organization[];
  currentOrganizationId: string | null;
  isAuthenticated: boolean;
  setAuth: (data: {
    user: User;
    organizations: Organization[];
    accessToken: string;
    refreshToken: string;
    defaultOrganizationId?: string | null;
  }) => void;
  setCurrentOrganization: (id: string) => void;
  logout: () => void;
  hydrate: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  organizations: [],
  currentOrganizationId: null,
  isAuthenticated: false,

  setAuth: ({ user, organizations, accessToken, refreshToken, defaultOrganizationId }) => {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    const orgId = defaultOrganizationId || organizations[0]?.id || null;
    if (orgId) localStorage.setItem('organizationId', orgId);

    set({
      user,
      organizations,
      currentOrganizationId: orgId,
      isAuthenticated: true,
    });
  },

  setCurrentOrganization: (id) => {
    localStorage.setItem('organizationId', id);
    set({ currentOrganizationId: id });
  },

  logout: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('organizationId');
    set({
      user: null,
      organizations: [],
      currentOrganizationId: null,
      isAuthenticated: false,
    });
  },

  hydrate: () => {
    const token = localStorage.getItem('accessToken');
    const orgId = localStorage.getItem('organizationId');
    if (token) {
      set({ isAuthenticated: true, currentOrganizationId: orgId });
    }
  },
}));
