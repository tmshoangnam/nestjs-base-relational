import { createCache, Cache } from 'cache-manager';

export function createMemoryCache(ttl: number): Cache {
  return createCache({ ttl });
}

export function createRedisLikeCache(
  redisClient: any,
): Pick<Cache, 'get' | 'set' | 'del' | 'clear'> {
  return {
    async get<T>(key: string) {
      const raw = await redisClient.get(key);
      if (raw === null || typeof raw === 'undefined') return undefined;
      try {
        return JSON.parse(raw) as T;
      } catch {
        return raw as unknown as T;
      }
    },
    async set<T>(key: string, value: T, ttl?: number) {
      const toStore = typeof value === 'string' ? value : JSON.stringify(value);
      if (ttl && ttl > 0) {
        await redisClient.set(key, toStore, { EX: ttl });
      } else {
        await redisClient.set(key, toStore);
      }
      return value;
    },
    async del(key: string) {
      const res = await redisClient.del(key);
      return res > 0;
    },
    clear() {
      // no-op to avoid FLUSHDB; implement keyspace-based clearing if needed
      return true as any;
    },
  } as any;
}

export async function createHybridCache(options: {
  redisClient: any;
  ttl: number;
  max?: number;
  redisEnabled: boolean;
}) {
  const { redisClient, ttl, redisEnabled } = options;
  const memory = createMemoryCache(ttl);

  if (!redisEnabled || !redisClient) return memory;

  const redisCache = await createRedisLikeCache(redisClient);

  return {
    async get<T>(key: string): Promise<T | undefined> {
      const m = await memory.get<T>(key as any);
      if (typeof m !== 'undefined' && m !== null) return m;
      const r = (await (redisCache as any).get(key as any)) as T | undefined;
      if (typeof r !== 'undefined' && r !== null)
        await memory.set(key as any, r as any, ttl);
      return r as any;
    },
    async set<T>(key: string, value: T, options?: any) {
      const ttlToUse =
        options && (options.ttl || options.ex)
          ? options.ttl || options.ex
          : ttl;
      await memory.set(key as any, value as any, ttlToUse);
      await (redisCache as any).set(key as any, value as any, ttlToUse);
    },
    async del(key: string) {
      await memory.del(key as any);
      await (redisCache as any).del(key as any);
    },
    async reset() {
      await (memory as any).clear?.();
      await (redisCache as any).clear?.();
    },
  } as unknown as Cache;
}
