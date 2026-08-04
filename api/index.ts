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

    // Security Headers
    app.use(
      helmet({
        contentSecurityPolicy: false,
        crossOriginEmbedderPolicy: false,
      }),
    );

    // CORS
    const allowedOrigins = process.env.CORS_ORIGIN
      ? process.env.CORS_ORIGIN.split(',')
      : ['http://localhost:5173', 'http://localhost:3000'];

    app.enableCors({
      origin: allowedOrigins,
      credentials: true,
    });

    // Global Prefix
    app.setGlobalPrefix('api', {
      exclude: [
        'health',
        'api/health',
        'docs',
        'docs/{*path}',
        'api/docs',
        'api/docs/{*path}',
      ],
    });

    // API Versioning
    app.enableVersioning({
      type: VersioningType.URI,
    });

    // Validation
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      }),
    );

    // Swagger
    const config = new DocumentBuilder()
      .setTitle('HealthPath API')
      .setDescription('HealthPath Backend API Documentation')
      .setVersion('1.0.0')
      .addBearerAuth()
      .build();

    const document = SwaggerModule.createDocument(app, config);

    const customOptions: SwaggerCustomOptions = {
      customSiteTitle: 'HealthPath API Docs',
    };

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