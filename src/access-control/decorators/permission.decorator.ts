import { SetMetadata } from '@nestjs/common';

export const Permission = (permissionCode: string) =>
  SetMetadata('permission', permissionCode);

export const RequirePermissions = (...permissionCodes: string[]) =>
  SetMetadata('permissions', permissionCodes);

export const RequireAnyPermission = (...permissionCodes: string[]) =>
  SetMetadata('requireAnyPermission', permissionCodes);
