import { Injectable, NotFoundException } from '@nestjs/common';
import { Source } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { ActivityService } from '../activity/activity.service';
import { CreateCandidateDto } from './dto/create-candidate.dto';
import { UpdateCandidateDto } from './dto/update-candidate.dto';
import { ListCandidatesDto } from './dto/list-candidates.dto';

@Injectable()
export class CandidatesService {
  constructor(
    private prisma: PrismaService,
    private activity: ActivityService,
  ) {}

  async create(organizationId: string, userId: string, dto: CreateCandidateDto) {
    const candidate = await this.prisma.candidate.create({
      data: {
        organizationId,
        name: dto.name,
        email: dto.email?.toLowerCase(),
        phone: dto.phone,
        location: dto.location,
        skills: dto.skills || [],
        experience: dto.experience,
        education: dto.education,
        source: dto.source || Source.MANUAL,
        tags: dto.tags || [],
        notes: dto.notes,
        ownerId: dto.ownerId,
      },
    });

    await this.activity.log({
      organizationId,
      userId,
      action: 'candidate.created',
      entityType: 'Candidate',
      entityId: candidate.id,
      metadata: { name: candidate.name, source: candidate.source },
    });

    return candidate;
  }

  async list(organizationId: string, filters: ListCandidatesDto) {
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = { organizationId };
    if (filters.source) where.source = filters.source;
    if (filters.location) where.location = { contains: filters.location, mode: 'insensitive' };
    if (filters.ownerId) where.ownerId = filters.ownerId;
    if (filters.skill) where.skills = { has: filters.skill };
    if (filters.tag) where.tags = { has: filters.tag };
    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { email: { contains: filters.search, mode: 'insensitive' } },
        { phone: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const [candidates, total] = await Promise.all([
      this.prisma.candidate.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          owner: { select: { id: true, name: true, email: true } },
          _count: { select: { applications: true, documents: true } },
        },
      }),
      this.prisma.candidate.count({ where }),
    ]);

    return {
      data: candidates.map((c) => ({
        ...c,
        applicationsCount: c._count.applications,
        documentsCount: c._count.documents,
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
    const candidate = await this.prisma.candidate.findFirst({
      where: { id, organizationId },
      include: {
        owner: { select: { id: true, name: true, email: true } },
        documents: true,
        applications: {
          orderBy: { appliedAt: 'desc' },
          include: {
            job: { select: { id: true, title: true, location: true, status: true } },
          },
        },
      },
    });
    if (!candidate) throw new NotFoundException('Candidate not found');
    return candidate;
  }

  async update(
    organizationId: string,
    userId: string,
    id: string,
    dto: UpdateCandidateDto,
  ) {
    const candidate = await this.prisma.candidate.findFirst({
      where: { id, organizationId },
    });
    if (!candidate) throw new NotFoundException('Candidate not found');

    const updated = await this.prisma.candidate.update({
      where: { id },
      data: {
        ...dto,
        email: dto.email ? dto.email.toLowerCase() : undefined,
      },
    });

    await this.activity.log({
      organizationId,
      userId,
      action: 'candidate.updated',
      entityType: 'Candidate',
      entityId: id,
      metadata: { fields: Object.keys(dto) },
    });

    return updated;
  }

  async remove(organizationId: string, userId: string, id: string) {
    const candidate = await this.prisma.candidate.findFirst({
      where: { id, organizationId },
    });
    if (!candidate) throw new NotFoundException('Candidate not found');

    await this.prisma.candidate.delete({ where: { id } });

    await this.activity.log({
      organizationId,
      userId,
      action: 'candidate.deleted',
      entityType: 'Candidate',
      entityId: id,
      metadata: { name: candidate.name },
    });

    return { message: 'Candidate deleted' };
  }

  async assign(
    organizationId: string,
    userId: string,
    id: string,
    ownerId: string,
  ) {
    const candidate = await this.prisma.candidate.findFirst({
      where: { id, organizationId },
    });
    if (!candidate) throw new NotFoundException('Candidate not found');

    const owner = await this.prisma.organizationUser.findUnique({
      where: { organizationId_userId: { organizationId, userId: ownerId } },
    });
    if (!owner) throw new NotFoundException('Owner is not a member of this organization');

    const updated = await this.prisma.candidate.update({
      where: { id },
      data: { ownerId },
      include: { owner: { select: { id: true, name: true, email: true } } },
    });

    await this.activity.log({
      organizationId,
      userId,
      action: 'candidate.assigned',
      entityType: 'Candidate',
      entityId: id,
      metadata: { ownerId, ownerName: updated.owner?.name },
    });

    return updated;
  }
}
