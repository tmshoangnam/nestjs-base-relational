---
to: src/<%= h.inflection.transform(name, ['pluralize', 'underscore', 'dasherize']) %>/<%= h.inflection.transform(name, ['pluralize', 'underscore', 'dasherize']) %>.controller.ts
---
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { <%= h.inflection.transform(name, ['pluralize']) %>Service } from './<%= h.inflection.transform(name, ['pluralize', 'underscore', 'dasherize']) %>.service';
import { Create<%= name %>Dto } from './dto/create-<%= h.inflection.transform(name, ['underscore', 'dasherize']) %>.dto';
import { Update<%= name %>Dto } from './dto/update-<%= h.inflection.transform(name, ['underscore', 'dasherize']) %>.dto';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { <%= name %> } from './domain/<%= h.inflection.transform(name, ['underscore', 'dasherize']) %>';
import { JwtAuthGuard } from '../auth/strategies/jwt.guard';
import {
  InfinityPaginationResponse,
  InfinityPaginationResponseDto,
} from '../utils/dto/infinity-pagination-response.dto';
import { infinityPagination } from '../utils/infinity-pagination';
import { FindAll<%= h.inflection.transform(name, ['pluralize']) %>Dto } from './dto/find-all-<%= h.inflection.transform(name, ['pluralize', 'underscore', 'dasherize']) %>.dto';
import { ResponseUtil } from '../utils/ResponseUtil';
import { ResponseData } from '../utils/dto/ResponseData';
import { NullableType } from '../utils/types/nullable.type';

@ApiTags('<%= h.inflection.transform(name, ['pluralize', 'humanize']) %>')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller({
  path: '<%= h.inflection.transform(name, ['pluralize', 'underscore', 'dasherize']) %>',
  version: '1',
})
export class <%= h.inflection.transform(name, ['pluralize']) %>Controller {
  constructor(private readonly <%= h.inflection.camelize(h.inflection.pluralize(name), true) %>Service: <%= h.inflection.transform(name, ['pluralize']) %>Service) {}

  @Post()
  @ApiCreatedResponse({
    type: <%= name %>,
  })
  create(@Body() create<%= name %>Dto: Create<%= name %>Dto): Promise<ResponseData<<%= name %>>> {
    return this.<%= h.inflection.camelize(h.inflection.pluralize(name), true) %>Service.create(create<%= name %>Dto).then(data => ResponseUtil.successWithData(data));
  }

  @Get()
  @ApiOkResponse({
    type: InfinityPaginationResponse(<%= name %>),
  })
  async findAll(
    @Query() query: FindAll<%= h.inflection.transform(name, ['pluralize']) %>Dto,
  ): Promise<InfinityPaginationResponseDto<<%= name %>>> {
    const page = query?.page ?? 1;
    let limit = query?.limit ?? 10;
    if (limit > 50) {
      limit = 50;
    }

    return infinityPagination(
      await this.<%= h.inflection.camelize(h.inflection.pluralize(name), true) %>Service.findAllWithPagination({
        paginationOptions: {
          page,
          limit,
        },
      }),
      { page, limit },
    );
  }

  @Get(':id')
  @ApiParam({
    name: 'id',
    type: Number,
    required: true,
  })
  @ApiOkResponse({
    type: <%= name %>,
  })
  findById(@Param('id') id: number): Promise<ResponseData<NullableType<<%= name %>>>> {
    return this.<%= h.inflection.camelize(h.inflection.pluralize(name), true) %>Service.findById(id).then(data => ResponseUtil.successWithData(data));
  }

  @Patch(':id')
  @ApiParam({
    name: 'id',
    type: Number,
    required: true,
  })
  @ApiOkResponse({
    type: <%= name %>,
  })
  update(
    @Param('id') id: number,
    @Body() update<%= name %>Dto: Update<%= name %>Dto,
  ): Promise<ResponseData<NullableType<<%= name %>>>> {
    return this.<%= h.inflection.camelize(h.inflection.pluralize(name), true) %>Service.update(id, update<%= name %>Dto).then(data => ResponseUtil.successWithData(data));
  }

  @Delete(':id')
  @ApiParam({
    name: 'id',
    type: Number,
    required: true,
  })
  remove(@Param('id') id: number): Promise<ResponseData<null>> {
    return this.<%= h.inflection.camelize(h.inflection.pluralize(name), true) %>Service.remove(id).then(() => ResponseUtil.success());
  }
}
