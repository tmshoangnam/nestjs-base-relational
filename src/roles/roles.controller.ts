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
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { RoleDto } from './dto/role.dto';
import { FindAllRolesDto } from './dto/find-all-roles.dto';
import { RolesGuard } from './roles.guard';
import { Roles } from './roles.decorator';
import { RoleEnum } from './roles.enum';
import { plainToClass } from 'class-transformer';
import { JwtAuthGuard } from '../auth/strategies/jwt.guard';
import { ResponseUtil } from '../utils/ResponseUtil';
import { ResponseData } from '../utils/dto/ResponseData';
import { InfinityPaginationResponseDto } from '../utils/dto/infinity-pagination-response.dto';
import { infinityPagination } from '../utils/infinity-pagination';
import { BusinessException } from '../common/exception/business.exception';
import { getMessage } from '../common/exception/message.helper';
import { MessagesEnum } from '../common/exception/messages.enum';

@ApiTags('Roles')
@Controller({
  path: 'roles',
  version: '1',
})
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleEnum.SYSTEM_ADMIN)
@ApiBearerAuth()
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createRoleDto: CreateRoleDto,
  ): Promise<ResponseData<RoleDto>> {
    const role = await this.rolesService.create(createRoleDto);
    return ResponseUtil.successWithData(plainToClass(RoleDto, role));
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(
    @Query() query: FindAllRolesDto,
  ): Promise<InfinityPaginationResponseDto<RoleDto>> {
    const page = query?.page ?? 1;
    let limit = query?.limit ?? 10;
    if (limit > 50) {
      limit = 50;
    }

    const roles = await this.rolesService.findManyWithPagination({
      page,
      limit,
      name: query.name,
    });

    return infinityPagination(
      roles.map((role) => plainToClass(RoleDto, role)),
      { page, limit },
    );
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('id') id: string): Promise<ResponseData<RoleDto>> {
    const role = await this.rolesService.findById(id);
    if (!role) {
      throw BusinessException.notFound(
        getMessage(MessagesEnum.DATA_NOT_FOUND, { resource: 'Role' }),
      );
    }
    return ResponseUtil.successWithData(plainToClass(RoleDto, role));
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('id') id: string,
    @Body() updateRoleDto: UpdateRoleDto,
  ): Promise<ResponseData<RoleDto>> {
    const role = await this.rolesService.update(id, updateRoleDto);
    return ResponseUtil.successWithData(plainToClass(RoleDto, role));
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string): Promise<ResponseData<null>> {
    await this.rolesService.remove(id);
    return ResponseUtil.success();
  }
}
