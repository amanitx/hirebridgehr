export interface User {
  id: string;
  email: string;
  name: string;
  emailVerified: boolean;
  isSuperAdmin?: boolean;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  type: string;
  role?: string;
}

export interface AuthResponse {
  user: User;
  organizations: Organization[];
  defaultOrganizationId: string | null;
  accessToken: string;
  refreshToken: string;
}
