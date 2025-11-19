import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.getAllAndOverride<(number | string)[]>(
      'roles',
      [context.getClass(), context.getHandler()],
    );
    if (!roles.length) {
      return true;
    }
    const request = context.switchToHttp().getRequest();
    const userRoles = request?.user?.roles;
    console.log('userRoles: ', userRoles);
    if (userRoles?.length === 0) {
      throw new ForbiddenException('User not have any role');
    }
    const hasRole = roles.some((role) => userRoles.includes(role));
    console.log('hasRole: ', hasRole);
    return hasRole;
  }
}
