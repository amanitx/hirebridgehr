import { Injectable, Logger } from '@nestjs/common';
import {
  JobBoardConnector,
  PublishJobPayload,
  PublishResult,
  ConnectorStatus,
} from './job-board-connector.interface';

/**
 * LinkedIn Connector — MVP: MANAGED (manual) workflow.
 *
 * Direct LinkedIn API integration is NOT part of MVP.
 * This connector only gets called when the HirebridgeHR admin
 * clicks "Mark Published" after manually posting on LinkedIn.
 *
 * For future: replace the body of publishJob() with real API calls
 * using LinkedIn's official API when access is available.
 */
@Injectable()
export class LinkedInConnector implements JobBoardConnector {
  readonly platform = 'LINKEDIN';
  private readonly logger = new Logger(LinkedInConnector.name);

  async publishJob(payload: PublishJobPayload): Promise<PublishResult> {
    this.logger.log(
      `[MANUAL] LinkedIn publish confirmed for job ${payload.jobId} (${payload.title})`,
    );
    return {
      externalJobId: `linkedin-manual-${payload.jobId}`,
      publishedAt: new Date(),
    };
  }

  async updateJob(externalJobId: string, payload: PublishJobPayload): Promise<void> {
    this.logger.log(`[MANUAL] LinkedIn update for ${externalJobId}`);
  }

  async closeJob(externalJobId: string): Promise<void> {
    this.logger.log(`[MANUAL] LinkedIn close for ${externalJobId}`);
  }

  async getStatus(externalJobId: string): Promise<ConnectorStatus> {
    return { status: 'PUBLISHED', externalJobId };
  }
}
