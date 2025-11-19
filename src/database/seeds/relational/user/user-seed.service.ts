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
    const countAdmin = await this.repository.count({
      where: {
        roles: {
          name: RoleEnum.admin,
        },
      },
    });

    if (!countAdmin) {
      const salt = await bcrypt.genSalt();
      const password = await bcrypt.hash('secret', salt);

      // Get the admin role and status from database
      const adminRole = await this.roleRepository.findOne({
        where: { name: RoleEnum.admin },
      });
      if (!adminRole) {
        throw new Error('Required role not found in database');
      }

      await this.repository.save(
        this.repository.create({
          firstName: 'Super',
          lastName: 'Admin',
          email: 'admin@example.com',
          password,
          roles: [adminRole],
        }),
      );
    }

    const countUser = await this.repository.count({
      where: {
        roles: {
          name: RoleEnum.user,
        },
      },
    });

    if (!countUser) {
      const salt = await bcrypt.genSalt();
      const password = await bcrypt.hash('secret', salt);

      // Get the user role and status from database
      const userRole = await this.roleRepository.findOne({
        where: { name: RoleEnum.user },
      });

      if (!userRole) {
        throw new Error('Required role not found in database');
      }

      await this.repository.save(
        this.repository.create({
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
          password,
          roles: [userRole],
        }),
      );
    }
  }
}
