import { ConfigModule, ConfigService } from '@nestjs/config';
import { I18nModule, HeaderResolver } from 'nestjs-i18n';
import path from 'path';
import googleConfig from '../../auth-google/config/google.config';
import authConfig from '../../auth/config/auth.config';
import redisConfig from '../../common/redis/config/redis.config';
import databaseConfig from '../../database/config/database.config';
import mailConfig from '../../mail/config/mail.config';
import appConfig from '../app.config';
import { AllConfigType } from '../config.type';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSourceOptions, DataSource } from 'typeorm';
import { TypeOrmConfigService } from '../../database/typeorm-config.service';
import { ClsModule } from 'nestjs-cls';

export const APP_MODULE_CONFIG = [
  ClsModule.forRoot({
    global: true,
    middleware: { mount: true }, // auto create context for each request
  }),
  ConfigModule.forRoot({
    isGlobal: true,
    load: [
      databaseConfig,
      authConfig,
      appConfig,
      mailConfig,
      googleConfig,
      redisConfig,
    ],
    envFilePath: ['.env'],
  }),
  TypeOrmModule.forRootAsync({
    useClass: TypeOrmConfigService,
    dataSourceFactory: async (options: DataSourceOptions) => {
      return new DataSource(options).initialize();
    },
  }),
  I18nModule.forRootAsync({
    useFactory: (configService: ConfigService<AllConfigType>) => ({
      fallbackLanguage: configService.getOrThrow('app.fallbackLanguage', {
        infer: true,
      }),
      loaderOptions: { path: path.join(__dirname, '../../i18n/'), watch: true },
    }),
    resolvers: [
      {
        use: HeaderResolver,
        useFactory: (configService: ConfigService<AllConfigType>) => {
          return [
            configService.get('app.headerLanguage', {
              infer: true,
            }),
          ];
        },
        inject: [ConfigService],
      },
    ],
    imports: [ConfigModule],
    inject: [ConfigService],
  }),
];
