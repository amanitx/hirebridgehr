import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { CurrentOrg } from '../../common/decorators/current-org.decorator';

@Controller('analytics')
@UseGuards(JwtAuthGuard, TenantGuard)
export class AnalyticsController {
  constructor(private analytics: AnalyticsService) {}

  @Get('overview')
  overview(@CurrentOrg() orgId: string) {
    return this.analytics.overview(orgId);
  }

  @Get('pipeline')
  pipeline(@CurrentOrg() orgId: string) {
    return this.analytics.pipelineConversion(orgId);
  }

  @Get('sources')
  sources(@CurrentOrg() orgId: string) {
    return this.analytics.sourceBreakdown(orgId);
  }

  @Get('activity')
  activity(@CurrentOrg() orgId: string, @Query('days') days?: string) {
    return this.analytics.activityOverTime(orgId, days ? parseInt(days, 10) : 30);
  }
}
