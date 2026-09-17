import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Controller()
export class HealthController {
  constructor(private prisma: PrismaService) {}

  @Get('health')
  async health() {
    let db = 'down';
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      db = 'up';
    } catch {}

    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      db,
      version: '0.1.0',
    };
  }

  @Get('version')
  version() {
    return {
      name: 'HirebridgeHR API',
      version: '0.1.0',
      environment: process.env.NODE_ENV || 'development',
    };
  }
}
