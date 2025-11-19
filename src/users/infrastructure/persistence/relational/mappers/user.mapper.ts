import { RoleEntity } from '../../../../../roles/infrastructure/persistence/relational/entities/role.entity';
import { User } from '../../../../domain/user';
import { UserEntity } from '../entities/user.entity';
import { Role } from '../../../../../roles/domain/role';
import { StatusEnum } from '../../../../statuses.enum';

export class UserMapper {
  static toDomain(raw: UserEntity): User {
    const domainEntity = new User();
    domainEntity.id = raw.id;
    domainEntity.email = raw.email;
    domainEntity.password = raw.password;
    domainEntity.provider = raw.provider;
    domainEntity.socialId = raw.socialId;
    domainEntity.firstName = raw.firstName;
    domainEntity.lastName = raw.lastName;
    // Map multi-role support
    domainEntity.roles =
      raw.roles?.map((roleEntity) => {
        const role = new Role();
        role.id = roleEntity.id;
        role.name = roleEntity.name;
        role.description = roleEntity.description;
        return role;
      }) || [];

    domainEntity.createdAt = raw.createdAt;
    domainEntity.updatedAt = raw.updatedAt;
    domainEntity.deletedAt = raw.deletedAt;
    return domainEntity;
  }

  static toPersistence(domainEntity: User): UserEntity {
    // Map multi-role support
    let roles: RoleEntity[] | undefined = undefined;
    if (domainEntity.roles && domainEntity.roles.length > 0) {
      roles = domainEntity.roles.map((roleDomain) => {
        const roleEntity = new RoleEntity();
        roleEntity.id = Number(roleDomain.id);
        return roleEntity;
      });
    }

    let status: StatusEnum | undefined = undefined;

    if (domainEntity.status) {
      status = domainEntity.status as StatusEnum;
    }

    const persistenceEntity = new UserEntity();
    if (domainEntity.id && typeof domainEntity.id === 'number') {
      persistenceEntity.id = domainEntity.id;
    }
    persistenceEntity.email = domainEntity.email;
    persistenceEntity.password = domainEntity.password;
    persistenceEntity.provider = domainEntity.provider;
    persistenceEntity.socialId = domainEntity.socialId;
    persistenceEntity.firstName = domainEntity.firstName;
    persistenceEntity.lastName = domainEntity.lastName;
    persistenceEntity.roles = roles || [];
    persistenceEntity.status = status;
    persistenceEntity.createdAt = domainEntity.createdAt;
    persistenceEntity.updatedAt = domainEntity.updatedAt;
    persistenceEntity.deletedAt = domainEntity.deletedAt;
    return persistenceEntity;
  }
}
