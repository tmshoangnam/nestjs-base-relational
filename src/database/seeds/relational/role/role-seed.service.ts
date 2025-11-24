import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RoleEntity } from '../../../../roles/infrastructure/persistence/relational/entities/role.entity';
import { RoleEnum } from '../../../../roles/roles.enum';

@Injectable()
export class RoleSeedService {
  constructor(
    @InjectRepository(RoleEntity)
    private repository: Repository<RoleEntity>,
  ) {}

  async run() {
    // Create User role
    const countUser = await this.repository.count({
      where: {
        name: RoleEnum.USER,
      },
    });

    if (!countUser) {
      const userRole = this.repository.create({
        name: RoleEnum.USER,
        description: 'Regular user with basic permissions',
      });

      await this.repository.save(userRole);
    }

    // Create Admin role
    const countAdmin = await this.repository.count({
      where: {
        name: RoleEnum.ADMIN,
      },
    });

    if (!countAdmin) {
      const adminRole = this.repository.create({
        name: RoleEnum.ADMIN,
        description: 'Administrator with full permissions',
      });

      await this.repository.save(adminRole);
    }

    // Create Super Admin role
    const countSuperAdmin = await this.repository.count({
      where: {
        name: RoleEnum.SYSTEM_ADMIN,
      },
    });

    if (!countSuperAdmin) {
      const superAdminRole = this.repository.create({
        name: RoleEnum.SYSTEM_ADMIN,
        description: 'Administrator with full permissions',
      });

      await this.repository.save(superAdminRole);
    }
  }
}
