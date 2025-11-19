import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ClsService } from 'nestjs-cls';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly cls: ClsService) {
    super();
  }

  // Await super.canActivate so passport strategy has a chance to populate request.user
  async canActivate(context: ExecutionContext) {
    const can = (await super.canActivate(context)) as boolean;

    const request = context.switchToHttp().getRequest();
    const user = request?.user;
    if (user) {
      this.cls.set('userId', user.id);
    }

    return can;
  }
}
