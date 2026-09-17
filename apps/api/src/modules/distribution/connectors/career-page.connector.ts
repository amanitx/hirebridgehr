import { Injectable, Logger } from '@nestjs/common';
import {
  JobBoardConnector,
  PublishJobPayload,
  PublishResult,
  ConnectorStatus,
} from './job-board-connector.interface';

/**
 * Career Page Connector — MVP: auto-publish.
 * Job becomes immediately visible on the org's public career page.
 */
@Injectable()
export class CareerPageConnector implements JobBoardConnector {
  readonly platform = 'CAREER_PAGE';
  private readonly logger = new Logger(CareerPageConnector.name);

  async publishJob(payload: PublishJobPayload): Promise<PublishResult> {
    this.logger.log(`Career page published: ${payload.jobId} (${payload.title})`);
    return {
      externalJobId: `career-${payload.jobId}`,
      publishedAt: new Date(),
    };
  }

  async updateJob(externalJobId: string, payload: PublishJobPayload): Promise<void> {
    this.logger.log(`Career page updated: ${externalJobId}`);
  }

  async closeJob(externalJobId: string): Promise<void> {
    this.logger.log(`Career page closed: ${externalJobId}`);
  }

  async getStatus(externalJobId: string): Promise<ConnectorStatus> {
    return { status: 'PUBLISHED', externalJobId };
  }
}
