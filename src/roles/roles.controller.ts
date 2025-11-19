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
import { AuthGuard } from '@nestjs/passport';

@ApiTags('Roles')
@Controller({
  path: 'roles',
  version: '1',
})
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(RoleEnum.admin)
@ApiBearerAuth()
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createRoleDto: CreateRoleDto): Promise<RoleDto> {
    const role = await this.rolesService.create(createRoleDto);
    return plainToClass(RoleDto, role);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(): Promise<RoleDto[]> {
    const roles = await this.rolesService.findMany();
    return roles.map((role) => plainToClass(RoleDto, role));
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('id') id: string): Promise<RoleDto> {
    const role = await this.rolesService.findById(id);
    if (!role) {
      throw new Error('Role not found');
    }
    return plainToClass(RoleDto, role);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('id') id: string,
    @Body() updateRoleDto: UpdateRoleDto,
  ): Promise<RoleDto> {
    const role = await this.rolesService.update(id, updateRoleDto);
    return plainToClass(RoleDto, role);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    await this.rolesService.remove(id);
  }
}
