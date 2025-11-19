import { Injectable, NotFoundException } from '@nestjs/common';
import { RoleRepository } from './infrastructure/persistence/relational/repositories/role.repository';
import { Role } from './domain/role';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { NullableType } from '../utils/types/nullable.type';

@Injectable()
export class RolesService {
  constructor(private readonly roleRepository: RoleRepository) {}

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
    return this.roleRepository.findByName(name);
  }

  async update(id: Role['id'], updateRoleDto: UpdateRoleDto): Promise<Role> {
    const role = await this.roleRepository.update(id, updateRoleDto);

    if (!role) {
      throw new NotFoundException({
        status: 'error',
        message: 'Role not found',
      });
    }

    return role;
  }

  async remove(id: Role['id']): Promise<void> {
    const role = await this.roleRepository.findById(id);

    if (!role) {
      throw new NotFoundException({
        status: 'error',
        message: 'Role not found',
      });
    }

    await this.roleRepository.remove(id);
  }
}
