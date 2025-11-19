import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, from, of } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';
import { Reflector } from '@nestjs/core';
import { AppCacheService } from '../services/cache.service';
import {
  CACHED_METADATA_KEY,
  CachedOptions,
} from '../decorators/cached.decorator';

@Injectable()
export class CachedInterceptor implements NestInterceptor {
  constructor(
    private reflector: Reflector,
    private cacheService: AppCacheService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const meta = this.reflector.get<CachedOptions>(
      CACHED_METADATA_KEY,
      context.getHandler(),
    );
    if (!meta) return next.handle();

    const req = context.switchToHttp().getRequest();
    const userIdPart = req?.user?.id ? `:${req.user.id}` : '';
    const key =
      meta.key || `${req.method}:${req.originalUrl || req.url}${userIdPart}`;

    return from(this.cacheService.get(key)).pipe(
      switchMap((val) => {
        if (val !== undefined && val !== null) return of(val);
        return next.handle().pipe(
          tap(async (res: any) => {
            await this.cacheService.set(key, res, meta.ttl);
          }),
        );
      }),
    );
  }
}
