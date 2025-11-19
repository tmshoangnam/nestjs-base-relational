import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      'permissions',
      [context.getClass(), context.getHandler()],
    );

    if (!requiredPermissions) {
      return true; // No permission required
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    if (!user || user.permissions.length === 0) {
      throw new ForbiddenException('User not have any permission');
    }

    let hasPermission = false;
    for (const permission of requiredPermissions) {
      if (user.permissions.includes(permission)) {
        hasPermission = true;
        break;
      }
    }
    return hasPermission;
  }
}
