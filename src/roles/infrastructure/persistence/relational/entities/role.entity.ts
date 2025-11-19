import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { EntityRelationalHelper } from '../../../../../utils/relational-entity-helper';

@Entity({
  name: 'role',
})
export class RoleEntity extends EntityRelationalHelper {
  @Column({ unique: true , length: 50})
  name?: string;

  @Column({ nullable: true , length:500})
  description?: string;
}
