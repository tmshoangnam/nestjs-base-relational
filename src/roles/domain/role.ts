import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { Allow } from 'class-validator';

const idType = Number;

export class Role {
  @Allow()
  @ApiProperty({
    type: idType,
  })
  id: number | string;

  @Allow()
  @ApiProperty({
    type: String,
    example: 'admin',
  })
  name?: string;

  @Allow()
  @ApiProperty({
    type: String,
    example: 'Administrator role',
    required: false,
  })
  description?: string;

  @Allow()
  @ApiProperty()
  createdA?: Date;

  @Allow()
  @ApiProperty()
  updatedAt?: Date;

  @Allow()
  @ApiProperty()
  deletedAt?: Date;

  @Allow()
  @ApiProperty()
  @Expose({ groups: ['admin'] })
  createdBy?: number | string;

  @Allow()
  @ApiProperty()
  @Expose({ groups: ['admin'] })
  updatedBy?: number | string;

  constructor(data?: Partial<Role>) {
    if (data) {
      Object.assign(this, data);
    }
  }
}
