import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

const idType = Number;

export class RoleDto {
  @ApiProperty({
    type: idType,
  })
  @Expose()
  id: number;

  @ApiProperty({
    type: String,
    example: 'admin',
  })
  @Expose()
  name?: string;

  @ApiProperty({
    type: String,
    example: 'Administrator role',
  })
  @Expose()
  description?: string;
}
