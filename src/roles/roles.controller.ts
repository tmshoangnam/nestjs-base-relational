import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { RoleDto } from './dto/role.dto';
import { RolesGuard } from './roles.guard';
import { Roles } from './roles.decorator';
import { RoleEnum } from './roles.enum';
import { plainToClass } from 'class-transformer';
import { JwtAuthGuard } from '../auth/strategies/jwt.guard';
import { ResponseUtil } from '../utils/ResponseUtil';
import { ResponseData } from '../utils/dto/ResponseData';

@ApiTags('Roles')
@Controller({
  path: 'roles',
  version: '1',
})
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleEnum.admin)
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
  async findAll(): Promise<ResponseData<RoleDto[]>> {
    const roles = await this.rolesService.findMany();
    return ResponseUtil.successWithData(
      roles.map((role) => plainToClass(RoleDto, role)),
    );
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('id') id: string): Promise<ResponseData<RoleDto>> {
    const role = await this.rolesService.findById(id);
    if (!role) {
      throw new Error('Role not found');
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
