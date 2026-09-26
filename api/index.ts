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
import { AppFeatureModule } from '../src/app/app-feature.module';
import { AdminModule } from '../src/admin/admin.module';

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
        '/',
        '',
        'health',
        'api/health',
        'docs',
        'docs/{*path}',
        'api/docs',
        'api/docs/{*path}',
        'admin/docs',
        'admin/docs/{*path}',
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

    const swaggerUiOptions: SwaggerCustomOptions = {
      customCssUrl: [
        'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.18.2/swagger-ui.min.css',
      ],
      customJs: [
        'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.18.2/swagger-ui-bundle.min.js',
        'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.18.2/swagger-ui-standalone-preset.min.js',
      ],
    };

    // ─── Patient API Swagger (/api/docs) ───
    const patientConfig = new DocumentBuilder()
      .setTitle('HealthPath Patient API')
      .setDescription(
        'Patient-facing API for HealthPath — authentication, profile, providers, bookings, tests, reports & notifications.',
      )
      .setVersion('1.0.0')
      .addBearerAuth()
      .build();

    const patientDocument = SwaggerModule.createDocument(app, patientConfig, {
      include: [AppFeatureModule],
      deepScanRoutes: true,
    });

    SwaggerModule.setup('api/docs', app, patientDocument, {
      ...swaggerUiOptions,
      customSiteTitle: 'HealthPath Patient API Docs',
    });

    // ─── Admin API Swagger (/admin/docs) ───
    const adminConfig = new DocumentBuilder()
      .setTitle('HealthPath Admin API')
      .setDescription(
        'Admin Dashboard API for HealthPath — user management, provider management, bookings, reports, settings & more.',
      )
      .setVersion('1.0.0')
      .addBearerAuth()
      .build();

    const adminDocument = SwaggerModule.createDocument(app, adminConfig, {
      include: [AdminModule],
      deepScanRoutes: true,
    });

    SwaggerModule.setup('admin/docs', app, adminDocument, {
      ...swaggerUiOptions,
      customSiteTitle: 'HealthPath Admin API Docs',
    });

    await app.init();
    cachedServer = server;
  }

  return cachedServer;
}

export default async function handler(req: any, res: any) {
  const serverInstance = await bootstrapServer();
  return serverInstance(req, res);
}
