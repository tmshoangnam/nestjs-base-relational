import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Transform, Type, plainToInstance } from 'class-transformer';
import { User } from '../domain/user';
import { StatusEnum } from '../statuses.enum';

export class FilterUserDto {
  @ApiPropertyOptional({ type: [Number], example: [1, 2] })
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  roleIds?: number[] | null;

  // email
  @ApiPropertyOptional({ type: String, example: 'test1@example.com' })
  @IsOptional()
  @IsString()
  email?: string | null;

  // firstName
  @ApiPropertyOptional({ type: String, example: 'John' })
  @IsOptional()
  @IsString()
  firstName?: string | null;

  // lastName
  @ApiPropertyOptional({ type: String, example: 'Doe' })
  @IsOptional()
  @IsString()
  lastName?: string | null;

  // status
  @ApiPropertyOptional({ type: String, example: 'ACTIVE' })
  @IsOptional()
  @IsEnum(StatusEnum)
  status?: StatusEnum | null;
}

export class SortUserDto {
  @ApiProperty()
  @Type(() => String)
  @IsString()
  orderBy: keyof User;

  @ApiProperty()
  @IsString()
  order: string;
}

export class QueryUserDto {
  @ApiPropertyOptional()
  @Transform(({ value }) => (value ? Number(value) : 1))
  @IsNumber()
  @IsOptional()
  page?: number;

  @ApiPropertyOptional()
  @Transform(({ value }) => (value ? Number(value) : 10))
  @IsNumber()
  @IsOptional()
  limit?: number;

  @ApiPropertyOptional({
    type: String,
    example:
      '{"email":"test1@example.com", "firstName":"John", "lastName":"Doe", "status":"ACTIVE"}',
  })
  @IsOptional()
  @Transform(({ value }) =>
    value ? plainToInstance(FilterUserDto, JSON.parse(value)) : undefined,
  )
  @ValidateNested()
  @Type(() => FilterUserDto)
  filters?: FilterUserDto | null;

  @ApiPropertyOptional({
    type: String,
    example:
      '[{"orderBy":"firstName","order":"ASC"},{"orderBy":"email","order":"DESC"}]',
  })
  @IsOptional()
  @Transform(({ value }) => {
    return value ? plainToInstance(SortUserDto, JSON.parse(value)) : undefined;
  })
  @ValidateNested({ each: true })
  @Type(() => SortUserDto)
  sort?: SortUserDto[] | null;
}
