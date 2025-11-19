import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CheckPermissionDto {
  @ApiProperty({
    type: String,
    example: 'user:create',
  })
  @IsString()
  permission: string;
}
