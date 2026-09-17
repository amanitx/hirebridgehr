import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';

@Injectable()
export class TenantGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const user = req.user;

    if (!user) throw new ForbiddenException('Not authenticated');

    // Super admin can pass org id via header, or null for platform-wide
    if (user.isSuperAdmin) {
      req.organizationId = req.headers['x-organization-id'] || null;
      return true;
    }

    const orgId =
      req.headers['x-organization-id'] || user.organizations?.[0]?.organizationId;

    if (!orgId) throw new ForbiddenException('No organization context');

    const belongs = user.organizations?.some(
      (o: any) => o.organizationId === orgId,
    );
    if (!belongs) throw new ForbiddenException('Not a member of this organization');

    req.organizationId = orgId;
    return true;
  }
}
