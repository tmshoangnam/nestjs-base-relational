import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { RoleEntity } from '../entities/role.entity';
import { Role } from '../../../../domain/role';
import { CreateRoleDto } from '../../../../dto/create-role.dto';
import { UpdateRoleDto } from '../../../../dto/update-role.dto';
import { NullableType } from '../../../../../utils/types/nullable.type';

@Injectable()
export class RoleRepository {
  constructor(
    @InjectRepository(RoleEntity)
    private roleRepository: Repository<RoleEntity>,
  ) {}

  async create(data: CreateRoleDto): Promise<Role> {
    const role = this.roleRepository.create({
      name: data.name,
      description: data.description,
    });

    const savedRole = await this.roleRepository.save(role);
    return this.toDomain(savedRole);
  }

  async findMany(): Promise<Role[]> {
    const roles = await this.roleRepository.find({
      order: { id: 'ASC' },
    });
    return roles.map((role) => this.toDomain(role));
  }

  async findManyWithPagination({
    page,
    limit,
    name,
  }: {
    page: number;
    limit: number;
    name?: string | undefined;
  }): Promise<Role[]> {
    const qb = this.roleRepository
      .createQueryBuilder('role')
      .orderBy('role.id', 'ASC');

    if (name) {
      qb.where('role.name LIKE :name', { name: `%${name}%` });
    }

    qb.skip((page - 1) * limit).take(limit);

    const roles = await qb.getMany();
    return roles.map((role) => this.toDomain(role));
  }

  async findById(id: Role['id']): Promise<NullableType<Role>> {
    const role = await this.roleRepository.findOne({
      where: { id: Number(id) },
    });
    return role ? this.toDomain(role) : null;
  }

  async findByIds(ids: Role['id'][]): Promise<Role[]> {
    const roles = await this.roleRepository.find({
      where: { id: In(ids.map((id) => Number(id))) },
    });
    return roles.map((role) => this.toDomain(role));
  }

  async findByName(name: string): Promise<NullableType<Role>> {
    const role = await this.roleRepository.findOne({
      where: { name },
    });
    return role ? this.toDomain(role) : null;
  }

  async update(id: Role['id'], payload: UpdateRoleDto): Promise<Role | null> {
    const role = await this.roleRepository.findOne({
      where: { id: Number(id) },
    });

    if (!role) {
      return null;
    }

    Object.assign(role, {
      name: payload.name,
      description: payload.description,
    });

    const savedRole = await this.roleRepository.save(role);
    return this.toDomain(savedRole);
  }

  async remove(id: Role['id']): Promise<void> {
    await this.roleRepository.delete(id);
  }

  private toDomain(raw: RoleEntity): Role {
    return new Role({
      id: raw.id,
      name: raw.name,
      description: raw.description,
    });
  }
}
