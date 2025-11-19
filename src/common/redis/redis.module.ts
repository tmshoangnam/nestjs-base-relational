import { Module, Global } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import redisConfig from './config/redis.config';
import { RedisCacheProvider } from './providers/redis-cache.provider';
import { REDIS_CACHE_CLIENT, REDIS_CONFIG } from './types/redis.constants';

@Global()
@Module({
  imports: [ConfigModule.forFeature(redisConfig)],
  providers: [
    {
      provide: REDIS_CONFIG,
      useFactory: (cs: ConfigService) => cs.get('redis'),
      inject: [ConfigService],
    },
    RedisCacheProvider,
  ],
  exports: [REDIS_CACHE_CLIENT],
})
export class RedisModule {}
