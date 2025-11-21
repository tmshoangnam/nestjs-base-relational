import { Exclude, Expose } from 'class-transformer';
import { Role } from '../../roles/domain/role';
import { ApiProperty } from '@nestjs/swagger';
import { StatusEnum } from '../statuses.enum';

const idType = Number;

export class User {
  @ApiProperty({
    type: idType,
  })
  id: number | string;

  @ApiProperty({
    type: String,
    example: 'john.doe@example.com',
  })
  email?: string | null;

  @Exclude({ toPlainOnly: true })
  password?: string;

  @ApiProperty({
    type: String,
    example: 'email',
  })
  provider: string;

  @ApiProperty({
    type: String,
    example: '1234567890',
  })
  socialId?: string | null;

  @ApiProperty({
    type: String,
    example: 'John',
  })
  firstName?: string | null;

  @ApiProperty({
    type: String,
    example: 'Doe',
  })
  lastName?: string | null;

  @ApiProperty({
    type: [Role],
  })
  roles: Role[];

  @ApiProperty({
    type: String,
  })
  status?: StatusEnum;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty()
  deletedAt: Date;

  @ApiProperty()
  @Expose({ groups: ['admin'] })
  createdBy: number | string;

  @ApiProperty()
  @Expose({ groups: ['admin'] })
  updatedBy: number | string;
}
