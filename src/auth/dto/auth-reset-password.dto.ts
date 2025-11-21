import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, Length } from 'class-validator';

export class AuthResetPasswordDto {
  @ApiProperty()
  @IsNotEmpty()
  @Length(6, 255)
  password: string;

  @ApiProperty()
  @IsNotEmpty()
  hash: string;
}
