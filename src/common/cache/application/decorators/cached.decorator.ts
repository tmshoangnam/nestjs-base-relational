import { SetMetadata } from '@nestjs/common';

export const CACHED_METADATA_KEY = 'CACHED_METADATA_KEY';

export interface CachedOptions {
  key?: string;
  ttl?: number;
}

export const Cached = (options: CachedOptions = {}): MethodDecorator =>
  SetMetadata(CACHED_METADATA_KEY, options);
