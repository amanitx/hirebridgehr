import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { ApplicationsService } from './applications.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CurrentOrg } from '../../common/decorators/current-org.decorator';
import { CreateApplicationDto } from './dto/create-application.dto';
import { ListApplicationsDto } from './dto/list-applications.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { RejectApplicationDto } from './dto/reject-application.dto';

@Controller('applications')
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
export class ApplicationsController {
  constructor(private applications: ApplicationsService) {}

  @Post()
  @Roles(Role.OWNER, Role.ADMIN, Role.RECRUITER)
  create(
    @CurrentOrg() orgId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CreateApplicationDto,
  ) {
    return this.applications.create(orgId, userId, dto);
  }

  @Get()
  list(@CurrentOrg() orgId: string, @Query() filters: ListApplicationsDto) {
    return this.applications.list(orgId, filters);
  }

  @Get(':id')
  findOne(@CurrentOrg() orgId: string, @Param('id') id: string) {
    return this.applications.findOne(orgId, id);
  }

  @Patch(':id/status')
  @Roles(Role.OWNER, Role.ADMIN, Role.RECRUITER, Role.HIRING_MANAGER)
  updateStatus(
    @CurrentOrg() orgId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateStatusDto,
  ) {
    return this.applications.updateStatus(orgId, userId, id, dto.status);
  }

  @Post(':id/reject')
  @Roles(Role.OWNER, Role.ADMIN, Role.RECRUITER, Role.HIRING_MANAGER)
  reject(
    @CurrentOrg() orgId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: RejectApplicationDto,
  ) {
    return this.applications.reject(orgId, userId, id, dto.reason);
  }

  @Post(':id/withdraw')
  @Roles(Role.OWNER, Role.ADMIN, Role.RECRUITER)
  withdraw(
    @CurrentOrg() orgId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ) {
    return this.applications.withdraw(orgId, userId, id);
  }
}
