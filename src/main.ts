import 'dotenv/config';
import { ClassSerializerInterceptor } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory, Reflector } from '@nestjs/core';
import { useContainer } from 'class-validator';
import { AppModule } from './app.module';
import { AllConfigType } from './config/config.type';
import { ResolvePromisesInterceptor } from './utils/serializer.interceptor';
import { ExceptionsFilter } from './common/exception/exception.filter';
import { applicationConfig } from './config/core/application.config';

async function bootstrap() {
  // create the NestJS application
  const app = await NestFactory.create(AppModule, { cors: true });

  // set up dependency injection for class-validator
  useContainer(app.select(AppModule), { fallbackOnErrors: true });

  // get the configuration service
  const configService = app.get(ConfigService<AllConfigType>);

  // apply application configurations
  applicationConfig(app, configService);

  // set up global interceptors and filters
  app.useGlobalInterceptors(
    new ResolvePromisesInterceptor(),
    new ClassSerializerInterceptor(app.get(Reflector)),
  );

  // set up global exception filter
  app.useGlobalFilters(new ExceptionsFilter());

  // start the application
  await app.listen(
    configService.getOrThrow('app.port', { infer: true }),
    '0.0.0.0',
  );

  console.log(
    `Service is running on port ${configService.getOrThrow('app.port', { infer: true })}`,
  );
}
void bootstrap();
