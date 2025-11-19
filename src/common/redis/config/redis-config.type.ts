export type RedisConfig = {
  url?: string;
  password?: string;
  cacheDb?: number;
  enabled: {
    cache: boolean;
  };
};
