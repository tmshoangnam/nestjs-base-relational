import { Provider } from '@nestjs/common';
import { createClient } from 'redis';
import { REDIS_CACHE_CLIENT, REDIS_CONFIG } from '../types/redis.constants';
import { RedisConfig } from '../config/redis-config.type';

export const RedisCacheProvider: Provider = {
  provide: REDIS_CACHE_CLIENT,
  useFactory: async (config: RedisConfig) => {
    if (!config?.enabled?.cache) return null;
    const client = createClient({ url: config.url, password: config.password });
    console.log('config', config);
    client.on('error', (err) => console.error('Redis cache client error', err));
    await client.connect();
    if (typeof config.cacheDb === 'number') {
      try {
        await client.select(config.cacheDb);
      } catch {}
    }
    return client;
  },
  inject: [REDIS_CONFIG],
};
