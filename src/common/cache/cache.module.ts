import { Module, Global } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import cacheConfig from './cache.config';
import { AppCacheService } from './application/services/cache.service';
import { CachedInterceptor } from './application/interceptors/cached.interceptor';
import { createHybridCache } from './infrastructure/cache-factory';
import { REDIS_CACHE_CLIENT } from '../redis/types/redis.constants';

@Global()
@Module({
  imports: [ConfigModule.forFeature(cacheConfig)],
  providers: [
    {
      provide: 'CACHE_MANAGER',
      useFactory: async (cs: ConfigService, redisClient: any) => {
        const cfg = cs.get('cache');
        const redisEnabled = cs.get('redis')?.enabled?.cache;
        const manager = await createHybridCache({
          redisClient,
          ttl: cfg.ttl,
          max: cfg.max,
          redisEnabled,
        });
        return manager;
      },
      inject: [ConfigService, REDIS_CACHE_CLIENT],
    },
    AppCacheService,
    CachedInterceptor,
  ],
  exports: [AppCacheService, 'CACHE_MANAGER', CachedInterceptor],
})
export class CacheModule {}
