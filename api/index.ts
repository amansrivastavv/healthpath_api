import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import helmet from 'helmet';
import { ExpressAdapter } from '@nestjs/platform-express';
import express, { Express } from 'express';
import {
  SwaggerModule,
  DocumentBuilder,
  SwaggerCustomOptions,
} from '@nestjs/swagger';

const server: Express = express();

let cachedServer: any;

async function bootstrapServer(): Promise<any> {
  if (!cachedServer) {
    const app = await NestFactory.create(AppModule, new ExpressAdapter(server));

    // Security Headers with relaxed CSP for Swagger UI
    app.use(
      helmet({
        contentSecurityPolicy: {
          directives: {
            defaultSrc: [`'self'`],
            styleSrc: [
              `'self'`,
              `'unsafe-inline'`,
              'https://cdnjs.cloudflare.com',
            ],
            scriptSrc: [
              `'self'`,
              `'unsafe-inline'`,
              'https://cdnjs.cloudflare.com',
            ],
            imgSrc: [
              `'self'`,
              'data:',
              'https://validator.swagger.io',
              'https://cdnjs.cloudflare.com',
            ],
          },
        },
      }),
    );

    // CORS Configuration
    const allowedOrigins = process.env.CORS_ORIGIN
      ? process.env.CORS_ORIGIN.split(',')
      : ['http://localhost:5173', 'http://localhost:3000'];

    app.enableCors({
      origin: allowedOrigins,
      credentials: true,
    });

    // Global Prefix & Versioning
    app.setGlobalPrefix('api', {
      exclude: [
        'health',
        'api/health',
        'docs',
        'docs/(.*)',
        'api/docs',
        'api/docs/(.*)',
      ],
    });

    app.enableVersioning({
      type: VersioningType.URI,
    });

    // Validation Pipe
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      }),
    );

    // Swagger Documentation
    const config = new DocumentBuilder()
      .setTitle('HealthPath API')
      .setDescription('HealthPath Backend API')
      .setVersion('1.0.0')
      .addBearerAuth()
      .build();

    const customOptions: SwaggerCustomOptions = {
      customSiteTitle: 'HealthPath API Docs',
      customCssUrl: [
        'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.18.2/swagger-ui.min.css',
      ],
      customJs: [
        'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.18.2/swagger-ui-bundle.min.js',
        'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.18.2/swagger-ui-standalone-preset.min.js',
      ],
    };

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('docs', app, document, customOptions);
    SwaggerModule.setup('api/docs', app, document, customOptions);

    await app.init();
    cachedServer = server;
  }
  return cachedServer;
}

export default async function handler(req: any, res: any) {
  const serverInstance = await bootstrapServer();
  return serverInstance(req, res);
}
