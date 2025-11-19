import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class CreateRoleDto {
  @ApiProperty({
    type: String,
    example: 'USER',
  })
  @IsString()
  name: string;

  @ApiProperty({
    type: String,
    example: 'Administrator role',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;
}
