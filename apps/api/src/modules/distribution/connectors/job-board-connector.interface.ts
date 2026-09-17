export interface PublishResult {
  externalJobId: string;
  publishedAt: Date;
}

export interface ConnectorStatus {
  status: string;
  externalJobId?: string;
  errorMessage?: string;
}

export interface PublishJobPayload {
  jobId: string;
  organizationId: string;
  title: string;
  description: string;
  location?: string;
  employmentType: string;
  skills: string[];
  salaryMin?: number;
  salaryMax?: number;
  currency?: string;
}

export interface JobBoardConnector {
  readonly platform: string;
  publishJob(payload: PublishJobPayload): Promise<PublishResult>;
  updateJob(externalJobId: string, payload: PublishJobPayload): Promise<void>;
  closeJob(externalJobId: string): Promise<void>;
  getStatus(externalJobId: string): Promise<ConnectorStatus>;
}
