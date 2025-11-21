import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Request,
  Post,
  UseGuards,
  Patch,
  SerializeOptions,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { AuthEmailLoginDto } from './dto/auth-email-login.dto';
import { AuthForgotPasswordDto } from './dto/auth-forgot-password.dto';
import { AuthResetPasswordDto } from './dto/auth-reset-password.dto';
import { AuthUpdateDto } from './dto/auth-update.dto';
import { AuthGuard } from '@nestjs/passport';
import { LoginResponseDto } from './dto/login-response.dto';
import { NullableType } from '../utils/types/nullable.type';
import { User } from '../users/domain/user';
import { RefreshResponseDto } from './dto/refresh-response.dto';
import { JwtAuthGuard } from './strategies/jwt.guard';
import { ResponseUtil } from '../utils/ResponseUtil';
import { ResponseData } from '../utils/dto/ResponseData';

@ApiTags('Auth')
@Controller({
  path: 'auth',
  version: '1',
})
export class AuthController {
  constructor(private readonly service: AuthService) {}

  @SerializeOptions({
    groups: ['me'],
  })
  @Post('login')
  @ApiOkResponse({
    type: LoginResponseDto,
  })
  @HttpCode(HttpStatus.OK)
  public login(
    @Body() loginDto: AuthEmailLoginDto,
  ): Promise<ResponseData<LoginResponseDto>> {
    return this.service
      .validateLogin(loginDto)
      .then((data) => ResponseUtil.successWithData(data));
  }

  @Post('forgot/password')
  @HttpCode(HttpStatus.OK)
  async forgotPassword(
    @Body() forgotPasswordDto: AuthForgotPasswordDto,
  ): Promise<ResponseData<any>> {
    await this.service.forgotPassword(forgotPasswordDto.email);
    console.log('Forgot password requested for:', forgotPasswordDto.email);
    return ResponseUtil.success();
  }

  @Post('reset/password')
  @HttpCode(HttpStatus.OK)
  resetPassword(
    @Body() resetPasswordDto: AuthResetPasswordDto,
  ): Promise<ResponseData<any>> {
    return this.service
      .resetPassword(resetPasswordDto.hash, resetPasswordDto.password)
      .then(() => ResponseUtil.success());
  }

  @ApiBearerAuth()
  @SerializeOptions({
    groups: ['me'],
  })
  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiOkResponse({
    type: User,
  })
  @HttpCode(HttpStatus.OK)
  public me(@Request() request): Promise<ResponseData<NullableType<User>>> {
    return this.service
      .me(request.user)
      .then((data) => ResponseUtil.successWithData(data));
  }

  @ApiBearerAuth()
  @ApiOkResponse({
    type: RefreshResponseDto,
  })
  @SerializeOptions({
    groups: ['me'],
  })
  @Post('refresh')
  @UseGuards(AuthGuard('jwt-refresh'))
  @HttpCode(HttpStatus.OK)
  public refresh(
    @Request() request,
  ): Promise<ResponseData<RefreshResponseDto>> {
    return this.service
      .refreshToken({
        sessionId: request.user.sessionId,
        hash: request.user.hash,
      })
      .then((data) => ResponseUtil.successWithData(data));
  }

  @ApiBearerAuth()
  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  public async logout(@Request() request): Promise<ResponseData<null>> {
    return this.service
      .logout({
        sessionId: request.user.sessionId,
      })
      .then(() => ResponseUtil.success());
  }

  @ApiBearerAuth()
  @SerializeOptions({
    groups: ['me'],
  })
  @Patch('me')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    type: User,
  })
  public update(
    @Request() request,
    @Body() userDto: AuthUpdateDto,
  ): Promise<ResponseData<NullableType<User>>> {
    return this.service
      .update(request.user, userDto)
      .then((data) => ResponseUtil.successWithData(data));
  }
}
