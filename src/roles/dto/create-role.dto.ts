import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNotEmpty, Length } from 'class-validator';

export class CreateRoleDto {
  @ApiProperty({
    type: String,
    example: 'USER',
  })
  @IsString()
  @IsNotEmpty()
  @Length(4, 50)
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
