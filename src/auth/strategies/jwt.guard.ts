import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ClsService } from 'nestjs-cls';
import { BusinessException } from '../../common/exception/business.exception';
import { getMessage } from '../../common/exception/message.helper';
import { MessagesEnum } from '../../common/exception/messages.enum';
import { SessionService } from '../../session/session.service';
import { ModuleRef } from '@nestjs/core';
import { AppCacheService } from '../../common/cache/application/services/cache.service';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  private sessionService: SessionService;
  constructor(
    private readonly cls: ClsService,
    private readonly moduleRef: ModuleRef,
    private readonly cacheManager: AppCacheService,
  ) {
    super();
  }

  // Await super.canActivate so passport strategy has a chance to populate request.user
  async canActivate(context: ExecutionContext) {
    const can = (await super.canActivate(context)) as boolean;

    if (!this.sessionService) {
      this.sessionService = this.moduleRef.get(SessionService, {
        strict: false,
      });
    }

    const request = context.switchToHttp().getRequest();
    const user = request?.user;
    if (user) {
      const session = await this.sessionService.existsById(user.sessionId);
      if (!session) {
        throw BusinessException.unauthorized(
          getMessage(MessagesEnum.AUTH_UNAUTHORIZED),
        );
      }

      this.cls.set('userId', user.id);
    }

    return can;
  }
}
