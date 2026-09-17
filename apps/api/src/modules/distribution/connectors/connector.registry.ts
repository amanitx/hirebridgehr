import { Injectable, NotFoundException } from '@nestjs/common';
import { Platform } from '@prisma/client';
import { JobBoardConnector } from './job-board-connector.interface';
import { LinkedInConnector } from './linkedin.connector';
import { CareerPageConnector } from './career-page.connector';

@Injectable()
export class ConnectorRegistry {
  private connectors: Map<Platform, JobBoardConnector> = new Map();

  constructor(
    linkedin: LinkedInConnector,
    careerPage: CareerPageConnector,
  ) {
    this.register(Platform.LINKEDIN, linkedin);
    this.register(Platform.CAREER_PAGE, careerPage);
  }

  private register(platform: Platform, connector: JobBoardConnector) {
    this.connectors.set(platform, connector);
  }

  get(platform: Platform): JobBoardConnector {
    const connector = this.connectors.get(platform);
    if (!connector) {
      throw new NotFoundException(`No connector registered for platform ${platform}`);
    }
    return connector;
  }

  has(platform: Platform): boolean {
    return this.connectors.has(platform);
  }

  listPlatforms(): Platform[] {
    return Array.from(this.connectors.keys());
  }
}
