import {
  INestApplication,
  VersioningType,
  ValidationPipe,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import validationOptions from '../../utils/validation-options';
import { AllConfigType } from '../config.type';
import { swaggerSetup } from '../swagger.config';

/**
 * App configuration setup function
 * @param app - The NestJS application instance
 * @param configService - The configuration service
 */
export const applicationConfig = (
  app: INestApplication,
  configService: ConfigService<AllConfigType>,
) => {
  // set global prefix and enable shutdown hooks
  app.enableShutdownHooks();
  app.setGlobalPrefix(
    configService.getOrThrow('app.apiPrefix', { infer: true }),
    {
      exclude: ['/'],
    },
  );

  // enable api versioning
  app.enableVersioning({
    type: VersioningType.URI,
  });

  // set up global validation pipe
  app.useGlobalPipes(new ValidationPipe(validationOptions));

  swaggerSetup(app);
};
