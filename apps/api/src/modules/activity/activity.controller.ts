import { Controller, Get, UseGuards, Query } from '@nestjs/common';
import { ActivityService } from './activity.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { CurrentOrg } from '../../common/decorators/current-org.decorator';

@Controller('activity')
@UseGuards(JwtAuthGuard, TenantGuard)
export class ActivityController {
  constructor(private activity: ActivityService) {}

  @Get()
  list(@CurrentOrg() orgId: string, @Query('limit') limit?: string) {
    return this.activity.list(orgId, limit ? parseInt(limit, 10) : 50);
  }
}
