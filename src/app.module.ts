import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { AuthGoogleModule } from './auth-google/auth-google.module';
import { MailModule } from './mail/mail.module';
import { SessionModule } from './session/session.module';
import { MailerModule } from './mailer/mailer.module';
import { RolesModule } from './roles/roles.module';
import { AccessControlModule } from './access-control/access-control.module';
import { CacheModule } from './common/cache/cache.module';
import { RedisModule } from './common/redis/redis.module';
import { APP_MODULE_CONFIG } from './config/core/app.module.config';
import { AuditModule } from './common/audit/audit.module';

@Module({
  imports: [
    ...APP_MODULE_CONFIG,
    AuditModule,
    RolesModule,
    AccessControlModule,
    RedisModule,
    CacheModule,
    UsersModule,
    AuthModule,
    AuthGoogleModule,
    SessionModule,
    MailModule,
    MailerModule,
  ],
})
export class AppModule {}
