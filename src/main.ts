import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import helmet from '@fastify/helmet';
import { patchNestJsSwagger, ZodValidationPipe } from 'nestjs-zod';
import cookie from '@fastify/cookie';
import { AppConfig } from './config/app.config';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );
  const config = app.get<ConfigService<AppConfig>>(ConfigService);
  const logger: Logger = new Logger('main.ts');
  app.setGlobalPrefix('v1');
  app.useGlobalGuards();
  app.useGlobalPipes(new ZodValidationPipe());

  if (
    process.env.NODE_ENV !== 'production' &&
    process.env.NODE_ENV !== 'test'
  ) {
    patchNestJsSwagger();
    const config = new DocumentBuilder()
      .setTitle('API') // TODO: change to the project name
      .setDescription('API') // TODO: change to the project description
      .setVersion('1.0')
      .addTag('api') // TODO: change to the project tags
      .addGlobalResponse({
        status: 401,
        description: 'Unauthorized',
      })
      .addGlobalResponse({
        status: 403,
        description: 'Forbidden',
      })
      .addGlobalResponse({
        status: 404,
        description: 'Not Found',
      })
      .addGlobalResponse({
        status: 500,
        description: 'Internal Server Error',
      })
      .build();
    const documentFactory = () => SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, documentFactory);
  }

  await app.register(cookie, {
    secret: config.get<string>('cookieSecret') ?? 'secret',
  });

  await app.register(helmet, {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: [`'self'`],
        styleSrc: [`'self'`, `'unsafe-inline'`],
        imgSrc: [`'self'`, 'data:', 'validator.swagger.io'],
        scriptSrc: [`'self'`, `https: 'unsafe-inline'`],
      },
    },
  });

  await app.listen(process.env.PORT ?? 5000, '0.0.0.0', () => {
    logger.log(`Server is running on port ${process.env.PORT ?? 5000}`);
  });
}
// eslint-disable-next-line @typescript-eslint/no-floating-promises
bootstrap();
