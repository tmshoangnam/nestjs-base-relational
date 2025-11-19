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
        name: RoleEnum.user,
      },
    });

    if (!countUser) {
      const userRole = this.repository.create({
        name: RoleEnum.user,
        description: 'Regular user with basic permissions',
      });

      await this.repository.save(userRole);
    }

    // Create Admin role
    const countAdmin = await this.repository.count({
      where: {
        name: RoleEnum.admin,
      },
    });

    if (!countAdmin) {
      const adminRole = this.repository.create({
        name: RoleEnum.admin,
        description: 'Administrator with full permissions',
      });

      await this.repository.save(adminRole);
    }
  }
}
