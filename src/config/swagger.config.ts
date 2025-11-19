import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

const options = new DocumentBuilder()
  .setTitle('API')
  .setDescription('API docs')
  .setVersion('1.0')
  .addBearerAuth()
  .addGlobalParameters({
    in: 'header',
    required: false,
    name: process.env.APP_HEADER_LANGUAGE || 'x-custom-lang',
    schema: {
      example: 'en',
    },
  })
  .build();

export const swaggerSetup = (app: INestApplication) => {
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('docs', app, document);
};
