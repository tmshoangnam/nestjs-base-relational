import { Injectable } from '@nestjs/common';
import { RoleRepository } from './infrastructure/persistence/relational/repositories/role.repository';
import { Role } from './domain/role';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { NullableType } from '../utils/types/nullable.type';
import { BusinessException } from '../common/exception/business.exception';
import { AppCacheService } from '../common/cache/application/services/cache.service';
import { getMessage } from '../common/exception/message.helper';
import { MessagesEnum } from '../common/exception/messages.enum';

@Injectable()
export class RolesService {
  constructor(
    private readonly roleRepository: RoleRepository,
    private readonly cache: AppCacheService,
  ) {}

  async create(createRoleDto: CreateRoleDto): Promise<Role> {
    // Check if role already exists
    const existingRole = await this.roleRepository.findByName(
      createRoleDto.name,
    );

    if (existingRole) {
      throw new Error(`Role ${createRoleDto.name} already exists`);
    }

    return this.roleRepository.create(createRoleDto);
  }

  async findMany(): Promise<Role[]> {
    return this.roleRepository.findMany();
  }

  async findById(id: Role['id']): Promise<NullableType<Role>> {
    return this.roleRepository.findById(id);
  }

  async findByIds(ids: Role['id'][]): Promise<Role[]> {
    return this.roleRepository.findByIds(ids);
  }

  async findByName(name: string): Promise<NullableType<Role>> {
    const role = await this.cache.get(`role:${name}`);
    if (role) {
      return role as Role;
    }
    const roleEntity = await this.roleRepository.findByName(name);
    if (!roleEntity) {
      throw BusinessException.notFound(`Role ${name} not found`);
    }
    await this.cache.set(`role:${name}`, roleEntity);
    return roleEntity as Role;
  }

  async update(id: Role['id'], updateRoleDto: UpdateRoleDto): Promise<Role> {
    const role = await this.roleRepository.update(id, updateRoleDto);

    if (!role) {
      throw BusinessException.notFound(
        getMessage(MessagesEnum.ROLE_NOT_EXISTS),
      );
    }

    return role;
  }

  async remove(id: Role['id']): Promise<void> {
    const role = await this.roleRepository.findById(id);

    if (!role) {
      throw BusinessException.notFound(
        getMessage(MessagesEnum.ROLE_NOT_EXISTS),
      );
    }

    await this.roleRepository.remove(id);
  }
}
