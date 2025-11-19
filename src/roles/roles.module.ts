import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoleEntity } from './infrastructure/persistence/relational/entities/role.entity';
import { RoleRepository } from './infrastructure/persistence/relational/repositories/role.repository';
import { RolesService } from './roles.service';
import { RolesController } from './roles.controller';

@Module({
  imports: [TypeOrmModule.forFeature([RoleEntity])],
  controllers: [RolesController],
  providers: [RolesService, RoleRepository],
  exports: [RolesService, RoleRepository],
})
export class RolesModule {}
