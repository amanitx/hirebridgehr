import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import {
  ApplicationStatus,
  InterviewStatus,
  Role,
} from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { ActivityService } from '../activity/activity.service';
import { NotificationsService } from '../notifications/notifications.service';
import { EmailService } from '../email/email.service';
import { CreateInterviewDto } from './dto/create-interview.dto';
import { UpdateInterviewDto } from './dto/update-interview.dto';
import { SubmitFeedbackDto } from './dto/submit-feedback.dto';

@Injectable()
export class InterviewsService {
  constructor(
    private prisma: PrismaService,
    private activity: ActivityService,
    private notifications: NotificationsService,
    private email: EmailService,
  ) {}

  async schedule(organizationId: string, userId: string, dto: CreateInterviewDto) {
    const [candidate, job, interviewerMembership] = await Promise.all([
      this.prisma.candidate.findFirst({
        where: { id: dto.candidateId, organizationId },
      }),
      this.prisma.job.findFirst({
        where: { id: dto.jobId, organizationId },
      }),
      this.prisma.organizationUser.findUnique({
        where: {
          organizationId_userId: {
            organizationId,
            userId: dto.interviewerId,
          },
        },
        include: { user: true },
      }),
    ]);

    if (!candidate) throw new NotFoundException('Candidate not found');
    if (!job) throw new NotFoundException('Job not found');
    if (!interviewerMembership) {
      throw new NotFoundException('Interviewer is not a member of this organization');
    }

    const interview = await this.prisma.interview.create({
      data: {
        organizationId,
        candidateId: dto.candidateId,
        jobId: dto.jobId,
        interviewerId: dto.interviewerId,
        scheduledAt: new Date(dto.scheduledAt),
        durationMin: dto.durationMin || 60,
        type: dto.type || 'VIDEO',
        meetingLink: dto.meetingLink,
        notes: dto.notes,
        status: InterviewStatus.SCHEDULED,
      },
      include: {
        job: { select: { id: true, title: true } },
      },
    });

    // Fetch candidate name for notification
    const cand = await this.prisma.candidate.findUnique({
      where: { id: dto.candidateId },
      select: { name: true },
    });

    // Auto-create application if not exists + move to INTERVIEW stage
    const existingApp = await this.prisma.application.findUnique({
      where: {
        candidateId_jobId: {
          candidateId: dto.candidateId,
          jobId: dto.jobId,
        },
      },
    });

    if (existingApp) {
      if (existingApp.status !== ApplicationStatus.INTERVIEW) {
        await this.prisma.application.update({
          where: { id: existingApp.id },
          data: { status: ApplicationStatus.INTERVIEW },
        });
      }
    } else {
      await this.prisma.application.create({
        data: {
          organizationId,
          candidateId: dto.candidateId,
          jobId: dto.jobId,
          source: 'MANUAL',
          status: ApplicationStatus.INTERVIEW,
        },
      });
    }

    // Notify interviewer
    await this.notifications.create({
      organizationId,
      userId: dto.interviewerId,
      title: 'New interview assigned',
      body: `Interview with ${cand?.name} for ${job.title} on ${new Date(dto.scheduledAt).toLocaleString()}`,
      type: 'INTERVIEW_SCHEDULED',
      link: `/interviews/${interview.id}`,
    });

    // Email interviewer
    await this.email.send(
      interviewerMembership.user.email,
      `Interview scheduled: ${cand?.name} — ${job.title}`,
      `<h2>New Interview Assigned</h2>
       <p>Candidate: <b>${cand?.name}</b></p>
       <p>Job: <b>${job.title}</b></p>
       <p>Time: ${new Date(dto.scheduledAt).toLocaleString()}</p>
       <p>Type: ${dto.type || 'VIDEO'}</p>
       ${dto.meetingLink ? `<p>Link: <a href="${dto.meetingLink}">${dto.meetingLink}</a></p>` : ''}`,
      'interview-scheduled',
    );

    await this.activity.log({
      organizationId,
      userId,
      action: 'interview.scheduled',
      entityType: 'Interview',
      entityId: interview.id,
      metadata: {
        candidateName: cand?.name,
        jobTitle: job.title,
        scheduledAt: dto.scheduledAt,
        interviewerId: dto.interviewerId,
      },
    });

    return interview;
  }

  async list(organizationId: string, userId: string, filters: any) {
    const where: any = { organizationId };

    if (filters.status) where.status = filters.status;
    if (filters.candidateId) where.candidateId = filters.candidateId;
    if (filters.jobId) where.jobId = filters.jobId;
    if (filters.interviewerId) where.interviewerId = filters.interviewerId;
    if (filters.upcoming) where.scheduledAt = { gte: new Date() };

    return this.prisma.interview.findMany({
      where,
      orderBy: { scheduledAt: 'asc' },
      include: {
        job: { select: { id: true, title: true } },
        interviewer: { select: { id: true, name: true, email: true } },
        feedback: {
          select: { id: true, recommendation: true, overall: true },
        },
      },
    });
  }

  async findOne(organizationId: string, id: string) {
    const interview = await this.prisma.interview.findFirst({
      where: { id, organizationId },
      include: {
        job: { select: { id: true, title: true, location: true } },
        interviewer: { select: { id: true, name: true, email: true } },
        feedback: {
          include: {
            interviewer: { select: { id: true, name: true, email: true } },
          },
        },
      },
    });
    if (!interview) throw new NotFoundException('Interview not found');

    const candidate = await this.prisma.candidate.findUnique({
      where: { id: interview.candidateId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        skills: true,
        experience: true,
        location: true,
      },
    });

    return { ...interview, candidate };
  }

  async update(
    organizationId: string,
    userId: string,
    id: string,
    dto: UpdateInterviewDto,
  ) {
    const interview = await this.prisma.interview.findFirst({
      where: { id, organizationId },
    });
    if (!interview) throw new NotFoundException('Interview not found');

    const updated = await this.prisma.interview.update({
      where: { id },
      data: {
        ...dto,
        scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : undefined,
      },
    });

    await this.activity.log({
      organizationId,
      userId,
      action: 'interview.updated',
      entityType: 'Interview',
      entityId: id,
      metadata: { fields: Object.keys(dto) },
    });

    return updated;
  }

  async updateStatus(
    organizationId: string,
    userId: string,
    id: string,
    status: InterviewStatus,
  ) {
    const interview = await this.prisma.interview.findFirst({
      where: { id, organizationId },
    });
    if (!interview) throw new NotFoundException('Interview not found');

    const updated = await this.prisma.interview.update({
      where: { id },
      data: { status },
    });

    await this.activity.log({
      organizationId,
      userId,
      action: 'interview.status_changed',
      entityType: 'Interview',
      entityId: id,
      metadata: { from: interview.status, to: status },
    });

    return updated;
  }

  async cancel(organizationId: string, userId: string, id: string) {
    const interview = await this.prisma.interview.findFirst({
      where: { id, organizationId },
    });
    if (!interview) throw new NotFoundException('Interview not found');

    await this.prisma.interview.update({
      where: { id },
      data: { status: InterviewStatus.CANCELLED },
    });

    await this.activity.log({
      organizationId,
      userId,
      action: 'interview.cancelled',
      entityType: 'Interview',
      entityId: id,
      metadata: {},
    });

    return { message: 'Interview cancelled' };
  }

  async submitFeedback(
    organizationId: string,
    userId: string,
    interviewId: string,
    dto: SubmitFeedbackDto,
  ) {
    const interview = await this.prisma.interview.findFirst({
      where: { id: interviewId, organizationId },
      include: {
        job: { select: { title: true } },
      },
    });
    if (!interview) throw new NotFoundException('Interview not found');

    // Only assigned interviewer OR admin/owner
    const membership = await this.prisma.organizationUser.findUnique({
      where: { organizationId_userId: { organizationId, userId } },
    });
    const adminRoles: Role[] = [Role.OWNER, Role.ADMIN];
    const isAdmin = membership && adminRoles.includes(membership.role);

    if (interview.interviewerId !== userId && !isAdmin) {
      throw new ForbiddenException(
        'Only the assigned interviewer can submit feedback',
      );
    }

    const existing = await this.prisma.interviewFeedback.findFirst({
      where: { interviewId, interviewerId: userId },
    });
    if (existing) {
      throw new BadRequestException('You have already submitted feedback for this interview');
    }

    const feedback = await this.prisma.interviewFeedback.create({
      data: {
        interviewId,
        interviewerId: userId,
        technical: dto.technical,
        communication: dto.communication,
        problemSolving: dto.problemSolving,
        experience: dto.experience,
        overall: dto.overall,
        recommendation: dto.recommendation,
        comments: dto.comments,
      },
    });

    // Auto-mark interview as completed
    if (interview.status !== InterviewStatus.COMPLETED) {
      await this.prisma.interview.update({
        where: { id: interviewId },
        data: { status: InterviewStatus.COMPLETED },
      });
    }

    const cand = await this.prisma.candidate.findUnique({
      where: { id: interview.candidateId },
      select: { name: true },
    });

    await this.notifications.create({
      organizationId,
      userId: interview.interviewerId,
      title: 'Feedback submitted',
      body: `Feedback for ${cand?.name} (${interview.job.title}) — ${dto.recommendation}`,
      type: 'FEEDBACK_SUBMITTED',
      link: `/interviews/${interviewId}`,
    });

    await this.activity.log({
      organizationId,
      userId,
      action: 'interview.feedback_submitted',
      entityType: 'Interview',
      entityId: interviewId,
      metadata: {
        recommendation: dto.recommendation,
        overall: dto.overall,
        candidateName: cand?.name,
      },
    });

    return feedback;
  }

  async listFeedback(organizationId: string, interviewId: string) {
    const interview = await this.prisma.interview.findFirst({
      where: { id: interviewId, organizationId },
    });
    if (!interview) throw new NotFoundException('Interview not found');

    return this.prisma.interviewFeedback.findMany({
      where: { interviewId },
      orderBy: { createdAt: 'desc' },
      include: {
        interviewer: { select: { id: true, name: true, email: true } },
      },
    });
  }

  /**
   * Get interviews where current user is interviewer and no feedback yet.
   */
  async myFeedbackPending(organizationId: string, userId: string) {
    const interviews = await this.prisma.interview.findMany({
      where: {
        organizationId,
        interviewerId: userId,
        status: { in: [InterviewStatus.SCHEDULED, InterviewStatus.COMPLETED] },
        feedback: { none: { interviewerId: userId } },
      },
      orderBy: { scheduledAt: 'asc' },
      include: {
        job: { select: { id: true, title: true } },
      },
    });

    const candidateIds = interviews.map((i) => i.candidateId);
    const candidates = await this.prisma.candidate.findMany({
      where: { id: { in: candidateIds } },
      select: { id: true, name: true, email: true, skills: true },
    });

    return interviews.map((i) => ({
      ...i,
      candidate: candidates.find((c) => c.id === i.candidateId),
    }));
  }
}
