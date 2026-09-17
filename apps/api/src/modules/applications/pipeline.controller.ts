import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApplicationsService } from './applications.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { CurrentOrg } from '../../common/decorators/current-org.decorator';

@Controller('jobs/:jobId/pipeline')
@UseGuards(JwtAuthGuard, TenantGuard)
export class PipelineController {
  constructor(private applications: ApplicationsService) {}

  @Get()
  getPipeline(@CurrentOrg() orgId: string, @Param('jobId') jobId: string) {
    return this.applications.getPipeline(orgId, jobId);
  }
}
