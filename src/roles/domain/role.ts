import { ApiProperty } from '@nestjs/swagger';
import { Allow } from 'class-validator';

const idType = Number;

export class Role {
  @Allow()
  @ApiProperty({
    type: idType,
  })
  id: number;

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

  constructor(data?: Partial<Role>) {
    if (data) {
      Object.assign(this, data);
    }
  }
}
