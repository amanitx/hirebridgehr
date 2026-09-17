export interface AdminUser {
  id: string;
  email: string;
  name: string;
  isSuperAdmin: boolean;
}

export interface PlatformStats {
  totalOrganizations: number;
  totalUsers: number;
  totalJobs: number;
  totalCandidates: number;
  totalApplications: number;
  pendingDistributions: number;
}

export interface QueueItem {
  id: string;
  organizationId: string;
  jobId: string;
  platform: 'LINKEDIN' | 'CAREER_PAGE' | 'INDEED' | 'NAUKRI' | 'GOOGLE_JOBS' | 'CUSTOM';
  status: string;
  requestedAt: string;
  publishedAt: string | null;
  externalJobId: string | null;
  errorMessage: string | null;
  job: {
    id: string;
    title: string;
    location: string | null;
    employmentType: string;
    description: string | null;
    requirements: string | null;
    skills: string[];
    salaryMin: number | null;
    salaryMax: number | null;
    currency: string | null;
  };
  organization: {
    id: string;
    name: string;
    slug: string;
  };
}
