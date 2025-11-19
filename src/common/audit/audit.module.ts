// audit.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditSubscriber } from './audit-subscriber';

@Module({
  imports: [TypeOrmModule.forFeature([])], // required để kết nối subscribers
  providers: [AuditSubscriber],
})
export class AuditModule {}
