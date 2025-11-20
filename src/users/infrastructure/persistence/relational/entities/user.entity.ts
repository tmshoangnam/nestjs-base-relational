import { Column, Entity, Index, ManyToMany, JoinTable } from 'typeorm';
import { RoleEntity } from '../../../../../roles/infrastructure/persistence/relational/entities/role.entity';
import { AuthProvidersEnum } from '../../../../../auth/auth-providers.enum';
import { EntityRelationalHelper } from '../../../../../utils/relational-entity-helper';
import { StatusEnum } from '../../../../statuses.enum';

@Entity({
  name: 'user',
})
export class UserEntity extends EntityRelationalHelper {
  @Column({ type: String, unique: true, length: 255 })
  email: string;

  @Column({ nullable: true, length: 255 })
  password?: string;

  @Column({ default: AuthProvidersEnum.email, length: 50 })
  provider: string;

  @Index()
  @Column({ type: String, nullable: true, length: 255, unique: true })
  socialId?: string | null;

  @Index()
  @Column({ type: String, length: 100 })
  firstName: string;

  @Index()
  @Column({ type: String, length: 100 })
  lastName: string;

  // Multi-role support
  @ManyToMany(() => RoleEntity, { eager: true })
  @JoinTable({
    name: 'user_roles',
    joinColumn: { name: 'user_id' },
    inverseJoinColumn: { name: 'role_id' },
  })
  roles: RoleEntity[];

  @Column({ type: 'enum', enum: StatusEnum, default: StatusEnum.active })
  status?: StatusEnum;
}
