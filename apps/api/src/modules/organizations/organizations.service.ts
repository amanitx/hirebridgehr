import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { PrismaService } from '../../prisma/prisma.service';
import { ActivityService } from '../activity/activity.service';
import { EmailService } from '../email/email.service';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { InviteMemberDto } from './dto/invite-member.dto';
import { CompleteOnboardingDto } from './dto/onboarding.dto';

@Injectable()
export class OrganizationsService {
  constructor(
    private prisma: PrismaService,
    private activity: ActivityService,
    private email: EmailService,
  ) {}

  async getCurrent(organizationId: string) {
    const org = await this.prisma.organization.findUnique({
      where: { id: organizationId },
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
    if (!org) throw new NotFoundException('Organization not found');
    return org;
  }

  async update(
    organizationId: string,
    userId: string,
    dto: UpdateOrganizationDto,
  ) {
    const org = await this.prisma.organization.findUnique({
      where: { id: organizationId },
    });
    if (!org) throw new NotFoundException('Organization not found');

    // Slug change if name changed
    let slug = org.slug;
    if (dto.name && dto.name !== org.name) {
      const base = dto.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .substring(0, 50);
      slug = base;
      const exists = await this.prisma.organization.findFirst({
        where: { slug, id: { not: organizationId } },
      });
      if (exists) slug = `${base}-${Date.now().toString(36)}`;
    }

    const updated = await this.prisma.organization.update({
      where: { id: organizationId },
      data: { ...dto, slug },
    });

    await this.activity.log({
      organizationId,
      userId,
      action: 'organization.updated',
      entityType: 'Organization',
      entityId: organizationId,
      metadata: { fields: Object.keys(dto) },
    });

    return updated;
  }

  async listMembers(organizationId: string) {
    return this.prisma.organizationUser.findMany({
      where: { organizationId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            emailVerified: true,
            lastLoginAt: true,
            createdAt: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async inviteMember(
    organizationId: string,
    inviterId: string,
    dto: InviteMemberDto,
  ) {
    const inviterMembership = await this.prisma.organizationUser.findUnique({
      where: {
        organizationId_userId: { organizationId, userId: inviterId },
      },
    });
    if (
      !inviterMembership ||
      !([Role.OWNER, Role.ADMIN] as Role[]).includes(inviterMembership.role)
    ) {
      throw new ForbiddenException('Only OWNER or ADMIN can invite members');
    }

    let user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    let tempPassword: string | null = null;
    if (!user) {
      tempPassword = uuidv4().substring(0, 12);
      const passwordHash = await bcrypt.hash(tempPassword, 12);
      user = await this.prisma.user.create({
        data: {
          email: dto.email.toLowerCase(),
          name: dto.name,
          passwordHash,
          emailVerified: false,
          emailVerifyToken: uuidv4(),
        },
      });
    }

    const existingMembership = await this.prisma.organizationUser.findUnique({
      where: {
        organizationId_userId: { organizationId, userId: user.id },
      },
    });
    if (existingMembership) {
      throw new ConflictException('User is already a member of this organization');
    }

    await this.prisma.organizationUser.create({
      data: {
        organizationId,
        userId: user.id,
        role: dto.role,
      },
    });

    await this.activity.log({
      organizationId,
      userId: inviterId,
      action: 'member.invited',
      entityType: 'User',
      entityId: user.id,
      metadata: { email: dto.email, role: dto.role },
    });

    // TODO: send invite email with temp password (for new users)
    return {
      user: { id: user.id, email: user.email, name: user.name },
      role: dto.role,
      isNewUser: !!tempPassword,
    };
  }

  async updateMemberRole(
    organizationId: string,
    actorId: string,
    targetUserId: string,
    role: Role,
  ) {
    const actorMembership = await this.prisma.organizationUser.findUnique({
      where: { organizationId_userId: { organizationId, userId: actorId } },
    });
    if (!actorMembership || actorMembership.role !== Role.OWNER) {
      throw new ForbiddenException('Only OWNER can change roles');
    }

    if (actorId === targetUserId) {
      throw new BadRequestException('You cannot change your own role');
    }

    const target = await this.prisma.organizationUser.findUnique({
      where: {
        organizationId_userId: { organizationId, userId: targetUserId },
      },
    });
    if (!target) throw new NotFoundException('Member not found');

    // Don't allow demoting the last OWNER
    if (target.role === Role.OWNER && role !== Role.OWNER) {
      const ownerCount = await this.prisma.organizationUser.count({
        where: { organizationId, role: Role.OWNER },
      });
      if (ownerCount <= 1) {
        throw new BadRequestException('Cannot demote the last OWNER');
      }
    }

    const updated = await this.prisma.organizationUser.update({
      where: {
        organizationId_userId: { organizationId, userId: targetUserId },
      },
      data: { role },
    });

    await this.activity.log({
      organizationId,
      userId: actorId,
      action: 'member.role_changed',
      entityType: 'User',
      entityId: targetUserId,
      metadata: { from: target.role, to: role },
    });

    return updated;
  }

  async removeMember(
    organizationId: string,
    actorId: string,
    targetUserId: string,
  ) {
    const actorMembership = await this.prisma.organizationUser.findUnique({
      where: { organizationId_userId: { organizationId, userId: actorId } },
    });
    if (!actorMembership || actorMembership.role !== Role.OWNER) {
      throw new ForbiddenException('Only OWNER can remove members');
    }

    if (actorId === targetUserId) {
      throw new BadRequestException('You cannot remove yourself');
    }

    const target = await this.prisma.organizationUser.findUnique({
      where: {
        organizationId_userId: { organizationId, userId: targetUserId },
      },
    });
    if (!target) throw new NotFoundException('Member not found');

    if (target.role === Role.OWNER) {
      const ownerCount = await this.prisma.organizationUser.count({
        where: { organizationId, role: Role.OWNER },
      });
      if (ownerCount <= 1) {
        throw new BadRequestException('Cannot remove the last OWNER');
      }
    }

    await this.prisma.organizationUser.delete({
      where: {
        organizationId_userId: { organizationId, userId: targetUserId },
      },
    });

    await this.activity.log({
      organizationId,
      userId: actorId,
      action: 'member.removed',
      entityType: 'User',
      entityId: targetUserId,
      metadata: {},
    });

    return { message: 'Member removed' };
  }

  async completeOnboarding(
    organizationId: string,
    userId: string,
    dto: CompleteOnboardingDto,
  ) {
    if (dto.organizationName) {
      await this.prisma.organization.update({
        where: { id: organizationId },
        data: {
          name: dto.organizationName,
          industry: dto.industry,
          size: dto.companySize,
          website: dto.website,
        },
      });
    }

    // Store extra onboarding data in activity log for now
    await this.activity.log({
      organizationId,
      userId,
      action: 'onboarding.completed',
      entityType: 'Organization',
      entityId: organizationId,
      metadata: {
        userJobTitle: dto.userJobTitle,
        hiringVolume: dto.hiringVolume,
        hiringRoles: dto.hiringRoles,
      },
    });

    return {
      message: 'Onboarding completed successfully',
      organizationId,
    };
  }
}
