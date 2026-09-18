import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import {
  DistributionStatus,
  JobStatus,
  Platform,
} from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { ActivityService } from '../activity/activity.service';
import { ConnectorRegistry } from './connectors/connector.registry';

@Injectable()
export class DistributionService {
  private readonly logger = new Logger(DistributionService.name);

  constructor(
    private prisma: PrismaService,
    private activity: ActivityService,
    private registry: ConnectorRegistry,
  ) {}

  /**
   * Publish a job to selected platforms.
   * - CAREER_PAGE: auto-published
   * - LINKEDIN: creates PENDING_ADMIN_PUBLICATION request
   */
  async publishJob(
    organizationId: string,
    userId: string,
    jobId: string,
    platforms: Platform[],
  ) {
    if (!platforms.length) {
      throw new BadRequestException('At least one platform required');
    }

    const job = await this.prisma.job.findFirst({
      where: { id: jobId, organizationId },
    });
    if (!job) throw new NotFoundException('Job not found');

    // Create distribution requests
    const distributions = [];
    for (const platform of platforms) {
      if (!this.registry.has(platform)) {
        this.logger.warn(`Skipping platform ${platform} — no connector`);
        continue;
      }

      // Check if already has a distribution for this platform
      const existing = await this.prisma.jobDistribution.findFirst({
        where: { jobId, platform, organizationId },
      });
      if (existing && existing.status !== DistributionStatus.FAILED) {
        continue; // skip duplicates
      }

      const initialStatus =
        platform === Platform.LINKEDIN
          ? DistributionStatus.PENDING_ADMIN_PUBLICATION
          : DistributionStatus.PROCESSING;

      const dist = await this.prisma.jobDistribution.create({
        data: {
          organizationId,
          jobId,
          platform,
          status: initialStatus,
          requestedById: userId,
        },
      });
      distributions.push(dist);

      // Auto-publish career page immediately
      if (platform === Platform.CAREER_PAGE) {
        try {
          const connector = this.registry.get(platform);
          const result = await connector.publishJob({
            jobId: job.id,
            organizationId,
            title: job.title,
            description: job.description || '',
            location: job.location || undefined,
            employmentType: job.employmentType,
            skills: job.skills,
            salaryMin: job.salaryMin || undefined,
            salaryMax: job.salaryMax || undefined,
            currency: job.currency || undefined,
          });

          await this.prisma.jobDistribution.update({
            where: { id: dist.id },
            data: {
              status: DistributionStatus.PUBLISHED,
              publishedAt: result.publishedAt,
              externalJobId: result.externalJobId,
            },
          });
        } catch (err) {
          await this.prisma.jobDistribution.update({
            where: { id: dist.id },
            data: {
              status: DistributionStatus.FAILED,
              errorMessage: err instanceof Error ? err.message : 'Unknown error',
            },
          });
        }
      }
    }

    // Update job status
    const newJobStatus = platforms.includes(Platform.LINKEDIN)
      ? JobStatus.PENDING_ADMIN_PUBLICATION
      : JobStatus.PUBLISHED;

    await this.prisma.job.update({
      where: { id: jobId },
      data: { status: newJobStatus },
    });

    await this.activity.log({
      organizationId,
      userId,
      action: 'job.published',
      entityType: 'Job',
      entityId: jobId,
      metadata: { platforms },
    });

    return this.getJobDistributions(organizationId, jobId);
  }

  async getJobDistributions(organizationId: string, jobId: string) {
    return this.prisma.jobDistribution.findMany({
      where: { jobId, organizationId },
      orderBy: { requestedAt: 'desc' },
    });
  }

  /**
   * ADMIN: List pending publication queue.
   */
  async getPublishingQueue() {
    return this.prisma.jobDistribution.findMany({
      where: {
        status: DistributionStatus.PENDING_ADMIN_PUBLICATION,
      },
      orderBy: { requestedAt: 'asc' },
      include: {
        job: {
          select: {
            id: true,
            title: true,
            location: true,
            employmentType: true,
            description: true,
            requirements: true,
            skills: true,
            salaryMin: true,
            salaryMax: true,
            currency: true,
          },
        },
        organization: {
          select: { id: true, name: true, slug: true },
        },
      },
    });
  }

  /**
   * ADMIN: List all distributions (with optional status filter).
   */
  async getAllDistributions(status?: DistributionStatus, platform?: string) {
    const where: any = {};
    if (status) where.status = status;
    if (platform) where.platform = platform;

    return this.prisma.jobDistribution.findMany({
      where,
      orderBy: { requestedAt: 'desc' },
      take: 100,
      include: {
        job: { select: { id: true, title: true } },
        organization: { select: { id: true, name: true, slug: true } },
      },
    });
  }

  /**
   * ADMIN: Mark a distribution as published.
   */
  async markPublished(distributionId: string, adminId: string, externalJobId?: string) {
    const dist = await this.prisma.jobDistribution.findUnique({
      where: { id: distributionId },
      include: { job: true },
    });
    if (!dist) throw new NotFoundException('Distribution not found');

    if (dist.status === DistributionStatus.PUBLISHED) {
      throw new BadRequestException('Already published');
    }

    const connector = this.registry.get(dist.platform);
    const result = await connector.publishJob({
      jobId: dist.job.id,
      organizationId: dist.organizationId,
      title: dist.job.title,
      description: dist.job.description || '',
      location: dist.job.location || undefined,
      employmentType: dist.job.employmentType,
      skills: dist.job.skills,
    });

    const updated = await this.prisma.jobDistribution.update({
      where: { id: distributionId },
      data: {
        status: DistributionStatus.PUBLISHED,
        publishedAt: result.publishedAt,
        externalJobId: externalJobId || result.externalJobId,
      },
    });

    // If all distributions for this job are published, update job status
    const siblings = await this.prisma.jobDistribution.findMany({
      where: { jobId: dist.jobId },
    });
    const allPublished = siblings.every(
      (d) => d.status === DistributionStatus.PUBLISHED,
    );
    if (allPublished) {
      await this.prisma.job.update({
        where: { id: dist.jobId },
        data: { status: JobStatus.PUBLISHED },
      });
    }

    await this.activity.log({
      organizationId: dist.organizationId,
      userId: adminId,
      action: 'distribution.marked_published',
      entityType: 'JobDistribution',
      entityId: distributionId,
      metadata: { platform: dist.platform, jobId: dist.jobId },
    });

    return updated;
  }

  /**
   * ADMIN: Reject a distribution.
   */
  async reject(distributionId: string, adminId: string, reason: string) {
    const dist = await this.prisma.jobDistribution.findUnique({
      where: { id: distributionId },
    });
    if (!dist) throw new NotFoundException('Distribution not found');

    const updated = await this.prisma.jobDistribution.update({
      where: { id: distributionId },
      data: {
        status: DistributionStatus.FAILED,
        errorMessage: reason,
      },
    });

    await this.activity.log({
      organizationId: dist.organizationId,
      userId: adminId,
      action: 'distribution.rejected',
      entityType: 'JobDistribution',
      entityId: distributionId,
      metadata: { reason, platform: dist.platform },
    });

    return updated;
  }

  /**
   * ADMIN: List all organizations with counts.
   */
  async listAllOrganizations(search?: string) {
    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' as const } },
            { slug: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {};

    return this.prisma.organization.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 200,
      include: {
        _count: {
          select: {
            users: true,
            jobs: true,
            candidates: true,
            applications: true,
          },
        },
      },
    });
  }

  /**
   * ADMIN: Get one organization with details and members.
   */
  async getOrganizationDetail(id: string) {
    return this.prisma.organization.findUnique({
      where: { id },
      include: {
        users: {
          include: {
            user: {
              select: { id: true, name: true, email: true },
            },
          },
        },
        _count: {
          select: {
            users: true,
            jobs: true,
            candidates: true,
            applications: true,
          },
        },
      },
    });
  }

}
