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

export type JobStatus =
  | 'DRAFT'
  | 'PENDING_ADMIN_PUBLICATION'
  | 'PROCESSING'
  | 'PUBLISHED'
  | 'FAILED'
  | 'EXPIRED'
  | 'PAUSED'
  | 'CLOSED';

export type Platform = 'CAREER_PAGE' | 'LINKEDIN' | 'INDEED' | 'NAUKRI' | 'GOOGLE_JOBS' | 'CUSTOM';

export type WorkMode = 'REMOTE' | 'HYBRID' | 'ONSITE';
export type EmploymentType = 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERNSHIP';

export interface Client {
  id: string;
  companyName: string;
}

export interface JobDistribution {
  id: string;
  platform: Platform;
  status: string;
  requestedAt: string;
  publishedAt: string | null;
  externalJobId: string | null;
  errorMessage: string | null;
}

export interface Job {
  id: string;
  title: string;
  department?: string | null;
  clientId?: string | null;
  client?: Client | null;
  location?: string | null;
  workMode: WorkMode;
  employmentType: EmploymentType;
  experienceMin?: number | null;
  experienceMax?: number | null;
  salaryMin?: number | null;
  salaryMax?: number | null;
  currency?: string | null;
  description?: string | null;
  requirements?: string | null;
  responsibilities?: string | null;
  benefits?: string | null;
  skills: string[];
  applicationDeadline?: string | null;
  status: JobStatus;
  createdAt: string;
  updatedAt: string;
  applicationsCount?: number;
  distributions?: JobDistribution[];
  _count?: { applications: number };
}

export interface Paginated<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export type ApplicationStatus =
  | 'NEW'
  | 'SCREENING'
  | 'SHORTLISTED'
  | 'INTERVIEW'
  | 'OFFER'
  | 'HIRED'
  | 'REJECTED'
  | 'WITHDRAWN';

export type Source =
  | 'LINKEDIN'
  | 'CAREER_PAGE'
  | 'EMAIL'
  | 'REFERRAL'
  | 'MANUAL'
  | 'API'
  | 'WEBHOOK'
  | 'JOB_BOARD'
  | 'CSV';

export interface Candidate {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  location: string | null;
  skills: string[];
  experience: number | null;
  education: string | null;
  source: Source;
  tags: string[];
  notes: string | null;
  ownerId: string | null;
  owner?: { id: string; name: string; email: string } | null;
  createdAt: string;
  updatedAt: string;
  applicationsCount?: number;
  applications?: Application[];
  documentsCount?: number;
}

export interface PipelineStageData {
  stage: ApplicationStatus;
  count: number;
  candidates: Application[];
}

export interface PipelineResponse {
  job: { id: string; title: string };
  total: number;
  pipeline: PipelineStageData[];
  rejected: { count: number; candidates: Application[] };
  withdrawn: { count: number; candidates: Application[] };
}
