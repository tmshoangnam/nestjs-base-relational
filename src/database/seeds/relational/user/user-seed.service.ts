import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';
import bcrypt from 'bcryptjs';
import { RoleEnum } from '../../../../roles/roles.enum';
import { UserEntity } from '../../../../users/infrastructure/persistence/relational/entities/user.entity';
import { RoleEntity } from '../../../../roles/infrastructure/persistence/relational/entities/role.entity';

@Injectable()
export class UserSeedService {
  constructor(
    @InjectRepository(UserEntity)
    private repository: Repository<UserEntity>,
    @InjectRepository(RoleEntity)
    private roleRepository: Repository<RoleEntity>,
  ) {}

  async run() {
    const countSystemAdmin = await this.repository.count({
      where: {
        roles: {
          name: RoleEnum.SYSTEM_ADMIN,
        },
      },
    });

    if (!countSystemAdmin) {
      const salt = await bcrypt.genSalt();
      const password = await bcrypt.hash('secret', salt);

      // Get the system admin role and status from database
      const systemAdminRole = await this.roleRepository.findOne({
        where: { name: RoleEnum.SYSTEM_ADMIN },
      });
      if (!systemAdminRole) {
        throw new Error('Required role not found in database');
      }

      await this.repository.save(
        this.repository.create({
          firstName: 'Super',
          lastName: 'Admin',
          email: 'admin@example.com',
          password,
          roles: [systemAdminRole],
        }),
      );
    }

    const countTenantAdmin = await this.repository.count({
      where: {
        roles: {
          name: RoleEnum.ADMIN,
        },
      },
    });

    if (!countTenantAdmin) {
      const salt = await bcrypt.genSalt();
      const password = await bcrypt.hash('secret', salt);

      // Get the tenant admin role and status from database
      const tenantAdminRole = await this.roleRepository.findOne({
        where: { name: RoleEnum.ADMIN },
      });

      if (!tenantAdminRole) {
        throw new Error('Required role not found in database');
      }

      await this.repository.save(
        this.repository.create({
          firstName: 'John',
          lastName: 'Doe',
          email: 'tenant.admin@example.com',
          password,
          roles: [tenantAdminRole],
        }),
      );
    }

    const countTenantUser = await this.repository.count({
      where: {
        roles: {
          name: RoleEnum.USER,
        },
      },
    });
    if (!countTenantUser) {
      const salt = await bcrypt.genSalt();
      const password = await bcrypt.hash('secret', salt);
      // Get the tenant user role and status from database
      const tenantUserRole = await this.roleRepository.findOne({
        where: { name: RoleEnum.USER },
      });
      if (!tenantUserRole) {
        throw new Error('Required role not found in database');
      }
      await this.repository.save(
        this.repository.create({
          firstName: 'Jane',
          lastName: 'Smith',
          email: 'tenant.user@example.com',
          password,
          roles: [tenantUserRole],
        }),
      );
    }
  }
}
