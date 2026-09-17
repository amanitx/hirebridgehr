import {
  Controller,
  Get,
  Patch,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { OrganizationsService } from './organizations.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CurrentOrg } from '../../common/decorators/current-org.decorator';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { InviteMemberDto } from './dto/invite-member.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

@Controller('organizations')
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
export class OrganizationsController {
  constructor(private orgs: OrganizationsService) {}

  @Get('me')
  getCurrent(@CurrentOrg() orgId: string) {
    return this.orgs.getCurrent(orgId);
  }

  @Patch('me')
  @Roles(Role.OWNER, Role.ADMIN)
  update(
    @CurrentOrg() orgId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateOrganizationDto,
  ) {
    return this.orgs.update(orgId, userId, dto);
  }

  @Get('me/members')
  listMembers(@CurrentOrg() orgId: string) {
    return this.orgs.listMembers(orgId);
  }

  @Post('me/members/invite')
  @Roles(Role.OWNER, Role.ADMIN)
  inviteMember(
    @CurrentOrg() orgId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: InviteMemberDto,
  ) {
    return this.orgs.inviteMember(orgId, userId, dto);
  }

  @Patch('me/members/:userId/role')
  @Roles(Role.OWNER)
  updateRole(
    @CurrentOrg() orgId: string,
    @CurrentUser('id') actorId: string,
    @Param('userId') targetUserId: string,
    @Body() dto: UpdateRoleDto,
  ) {
    return this.orgs.updateMemberRole(orgId, actorId, targetUserId, dto.role);
  }

  @Delete('me/members/:userId')
  @Roles(Role.OWNER)
  removeMember(
    @CurrentOrg() orgId: string,
    @CurrentUser('id') actorId: string,
    @Param('userId') targetUserId: string,
  ) {
    return this.orgs.removeMember(orgId, actorId, targetUserId);
  }
}
