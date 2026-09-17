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
import { InterviewsService } from './interviews.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CurrentOrg } from '../../common/decorators/current-org.decorator';
import { CreateInterviewDto } from './dto/create-interview.dto';
import { UpdateInterviewDto } from './dto/update-interview.dto';
import { UpdateInterviewStatusDto } from './dto/update-interview-status.dto';
import { SubmitFeedbackDto } from './dto/submit-feedback.dto';
import { ListInterviewsDto } from './dto/list-interviews.dto';

@Controller('interviews')
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
export class InterviewsController {
  constructor(private interviews: InterviewsService) {}

  @Post()
  @Roles(Role.OWNER, Role.ADMIN, Role.RECRUITER, Role.HIRING_MANAGER)
  schedule(
    @CurrentOrg() orgId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CreateInterviewDto,
  ) {
    return this.interviews.schedule(orgId, userId, dto);
  }

  @Get()
  list(
    @CurrentOrg() orgId: string,
    @CurrentUser('id') userId: string,
    @Query() filters: ListInterviewsDto,
  ) {
    return this.interviews.list(orgId, userId, filters);
  }

  @Get('my-feedback-pending')
  myFeedbackPending(
    @CurrentOrg() orgId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.interviews.myFeedbackPending(orgId, userId);
  }

  @Get(':id')
  findOne(@CurrentOrg() orgId: string, @Param('id') id: string) {
    return this.interviews.findOne(orgId, id);
  }

  @Patch(':id')
  @Roles(Role.OWNER, Role.ADMIN, Role.RECRUITER, Role.HIRING_MANAGER)
  update(
    @CurrentOrg() orgId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateInterviewDto,
  ) {
    return this.interviews.update(orgId, userId, id, dto);
  }

  @Patch(':id/status')
  @Roles(Role.OWNER, Role.ADMIN, Role.RECRUITER, Role.HIRING_MANAGER, Role.INTERVIEWER)
  updateStatus(
    @CurrentOrg() orgId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateInterviewStatusDto,
  ) {
    return this.interviews.updateStatus(orgId, userId, id, dto.status);
  }

  @Delete(':id')
  @Roles(Role.OWNER, Role.ADMIN, Role.RECRUITER)
  cancel(
    @CurrentOrg() orgId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ) {
    return this.interviews.cancel(orgId, userId, id);
  }

  @Post(':id/feedback')
  submitFeedback(
    @CurrentOrg() orgId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: SubmitFeedbackDto,
  ) {
    return this.interviews.submitFeedback(orgId, userId, id, dto);
  }

  @Get(':id/feedback')
  listFeedback(@CurrentOrg() orgId: string, @Param('id') id: string) {
    return this.interviews.listFeedback(orgId, id);
  }
}
