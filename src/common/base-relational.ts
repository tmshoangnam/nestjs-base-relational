import {
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Column,
  BaseEntity,
  DeleteDateColumn,
} from 'typeorm';

export abstract class BaseRelational extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn({ nullable: true })
  updatedAt: Date;

  @DeleteDateColumn({ nullable: true })
  deletedAt: Date;

  @Column({ type: 'bigint', nullable: true })
  createdBy: number;

  @Column({ type: 'bigint', nullable: true })
  updatedBy: number;
}
