import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { ApplicationStatus, Source } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { ActivityService } from '../activity/activity.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { ListApplicationsDto } from './dto/list-applications.dto';

@Injectable()
export class ApplicationsService {
  constructor(
    private prisma: PrismaService,
    private activity: ActivityService,
  ) {}

  async create(organizationId: string, userId: string, dto: CreateApplicationDto) {
    const [candidate, job] = await Promise.all([
      this.prisma.candidate.findFirst({
        where: { id: dto.candidateId, organizationId },
      }),
      this.prisma.job.findFirst({
        where: { id: dto.jobId, organizationId },
      }),
    ]);
    if (!candidate) throw new NotFoundException('Candidate not found');
    if (!job) throw new NotFoundException('Job not found');

    const existing = await this.prisma.application.findUnique({
      where: {
        candidateId_jobId: { candidateId: dto.candidateId, jobId: dto.jobId },
      },
    });
    if (existing) {
      throw new ConflictException('Candidate already applied to this job');
    }

    const application = await this.prisma.application.create({
      data: {
        organizationId,
        candidateId: dto.candidateId,
        jobId: dto.jobId,
        source: dto.source || Source.MANUAL,
        status: ApplicationStatus.NEW,
      },
      include: {
        candidate: { select: { id: true, name: true, email: true } },
        job: { select: { id: true, title: true } },
      },
    });

    await this.activity.log({
      organizationId,
      userId,
      action: 'application.created',
      entityType: 'Application',
      entityId: application.id,
      metadata: {
        candidateName: application.candidate.name,
        jobTitle: application.job.title,
      },
    });

    return application;
  }

  async list(organizationId: string, filters: ListApplicationsDto) {
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = { organizationId };
    if (filters.jobId) where.jobId = filters.jobId;
    if (filters.candidateId) where.candidateId = filters.candidateId;
    if (filters.status) where.status = filters.status;
    if (filters.source) where.source = filters.source;

    const [applications, total] = await Promise.all([
      this.prisma.application.findMany({
        where,
        orderBy: { appliedAt: 'desc' },
        skip,
        take: limit,
        include: {
          candidate: {
            select: { id: true, name: true, email: true, skills: true, experience: true },
          },
          job: { select: { id: true, title: true, location: true } },
        },
      }),
      this.prisma.application.count({ where }),
    ]);

    return {
      data: applications,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(organizationId: string, id: string) {
    const application = await this.prisma.application.findFirst({
      where: { id, organizationId },
      include: {
        candidate: true,
        job: { select: { id: true, title: true, location: true, status: true } },
      },
    });
    if (!application) throw new NotFoundException('Application not found');
    return application;
  }

  async updateStatus(
    organizationId: string,
    userId: string,
    id: string,
    status: ApplicationStatus,
  ) {
    const app = await this.prisma.application.findFirst({
      where: { id, organizationId },
    });
    if (!app) throw new NotFoundException('Application not found');

    if (app.status === status) {
      throw new BadRequestException('Application is already in this status');
    }

    const updated = await this.prisma.application.update({
      where: { id },
      data: { status },
      include: {
        candidate: { select: { id: true, name: true } },
        job: { select: { id: true, title: true } },
      },
    });

    await this.activity.log({
      organizationId,
      userId,
      action: 'application.status_changed',
      entityType: 'Application',
      entityId: id,
      metadata: {
        from: app.status,
        to: status,
        candidateName: updated.candidate.name,
        jobTitle: updated.job.title,
      },
    });

    return updated;
  }

  async reject(
    organizationId: string,
    userId: string,
    id: string,
    reason?: string,
  ) {
    const app = await this.prisma.application.findFirst({
      where: { id, organizationId },
    });
    if (!app) throw new NotFoundException('Application not found');

    const updated = await this.prisma.application.update({
      where: { id },
      data: { status: ApplicationStatus.REJECTED },
    });

    await this.activity.log({
      organizationId,
      userId,
      action: 'application.rejected',
      entityType: 'Application',
      entityId: id,
      metadata: { reason: reason || 'No reason provided' },
    });

    return updated;
  }

  async withdraw(organizationId: string, userId: string, id: string) {
    const app = await this.prisma.application.findFirst({
      where: { id, organizationId },
    });
    if (!app) throw new NotFoundException('Application not found');

    const updated = await this.prisma.application.update({
      where: { id },
      data: { status: ApplicationStatus.WITHDRAWN },
    });

    await this.activity.log({
      organizationId,
      userId,
      action: 'application.withdrawn',
      entityType: 'Application',
      entityId: id,
      metadata: {},
    });

    return updated;
  }

  /**
   * Kanban pipeline — group applications by status for a given job.
   */
  async getPipeline(organizationId: string, jobId: string) {
    const job = await this.prisma.job.findFirst({
      where: { id: jobId, organizationId },
      select: { id: true, title: true },
    });
    if (!job) throw new NotFoundException('Job not found');

    const applications = await this.prisma.application.findMany({
      where: { organizationId, jobId },
      orderBy: { appliedAt: 'desc' },
      include: {
        candidate: {
          select: {
            id: true,
            name: true,
            email: true,
            skills: true,
            experience: true,
          },
        },
      },
    });

    const stages: ApplicationStatus[] = [
      ApplicationStatus.NEW,
      ApplicationStatus.SCREENING,
      ApplicationStatus.SHORTLISTED,
      ApplicationStatus.INTERVIEW,
      ApplicationStatus.OFFER,
      ApplicationStatus.HIRED,
    ];

    const pipeline = stages.map((stage) => ({
      stage,
      count: applications.filter((a) => a.status === stage).length,
      candidates: applications.filter((a) => a.status === stage),
    }));

    const rejected = applications.filter(
      (a) => a.status === ApplicationStatus.REJECTED,
    );
    const withdrawn = applications.filter(
      (a) => a.status === ApplicationStatus.WITHDRAWN,
    );

    return {
      job,
      total: applications.length,
      pipeline,
      rejected: { count: rejected.length, candidates: rejected },
      withdrawn: { count: withdrawn.length, candidates: withdrawn },
    };
  }
}
