import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(private prisma: PrismaService) {}

  async create(params: {
    organizationId: string;
    userId: string;
    title: string;
    body?: string;
    type: string;
    link?: string;
  }) {
    try {
      return await this.prisma.notification.create({
        data: {
          organizationId: params.organizationId,
          userId: params.userId,
          title: params.title,
          body: params.body,
          type: params.type,
          link: params.link,
        },
      });
    } catch (err) {
      this.logger.error(`Failed to create notification: ${err.message}`);
      return null;
    }
  }

  async createMany(
    params: {
      organizationId: string;
      userId: string;
      title: string;
      body?: string;
      type: string;
      link?: string;
    }[],
  ) {
    if (!params.length) return [];
    return Promise.all(params.map((p) => this.create(p)));
  }

  async list(userId: string, unreadOnly = false, limit = 50) {
    return this.prisma.notification.findMany({
      where: { userId, ...(unreadOnly ? { read: false } : {}) },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async unreadCount(userId: string) {
    return this.prisma.notification.count({
      where: { userId, read: false },
    });
  }

  async markRead(userId: string, id: string) {
    const notif = await this.prisma.notification.findFirst({
      where: { id, userId },
    });
    if (!notif) return null;
    return this.prisma.notification.update({
      where: { id },
      data: { read: true },
    });
  }

  async markAllRead(userId: string) {
    await this.prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });
    return { message: 'All marked as read' };
  }
}
