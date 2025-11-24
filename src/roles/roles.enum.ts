export enum RoleEnum {
  'SYSTEM_ADMIN' = 'SYSTEM_ADMIN',
  'ADMIN' = 'ADMIN',
  'USER' = 'USER',
}

const USER_PERMISSIONS: string[] = [
  // Service page
  'service:view',

  // Auth
  'auth:login',
  'auth:logout',

  // Form Builder & templates
  'form:create',
  'form:edit',
  'form:delete',
  'form:preview',
  'form:diagnosis:select',
  'form:finalUrl:set',

  // Embedding
  'embed:issue',
  'embed:customize',
  'embed:displayMode',

  // Template management
  'template:create',
  'template:edit',
  'template:delete',

  // Dashboard
  'dashboard:view',
  'dashboard:report:generate',

  // Account management (view and update only; create/delete NOT included)
  'account:view',
  'account:update',

  // Form submission
  'form:submit',
];

export const permissionRoles: Record<RoleEnum, string[]> = {
  [RoleEnum.SYSTEM_ADMIN]: ['*'],

  // Tenant admin has full tenant-level permissions
  [RoleEnum.ADMIN]: [...USER_PERMISSIONS, 'account:create', 'account:delete'],

  // Tenant user: full client features except creating/deleting editor accounts
  [RoleEnum.USER]: [...USER_PERMISSIONS],
};

export const getRolePermissions = (role: RoleEnum[]): string[] => {
  const permissions = new Set<string>();

  role.forEach((r) => {
    const perms = permissionRoles[r];
    if (perms) {
      perms.forEach((p) => {
        permissions.add(p);
      });
    }
  });
  console.log('permissions2', permissions);
  return Array.from(permissions);
};
