import { Injectable } from '@nestjs/common';
import {
  ApplicationStatus,
  InterviewStatus,
  JobStatus,
  Source,
} from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async overview(organizationId: string) {
    const [
      totalJobs,
      activeJobs,
      totalCandidates,
      totalApplications,
      totalInterviews,
      totalHires,
      pendingPublications,
    ] = await Promise.all([
      this.prisma.job.count({ where: { organizationId } }),
      this.prisma.job.count({
        where: {
          organizationId,
          status: { in: [JobStatus.PUBLISHED, JobStatus.PENDING_ADMIN_PUBLICATION] },
        },
      }),
      this.prisma.candidate.count({ where: { organizationId } }),
      this.prisma.application.count({ where: { organizationId } }),
      this.prisma.interview.count({ where: { organizationId } }),
      this.prisma.application.count({
        where: { organizationId, status: ApplicationStatus.HIRED },
      }),
      this.prisma.jobDistribution.count({
        where: {
          organizationId,
          status: 'PENDING_ADMIN_PUBLICATION',
        },
      }),
    ]);

    return {
      totalJobs,
      activeJobs,
      totalCandidates,
      totalApplications,
      totalInterviews,
      totalHires,
      pendingPublications,
    };
  }

  async pipelineConversion(organizationId: string) {
    const statuses: ApplicationStatus[] = [
      ApplicationStatus.NEW,
      ApplicationStatus.SCREENING,
      ApplicationStatus.SHORTLISTED,
      ApplicationStatus.INTERVIEW,
      ApplicationStatus.OFFER,
      ApplicationStatus.HIRED,
      ApplicationStatus.REJECTED,
      ApplicationStatus.WITHDRAWN,
    ];

    const counts = await this.prisma.application.groupBy({
      by: ['status'],
      where: { organizationId },
      _count: { _all: true },
    });

    const map = new Map(counts.map((c) => [c.status, c._count._all]));
    const total = counts.reduce((sum, c) => sum + c._count._all, 0);

    return {
      total,
      stages: statuses.map((s) => ({
        stage: s,
        count: map.get(s) || 0,
        percentage: total > 0 ? ((map.get(s) || 0) / total) * 100 : 0,
      })),
    };
  }

  async sourceBreakdown(organizationId: string) {
    const counts = await this.prisma.application.groupBy({
      by: ['source'],
      where: { organizationId },
      _count: { _all: true },
    });

    const total = counts.reduce((sum, c) => sum + c._count._all, 0);

    return {
      total,
      sources: counts.map((c) => ({
        source: c.source,
        count: c._count._all,
        percentage: total > 0 ? (c._count._all / total) * 100 : 0,
      })),
    };
  }

  async activityOverTime(organizationId: string, days = 30) {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const logs = await this.prisma.activityLog.findMany({
      where: {
        organizationId,
        createdAt: { gte: since },
      },
      select: { createdAt: true, action: true },
    });

    const buckets = new Map<string, number>();
    for (let i = 0; i < days; i++) {
      const d = new Date();
      d.setDate(d.getDate() - (days - 1 - i));
      const key = d.toISOString().split('T')[0];
      buckets.set(key, 0);
    }

    for (const log of logs) {
      const key = log.createdAt.toISOString().split('T')[0];
      if (buckets.has(key)) {
        buckets.set(key, (buckets.get(key) || 0) + 1);
      }
    }

    return {
      days,
      data: Array.from(buckets.entries()).map(([date, count]) => ({ date, count })),
    };
  }

  async platformStats() {
    const [
      totalOrganizations,
      totalUsers,
      totalJobs,
      totalCandidates,
      totalApplications,
      pendingDistributions,
    ] = await Promise.all([
      this.prisma.organization.count(),
      this.prisma.user.count({ where: { isSuperAdmin: false } }),
      this.prisma.job.count(),
      this.prisma.candidate.count(),
      this.prisma.application.count(),
      this.prisma.jobDistribution.count({
        where: { status: 'PENDING_ADMIN_PUBLICATION' },
      }),
    ]);

    return {
      totalOrganizations,
      totalUsers,
      totalJobs,
      totalCandidates,
      totalApplications,
      pendingDistributions,
    };
  }
}
