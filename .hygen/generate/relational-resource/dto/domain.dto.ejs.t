---
to: src/<%= h.inflection.transform(name, ['pluralize', 'underscore', 'dasherize']) %>/dto/<%= h.inflection.transform(name, ['underscore', 'dasherize']) %>.dto.ts
---
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class <%= name %>Dto {
  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  id: string;
}
