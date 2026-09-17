import {
  Controller,
  Get,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('admin/analytics')
@UseGuards(JwtAuthGuard)
export class AdminAnalyticsController {
  constructor(private analytics: AnalyticsService) {}

  @Get()
  platform(@CurrentUser() user: any) {
    if (!user?.isSuperAdmin) {
      throw new ForbiddenException('Super Admin access required');
    }
    return this.analytics.platformStats();
  }
}
