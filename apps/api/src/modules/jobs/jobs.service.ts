import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { JobStatus, Role } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { ActivityService } from '../activity/activity.service';
import { DistributionService } from '../distribution/distribution.service';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { ListJobsDto } from './dto/list-jobs.dto';

@Injectable()
export class JobsService {
  constructor(
    private prisma: PrismaService,
    private activity: ActivityService,
    private distribution: DistributionService,
  ) {}

  async create(organizationId: string, userId: string, dto: CreateJobDto) {
    const job = await this.prisma.job.create({
      data: {
        organizationId,
        createdById: userId,
        title: dto.title,
        department: dto.department,
        clientId: dto.clientId,
        location: dto.location,
        workMode: dto.workMode,
        employmentType: dto.employmentType,
        experienceMin: dto.experienceMin,
        experienceMax: dto.experienceMax,
        salaryMin: dto.salaryMin,
        salaryMax: dto.salaryMax,
        currency: dto.currency,
        description: dto.description,
        requirements: dto.requirements,
        responsibilities: dto.responsibilities,
        benefits: dto.benefits,
        skills: dto.skills || [],
        applicationDeadline: dto.applicationDeadline
          ? new Date(dto.applicationDeadline)
          : null,
        status: JobStatus.DRAFT,
      },
    });

    await this.activity.log({
      organizationId,
      userId,
      action: 'job.created',
      entityType: 'Job',
      entityId: job.id,
      metadata: { title: job.title },
    });

    return job;
  }

  async list(organizationId: string, filters: ListJobsDto) {
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = { organizationId };
    if (filters.status) where.status = filters.status;
    if (filters.clientId) where.clientId = filters.clientId;
    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const [jobs, total] = await Promise.all([
      this.prisma.job.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          _count: { select: { applications: true } },
          client: { select: { id: true, companyName: true } },
        },
      }),
      this.prisma.job.count({ where }),
    ]);

    return {
      data: jobs.map((j) => ({
        ...j,
        applicationsCount: j._count.applications,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(organizationId: string, id: string) {
    const job = await this.prisma.job.findFirst({
      where: { id, organizationId },
      include: {
        client: { select: { id: true, companyName: true } },
        distributions: true,
        _count: { select: { applications: true } },
      },
    });
    if (!job) throw new NotFoundException('Job not found');
    return job;
  }

  async update(
    organizationId: string,
    userId: string,
    id: string,
    dto: UpdateJobDto,
  ) {
    const job = await this.prisma.job.findFirst({
      where: { id, organizationId },
    });
    if (!job) throw new NotFoundException('Job not found');

    const updated = await this.prisma.job.update({
      where: { id },
      data: {
        ...dto,
        applicationDeadline: dto.applicationDeadline
          ? new Date(dto.applicationDeadline)
          : undefined,
      },
    });

    await this.activity.log({
      organizationId,
      userId,
      action: 'job.updated',
      entityType: 'Job',
      entityId: id,
      metadata: { fields: Object.keys(dto) },
    });

    return updated;
  }

  async remove(organizationId: string, userId: string, id: string) {
    const job = await this.prisma.job.findFirst({
      where: { id, organizationId },
    });
    if (!job) throw new NotFoundException('Job not found');

    await this.prisma.job.delete({ where: { id } });

    await this.activity.log({
      organizationId,
      userId,
      action: 'job.deleted',
      entityType: 'Job',
      entityId: id,
      metadata: { title: job.title },
    });

    return { message: 'Job deleted' };
  }

  async publish(
    organizationId: string,
    userId: string,
    id: string,
    platforms: any[],
  ) {
    const job = await this.prisma.job.findFirst({
      where: { id, organizationId },
    });
    if (!job) throw new NotFoundException('Job not found');

    return this.distribution.publishJob(organizationId, userId, id, platforms);
  }

  async close(organizationId: string, userId: string, id: string) {
    const job = await this.prisma.job.findFirst({
      where: { id, organizationId },
    });
    if (!job) throw new NotFoundException('Job not found');

    const updated = await this.prisma.job.update({
      where: { id },
      data: { status: JobStatus.CLOSED },
    });

    await this.activity.log({
      organizationId,
      userId,
      action: 'job.closed',
      entityType: 'Job',
      entityId: id,
      metadata: {},
    });

    return updated;
  }

  async getDistributions(organizationId: string, id: string) {
    const job = await this.prisma.job.findFirst({
      where: { id, organizationId },
    });
    if (!job) throw new NotFoundException('Job not found');
    return this.distribution.getJobDistributions(organizationId, id);
  }
}
