import { registerAs } from '@nestjs/config';
import {
  IsString,
  IsOptional,
  IsInt,
  IsBoolean,
  ValidateIf,
} from 'class-validator';
import { RedisConfig } from './redis-config.type';
import validateConfig from '../../../utils/validate-config';

class EnvironmentVariablesValidator {
  @IsBoolean()
  REDIS_CACHE_ENABLED: boolean;

  @IsString()
  @ValidateIf((envValues) => envValues.REDIS_CACHE_ENABLED)
  REDIS_URL: string;

  @IsString()
  @IsOptional()
  @ValidateIf((envValues) => envValues.REDIS_CACHE_ENABLED)
  REDIS_PASSWORD: string;

  @ValidateIf((envValues) => envValues.REDIS_CACHE_ENABLED)
  @IsInt()
  @IsOptional()
  REDIS_CACHE_DB: number;
}
export default registerAs<RedisConfig>('redis', () => {
  validateConfig(process.env, EnvironmentVariablesValidator);
  return {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    password: process.env.REDIS_PASSWORD,
    cacheDb: parseInt(process.env.REDIS_CACHE_DB || '0', 10),
    enabled: {
      cache: process.env.REDIS_CACHE_ENABLED !== 'false',
    },
  };
});
