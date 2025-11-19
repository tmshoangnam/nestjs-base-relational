import { Injectable, Logger } from '@nestjs/common';
import ms from 'ms';
import crypto from 'crypto';
import { randomStringGenerator } from '@nestjs/common/utils/random-string-generator.util';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcryptjs';
import { AuthEmailLoginDto } from './dto/auth-email-login.dto';
import { AuthUpdateDto } from './dto/auth-update.dto';
import { AuthProvidersEnum } from './auth-providers.enum';
import { SocialInterface } from '../common/social/interfaces/social.interface';
import { AuthRegisterLoginDto } from './dto/auth-register-login.dto';
import { NullableType } from '../utils/types/nullable.type';
import { LoginResponseDto } from './dto/login-response.dto';
import { ConfigService } from '@nestjs/config';
import { JwtRefreshPayloadType } from './strategies/types/jwt-refresh-payload.type';
import { JwtPayloadType } from './strategies/types/jwt-payload.type';
import { UsersService } from '../users/users.service';
import { AllConfigType } from '../config/config.type';
import { MailService } from '../mail/mail.service';
import { RoleEnum } from '../roles/roles.enum';
import { Session } from '../session/domain/session';
import { SessionService } from '../session/session.service';
import { StatusEnum } from '../users/statuses.enum';
import { User } from '../users/domain/user';
import { RolesService } from '../roles/roles.service';
import { AppCacheService } from '../common/cache/application/services/cache.service';
import { Role } from '../roles/domain/role';
import { BusinessException } from '../common/exception/business.exception';
import { MessagesEnum } from '../common/exception/messages.enum';
import { getMessage } from '../common/exception/message.helper';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(
    private jwtService: JwtService,
    private usersService: UsersService,
    private sessionService: SessionService,
    private mailService: MailService,
    private configService: ConfigService<AllConfigType>,
    private readonly cache: AppCacheService,
    private roleService: RolesService,
  ) {}

  async validateLogin(loginDto: AuthEmailLoginDto): Promise<LoginResponseDto> {
    const user = await this.usersService.findByEmail(loginDto.email);

    if (!user) {
      throw BusinessException.notFound(getMessage(MessagesEnum.USER_NOT_FOUND));
    }

    if (user.provider !== AuthProvidersEnum.email) {
      throw BusinessException.badRequest(
        getMessage(MessagesEnum.LOGIN_VIA_PROVIDER, {
          provider: user.provider,
        }),
      );
    }

    if (!user.password) {
      throw BusinessException.badRequest(
        getMessage(MessagesEnum.INCORRECT_PASSWORD),
      );
    }

    const isValidPassword = await bcrypt.compare(
      loginDto.password,
      user.password,
    );

    if (!isValidPassword) {
      throw BusinessException.badRequest(
        getMessage(MessagesEnum.INCORRECT_PASSWORD),
      );
    }

    const hash = crypto
      .createHash('sha256')
      .update(randomStringGenerator())
      .digest('hex');

    const session = await this.sessionService.create({
      user,
      hash,
    });
    const { token, refreshToken, tokenExpires } = await this.getTokensData({
      id: user.id,
      role: user.roles?.[0] || null,
      sessionId: session.id,
      hash,
      roles: user.roles?.map((r) => r.name || '').filter(Boolean) || [],
    });

    return {
      refreshToken,
      token,
      tokenExpires,
      user,
    };
  }

  async validateSocialLogin(
    authProvider: string,
    socialData: SocialInterface,
  ): Promise<LoginResponseDto> {
    let user: NullableType<User> = null;
    const socialEmail = socialData.email?.toLowerCase();
    let userByEmail: NullableType<User> = null;

    if (socialEmail) {
      userByEmail = await this.usersService.findByEmail(socialEmail);
    }

    if (socialData.id) {
      user = await this.usersService.findBySocialIdAndProvider({
        socialId: socialData.id,
        provider: authProvider,
      });
    }

    if (user) {
      if (socialEmail && !userByEmail) {
        user.email = socialEmail;
        await this.usersService.update(user.id, user);
      }
    } else if (userByEmail) {
      user = userByEmail;
    } else if (socialData.id) {
      let roleIds: number[] = [];
      const role = await this.roleService.findByName(RoleEnum.user);
      if (role) {
        roleIds = [role.id as number];
      }
      const status = StatusEnum.active;

      user = await this.usersService.create({
        email: socialEmail ?? null,
        firstName: socialData.firstName ?? null,
        lastName: socialData.lastName ?? null,
        socialId: socialData.id,
        provider: authProvider,
        roleIds,
        status,
      });

      user = await this.usersService.findById(user.id);
    }

    if (!user) {
      throw BusinessException.notFound(getMessage(MessagesEnum.USER_NOT_FOUND));
    }

    const hash = crypto
      .createHash('sha256')
      .update(randomStringGenerator())
      .digest('hex');

    const session = await this.sessionService.create({
      user,
      hash,
    });

    const {
      token: jwtToken,
      refreshToken,
      tokenExpires,
    } = await this.getTokensData({
      id: user.id,
      role: user.roles?.[0] || null,
      sessionId: session.id,
      hash,
      roles: user.roles?.map((r) => r.name || '').filter(Boolean) || [],
    });

    return {
      refreshToken,
      token: jwtToken,
      tokenExpires,
      user,
    };
  }

  async getRole(roleName: string): Promise<Role> {
    const role = await this.cache.get(`role:${roleName}`);
    if (role) {
      return role as Role;
    }
    const roleEntity = await this.roleService.findByName(roleName);
    if (!roleEntity) {
      throw BusinessException.notFound(
        getMessage(MessagesEnum.ROLE_NOT_EXISTS),
      );
    }
    await this.cache.set(`role:${roleName}`, roleEntity);
    return roleEntity as Role;
  }

  async register(dto: AuthRegisterLoginDto): Promise<void> {
    const user = await this.usersService.create({
      ...dto,
      email: dto.email,
      roleIds: [(await this.getRole(RoleEnum.user)).id as number],
      status: StatusEnum.inactive,
    });

    const hash = await this.jwtService.signAsync(
      {
        confirmEmailUserId: user.id,
      },
      {
        secret: this.configService.getOrThrow('auth.confirmEmailSecret', {
          infer: true,
        }),
        expiresIn: this.configService.getOrThrow('auth.confirmEmailExpires', {
          infer: true,
        }),
      },
    );

    await this.mailService.userSignUp({
      to: dto.email,
      data: {
        hash,
      },
    });
  }

  async confirmEmail(hash: string): Promise<void> {
    let userId: User['id'];

    try {
      const jwtData = await this.jwtService.verifyAsync<{
        confirmEmailUserId: User['id'];
      }>(hash, {
        secret: this.configService.getOrThrow('auth.confirmEmailSecret', {
          infer: true,
        }),
      });

      userId = jwtData.confirmEmailUserId;
    } catch {
      throw BusinessException.badRequest(getMessage(MessagesEnum.INVALID_HASH));
    }

    const user = await this.usersService.findById(userId);

    if (!user || user?.status !== StatusEnum.inactive) {
      throw BusinessException.notFound(getMessage(MessagesEnum.USER_NOT_FOUND));
    }

    user.status = StatusEnum.active;

    await this.usersService.update(user.id, user);
  }

  async confirmNewEmail(hash: string): Promise<void> {
    let userId: User['id'];
    let newEmail: User['email'];

    try {
      const jwtData = await this.jwtService.verifyAsync<{
        confirmEmailUserId: User['id'];
        newEmail: User['email'];
      }>(hash, {
        secret: this.configService.getOrThrow('auth.confirmEmailSecret', {
          infer: true,
        }),
      });

      userId = jwtData.confirmEmailUserId;
      newEmail = jwtData.newEmail;
    } catch {
      throw BusinessException.badRequest(getMessage(MessagesEnum.INVALID_HASH));
    }

    const user = await this.usersService.findById(userId);

    if (!user) {
      throw BusinessException.notFound(getMessage(MessagesEnum.USER_NOT_FOUND));
    }

    user.email = newEmail;
    user.status = StatusEnum.active;

    await this.usersService.update(user.id, user);
  }

  async forgotPassword(email: string): Promise<void> {
    const user = await this.usersService.findByEmail(email);

    if (!user) {
      throw BusinessException.badRequest(
        getMessage(MessagesEnum.EMAIL_NOT_EXISTS),
      );
    }

    const tokenExpiresIn = this.configService.getOrThrow('auth.forgotExpires', {
      infer: true,
    });

    const tokenExpires = Date.now() + ms(tokenExpiresIn);

    const hash = await this.jwtService.signAsync(
      {
        forgotUserId: user.id,
      },
      {
        secret: this.configService.getOrThrow('auth.forgotSecret', {
          infer: true,
        }),
        expiresIn: tokenExpiresIn,
      },
    );

    await this.mailService.forgotPassword({
      to: email,
      data: {
        hash,
        tokenExpires,
      },
    });
  }

  async resetPassword(hash: string, password: string): Promise<void> {
    let userId: User['id'];

    try {
      const jwtData = await this.jwtService.verifyAsync<{
        forgotUserId: User['id'];
      }>(hash, {
        secret: this.configService.getOrThrow('auth.forgotSecret', {
          infer: true,
        }),
      });

      userId = jwtData.forgotUserId;
    } catch {
      throw BusinessException.badRequest(getMessage(MessagesEnum.INVALID_HASH));
    }

    const user = await this.usersService.findById(userId);

    if (!user) {
      throw BusinessException.notFound(getMessage(MessagesEnum.USER_NOT_FOUND));
    }

    user.password = password;

    await this.sessionService.deleteByUserId({
      userId: user.id,
    });

    await this.usersService.update(user.id, user);
  }

  async me(userJwtPayload: JwtPayloadType): Promise<NullableType<User>> {
    return this.usersService.findById(userJwtPayload.id);
  }

  async update(
    userJwtPayload: JwtPayloadType,
    userDto: AuthUpdateDto,
  ): Promise<NullableType<User>> {
    const currentUser = await this.usersService.findById(userJwtPayload.id);

    if (!currentUser) {
      throw BusinessException.notFound(getMessage(MessagesEnum.USER_NOT_FOUND));
    }

    if (userDto.password) {
      if (!userDto.oldPassword) {
        throw BusinessException.badRequest(
          getMessage(MessagesEnum.MISSING_OLD_PASSWORD),
        );
      }

      if (!currentUser.password) {
        throw BusinessException.badRequest(
          getMessage(MessagesEnum.INCORRECT_OLD_PASSWORD),
        );
      }

      const isValidOldPassword = await bcrypt.compare(
        userDto.oldPassword,
        currentUser.password,
      );

      if (!isValidOldPassword) {
        throw BusinessException.badRequest(
          getMessage(MessagesEnum.INCORRECT_OLD_PASSWORD),
        );
      } else {
        await this.sessionService.deleteByUserIdWithExclude({
          userId: currentUser.id,
          excludeSessionId: userJwtPayload.sessionId,
        });
      }
    }

    if (userDto.email && userDto.email !== currentUser.email) {
      const userByEmail = await this.usersService.findByEmail(userDto.email);

      if (userByEmail && userByEmail.id !== currentUser.id) {
        throw BusinessException.badRequest(
          getMessage(MessagesEnum.EMAIL_ALREADY_EXISTS),
        );
      }

      const hash = await this.jwtService.signAsync(
        {
          confirmEmailUserId: currentUser.id,
          newEmail: userDto.email,
        },
        {
          secret: this.configService.getOrThrow('auth.confirmEmailSecret', {
            infer: true,
          }),
          expiresIn: this.configService.getOrThrow('auth.confirmEmailExpires', {
            infer: true,
          }),
        },
      );

      await this.mailService.confirmNewEmail({
        to: userDto.email,
        data: {
          hash,
        },
      });
    }

    delete userDto.email;
    delete userDto.oldPassword;
    const updateData = {
      ...userDto,
      roleIds: currentUser.roles.map((r) => r.id as number),
    };
    this.logger.log(
      `Updating user ID ${userJwtPayload.id} with data: ${JSON.stringify(userDto)}`,
    );
    await this.usersService.update(userJwtPayload.id, updateData);

    return this.usersService.findById(userJwtPayload.id);
  }

  async refreshToken(
    data: Pick<JwtRefreshPayloadType, 'sessionId' | 'hash'>,
  ): Promise<Omit<LoginResponseDto, 'user'>> {
    const session = await this.sessionService.findById(data.sessionId);

    if (!session) {
      throw BusinessException.unauthorized(
        getMessage(MessagesEnum.AUTH_UNAUTHORIZED),
      );
    }

    if (session.hash !== data.hash) {
      throw BusinessException.unauthorized(
        getMessage(MessagesEnum.AUTH_UNAUTHORIZED),
      );
    }

    const hash = crypto
      .createHash('sha256')
      .update(randomStringGenerator())
      .digest('hex');

    const user = await this.usersService.findById(session.user.id);

    if (!user?.roles || user.roles.length === 0) {
      throw BusinessException.unauthorized(
        getMessage(MessagesEnum.AUTH_UNAUTHORIZED),
      );
    }

    await this.sessionService.update(session.id, {
      hash,
    });

    const { token, refreshToken, tokenExpires } = await this.getTokensData({
      id: session.user.id,
      role: {
        id: user.roles[0].id,
      },
      sessionId: session.id,
      hash,
      roles: user.roles?.map((r) => r.name || '').filter(Boolean) || [],
    });

    return {
      token,
      refreshToken,
      tokenExpires,
    };
  }

  async softDelete(user: User): Promise<void> {
    await this.usersService.remove(user.id);
  }

  async logout(data: Pick<JwtRefreshPayloadType, 'sessionId'>) {
    return this.sessionService.deleteById(data.sessionId);
  }

  private async getTokensData(data: {
    id: User['id'];
    role: User['roles'][0] | null;
    sessionId: Session['id'];
    hash: Session['hash'];
    roles?: string[];
  }) {
    const tokenExpiresIn = this.configService.getOrThrow('auth.expires', {
      infer: true,
    });
    const tokenExpires = Date.now() + ms(tokenExpiresIn);
    const [token, refreshToken] = await Promise.all([
      await this.jwtService.signAsync(
        {
          id: data.id,
          role: data.role,
          sessionId: data.sessionId,
          roles: data.roles || [],
        },
        {
          secret: this.configService.getOrThrow('auth.secret', { infer: true }),
          expiresIn: tokenExpiresIn,
        },
      ),
      await this.jwtService.signAsync(
        {
          sessionId: data.sessionId,
          hash: data.hash,
        },
        {
          secret: this.configService.getOrThrow('auth.refreshSecret', {
            infer: true,
          }),
          expiresIn: this.configService.getOrThrow('auth.refreshExpires', {
            infer: true,
          }),
        },
      ),
    ]);

    return {
      token,
      refreshToken,
      tokenExpires,
    };
  }
}
