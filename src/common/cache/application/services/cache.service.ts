import { Injectable, Inject, Logger, OnModuleDestroy } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { REDIS_CACHE_CLIENT } from '../../../redis/types/redis.constants';

@Injectable()
export class AppCacheService implements OnModuleDestroy {
  private readonly logger = new Logger('AppCacheService');
  constructor(
    @Inject('CACHE_MANAGER') private cacheManager: Cache,
    @Inject(REDIS_CACHE_CLIENT) private redisClient: any,
  ) {}

  async get<T>(key: string): Promise<T | undefined> {
    return this.cacheManager.get<T>(key as any);
  }
  async set<T>(key: string, value: T, ttl?: number) {
    await this.cacheManager.set(key as any, value as any, ttl);
  }
  async del(key: string) {
    await this.cacheManager.del(key as any);
  }
  async reset() {
    await (this.cacheManager as any).clear?.();
  }

  async onModuleDestroy() {
    try {
      if (this.redisClient && typeof this.redisClient.disconnect === 'function')
        await this.redisClient.disconnect();
    } catch (e) {
      this.logger.warn('Error disconnecting redis client', e as any);
    }
  }
}
