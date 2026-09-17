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

export interface AnalyticsOverview {
  totalJobs: number;
  activeJobs: number;
  totalCandidates: number;
  totalApplications: number;
  totalInterviews: number;
  totalHires: number;
  pendingPublications: number;
}

export interface PipelineStage {
  stage: string;
  count: number;
  percentage: number;
}

export interface PipelineConversion {
  total: number;
  stages: PipelineStage[];
}

export interface SourceBreakdown {
  total: number;
  sources: Array<{
    source: string;
    count: number;
    percentage: number;
  }>;
}

export interface Application {
  id: string;
  candidateId: string;
  jobId: string;
  source: string;
  status: string;
  appliedAt: string;
  candidate: {
    id: string;
    name: string;
    email: string | null;
    skills?: string[];
    experience?: number | null;
  };
  job: {
    id: string;
    title: string;
    location?: string | null;
  };
}

export interface Notification {
  id: string;
  title: string;
  body?: string;
  type: string;
  link?: string;
  read: boolean;
  createdAt: string;
}
