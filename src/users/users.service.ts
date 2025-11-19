import { Injectable, Logger } from '@nestjs/common';
import { BusinessException } from '../common/exception/business.exception';
import { getMessage } from '../common/exception/message.helper';
import { MessagesEnum } from '../common/exception/messages.enum';
import { CreateUserDto } from './dto/create-user.dto';
import { NullableType } from '../utils/types/nullable.type';
import { FilterUserDto, SortUserDto } from './dto/query-user.dto';
import { UserRepository } from './infrastructure/persistence/user.repository';
import { User } from './domain/user';
import bcrypt from 'bcryptjs';
import { AuthProvidersEnum } from '../auth/auth-providers.enum';
import { RoleEnum } from '../roles/roles.enum';
import { StatusEnum } from './statuses.enum';
import { IPaginationOptions } from '../utils/types/pagination-options';
import { Role } from '../roles/domain/role';
import { UpdateUserDto } from './dto/update-user.dto';
import { RolesService } from '../roles/roles.service';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);
  constructor(
    private readonly usersRepository: UserRepository,
    private readonly rolesService: RolesService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    // Do not remove comment below.
    // <creating-property />

    let password: string | undefined = undefined;

    if (createUserDto.password) {
      const salt = await bcrypt.genSalt();
      password = await bcrypt.hash(createUserDto.password, salt);
    }
    this.logger.log(`Creating user: ${JSON.stringify(createUserDto)}`);
    let email: string | null = null;

    if (createUserDto.email) {
      const userObject = await this.usersRepository.findByEmail(
        createUserDto.email,
      );
      if (userObject) {
        throw BusinessException.unprocessable(
          getMessage(MessagesEnum.EMAIL_ALREADY_EXISTS),
        );
      }
      email = createUserDto.email;
    }

    let roles: Role[] = [];

    if (createUserDto.roleIds && createUserDto.roleIds.length > 0) {
      roles = createUserDto.roleIds.map((id) => ({ id }));
    } else {
      // Default role if none provided
      const role = await this.rolesService.findByName(RoleEnum.user);
      if (role) {
        roles = [{ id: role.id }];
      }
    }

    let status: StatusEnum | undefined = undefined;

    if (createUserDto.status) {
      const statusObject = Object.values(StatusEnum)
        .map(String)
        .includes(String(createUserDto.status));
      if (!statusObject) {
        throw BusinessException.unprocessable(
          getMessage(MessagesEnum.STATUS_NOT_EXISTS),
        );
      }

      status = createUserDto.status;
    }

    return this.usersRepository.create({
      // Do not remove comment below.
      // <creating-property-payload />
      firstName: createUserDto.firstName,
      lastName: createUserDto.lastName,
      email: email,
      password: password,
      roles: roles,
      status: status,
      provider: createUserDto.provider ?? AuthProvidersEnum.email,
      socialId: createUserDto.socialId,
    });
  }

  findManyWithPagination({
    filterOptions,
    sortOptions,
    paginationOptions,
  }: {
    filterOptions?: FilterUserDto | null;
    sortOptions?: SortUserDto[] | null;
    paginationOptions: IPaginationOptions;
  }): Promise<User[]> {
    return this.usersRepository.findManyWithPagination({
      filterOptions,
      sortOptions,
      paginationOptions,
    });
  }

  findById(id: User['id']): Promise<NullableType<User>> {
    return this.usersRepository.findById(id);
  }

  findByIds(ids: User['id'][]): Promise<User[]> {
    return this.usersRepository.findByIds(ids);
  }

  findByEmail(email: User['email']): Promise<NullableType<User>> {
    return this.usersRepository.findByEmail(email);
  }

  findBySocialIdAndProvider({
    socialId,
    provider,
  }: {
    socialId: User['socialId'];
    provider: User['provider'];
  }): Promise<NullableType<User>> {
    return this.usersRepository.findBySocialIdAndProvider({
      socialId,
      provider,
    });
  }

  async update(
    id: User['id'],
    updateUserDto: UpdateUserDto,
  ): Promise<User | null> {
    // Do not remove comment below.
    // <updating-property />

    let password: string | undefined = undefined;

    if (updateUserDto.password) {
      const userObject = await this.usersRepository.findById(id);

      if (userObject && userObject?.password !== updateUserDto.password) {
        const salt = await bcrypt.genSalt();
        password = await bcrypt.hash(updateUserDto.password, salt);
      }
    }

    let email: string | null | undefined = undefined;

    if (updateUserDto.email) {
      const userObject = await this.usersRepository.findByEmail(
        updateUserDto.email,
      );

      if (userObject && userObject.id !== id) {
        throw BusinessException.unprocessable(
          getMessage(MessagesEnum.EMAIL_ALREADY_EXISTS),
        );
      }

      email = updateUserDto.email;
    } else if (updateUserDto.email === null) {
      email = null;
    }

    let roles: Role[] | undefined = undefined;

    if (updateUserDto.roleIds && updateUserDto.roleIds.length > 0) {
      // Validate all roles
      for (const roleId of updateUserDto.roleIds) {
        const roleObject = Object.values(RoleEnum)
          .map(String)
          .includes(String(roleId));
        if (!roleObject) {
          throw BusinessException.unprocessable(
            getMessage(MessagesEnum.ROLE_NOT_EXISTS),
          );
        }
      }
      roles = updateUserDto.roleIds.map((id) => ({ id }));
    }

    let status: StatusEnum | undefined = undefined;

    if (updateUserDto.status) {
      const statusObject = Object.values(StatusEnum)
        .map(String)
        .includes(String(updateUserDto.status));
      if (!statusObject) {
        throw BusinessException.unprocessable(
          getMessage(MessagesEnum.STATUS_NOT_EXISTS),
        );
      }

      status = updateUserDto.status;
    }

    return this.usersRepository.update(id, {
      // Do not remove comment below.
      // <updating-property-payload />
      firstName: updateUserDto.firstName,
      lastName: updateUserDto.lastName,
      email,
      password,
      roles: roles,
      status,
      provider: updateUserDto.provider,
      socialId: updateUserDto.socialId,
    });
  }

  async remove(id: User['id']): Promise<void> {
    await this.usersRepository.remove(id);
  }
}
