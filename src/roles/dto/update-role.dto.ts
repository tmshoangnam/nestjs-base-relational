import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class UpdateRoleDto {
  @ApiProperty({
    type: String,
    example: 'USER',
    required: false,
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
    type: String,
    example: 'Administrator role',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;
}
