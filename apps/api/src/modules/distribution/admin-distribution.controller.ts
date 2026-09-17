import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
  UseGuards,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { DistributionStatus } from '@prisma/client';
import { DistributionService } from './distribution.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('admin')
@UseGuards(JwtAuthGuard)
export class AdminDistributionController {
  constructor(private distribution: DistributionService) {}

  private assertSuperAdmin(user: any) {
    if (!user?.isSuperAdmin) {
      throw new ForbiddenException('Super Admin access required');
    }
  }

  @Get('publishing-queue')
  getQueue(@CurrentUser() user: any) {
    this.assertSuperAdmin(user);
    return this.distribution.getPublishingQueue();
  }

  @Get('distributions')
  getAll(
    @CurrentUser() user: any,
    @Query('status') status?: string,
  ) {
    this.assertSuperAdmin(user);
    let parsedStatus: DistributionStatus | undefined;
    if (status) {
      if (!Object.values(DistributionStatus).includes(status as DistributionStatus)) {
        throw new BadRequestException('Invalid status');
      }
      parsedStatus = status as DistributionStatus;
    }
    return this.distribution.getAllDistributions(parsedStatus);
  }

  @Post('distributions/:id/mark-published')
  markPublished(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body('externalJobId') externalJobId?: string,
  ) {
    this.assertSuperAdmin(user);
    return this.distribution.markPublished(id, user.id, externalJobId);
  }

  @Post('distributions/:id/reject')
  reject(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body('reason') reason: string,
  ) {
    this.assertSuperAdmin(user);
    if (!reason) throw new BadRequestException('Reason is required');
    return this.distribution.reject(id, user.id, reason);
  }
}
