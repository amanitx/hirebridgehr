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
import { CandidatesService } from './candidates.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CurrentOrg } from '../../common/decorators/current-org.decorator';
import { CreateCandidateDto } from './dto/create-candidate.dto';
import { UpdateCandidateDto } from './dto/update-candidate.dto';
import { ListCandidatesDto } from './dto/list-candidates.dto';
import { AssignCandidateDto } from './dto/assign-candidate.dto';

@Controller('candidates')
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
export class CandidatesController {
  constructor(private candidates: CandidatesService) {}

  @Post()
  @Roles(Role.OWNER, Role.ADMIN, Role.RECRUITER)
  create(
    @CurrentOrg() orgId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CreateCandidateDto,
  ) {
    return this.candidates.create(orgId, userId, dto);
  }

  @Get()
  list(@CurrentOrg() orgId: string, @Query() filters: ListCandidatesDto) {
    return this.candidates.list(orgId, filters);
  }

  @Get(':id')
  findOne(@CurrentOrg() orgId: string, @Param('id') id: string) {
    return this.candidates.findOne(orgId, id);
  }

  @Patch(':id')
  @Roles(Role.OWNER, Role.ADMIN, Role.RECRUITER)
  update(
    @CurrentOrg() orgId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateCandidateDto,
  ) {
    return this.candidates.update(orgId, userId, id, dto);
  }

  @Delete(':id')
  @Roles(Role.OWNER, Role.ADMIN)
  remove(
    @CurrentOrg() orgId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ) {
    return this.candidates.remove(orgId, userId, id);
  }

  @Post(':id/assign')
  @Roles(Role.OWNER, Role.ADMIN)
  assign(
    @CurrentOrg() orgId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: AssignCandidateDto,
  ) {
    return this.candidates.assign(orgId, userId, id, dto.ownerId);
  }
}
