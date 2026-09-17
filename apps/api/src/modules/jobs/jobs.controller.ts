import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { JobsService } from './jobs.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CurrentOrg } from '../../common/decorators/current-org.decorator';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { ListJobsDto } from './dto/list-jobs.dto';
import { PublishJobDto } from './dto/publish-job.dto';

@Controller('jobs')
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
export class JobsController {
  constructor(private jobs: JobsService) {}

  @Post()
  @Roles(Role.OWNER, Role.ADMIN, Role.RECRUITER)
  create(
    @CurrentOrg() orgId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CreateJobDto,
  ) {
    return this.jobs.create(orgId, userId, dto);
  }

  @Get()
  list(@CurrentOrg() orgId: string, @Query() filters: ListJobsDto) {
    return this.jobs.list(orgId, filters);
  }

  @Get(':id')
  findOne(@CurrentOrg() orgId: string, @Param('id') id: string) {
    return this.jobs.findOne(orgId, id);
  }

  @Patch(':id')
  @Roles(Role.OWNER, Role.ADMIN, Role.RECRUITER)
  update(
    @CurrentOrg() orgId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateJobDto,
  ) {
    return this.jobs.update(orgId, userId, id, dto);
  }

  @Delete(':id')
  @Roles(Role.OWNER, Role.ADMIN)
  remove(
    @CurrentOrg() orgId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ) {
    return this.jobs.remove(orgId, userId, id);
  }

  @Post(':id/publish')
  @Roles(Role.OWNER, Role.ADMIN, Role.RECRUITER)
  publish(
    @CurrentOrg() orgId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: PublishJobDto,
  ) {
    return this.jobs.publish(orgId, userId, id, dto.platforms);
  }

  @Post(':id/close')
  @Roles(Role.OWNER, Role.ADMIN)
  close(
    @CurrentOrg() orgId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ) {
    return this.jobs.close(orgId, userId, id);
  }

  @Get(':id/distributions')
  getDistributions(@CurrentOrg() orgId: string, @Param('id') id: string) {
    return this.jobs.getDistributions(orgId, id);
  }
}
