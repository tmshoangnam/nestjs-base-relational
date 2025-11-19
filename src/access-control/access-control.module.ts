import { Module, forwardRef } from '@nestjs/common';
import { PermissionGuard } from './guards/permission.guard';
import { UsersModule } from '../users/users.module';
import { RolesModule } from '../roles/roles.module';

@Module({
  imports: [forwardRef(() => UsersModule), forwardRef(() => RolesModule)],
  providers: [PermissionGuard],
  exports: [PermissionGuard],
})
export class AccessControlModule {}
