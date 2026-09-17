import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@prisma/client';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) return true;

    const req = context.switchToHttp().getRequest();
    const user = req.user;
    const orgId = req.organizationId || req.headers['x-organization-id'];

    if (!user) throw new ForbiddenException('Not authenticated');
    if (user.isSuperAdmin) return true;

    const membership = user.organizations?.find(
      (o: any) => o.organizationId === orgId,
    );
    if (!membership) throw new ForbiddenException('Not a member of this organization');

    if (!requiredRoles.includes(membership.role)) {
      throw new ForbiddenException('Insufficient role');
    }

    return true;
  }
}
