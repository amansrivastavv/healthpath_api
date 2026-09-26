import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  SwaggerModule,
  DocumentBuilder,
  SwaggerCustomOptions,
} from '@nestjs/swagger';
import {
  ValidationPipe,
  VersioningType,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import helmet from 'helmet';
import { ValidationError } from 'class-validator';

import { AppFeatureModule } from './app/app-feature.module';
import { AdminModule } from './admin/admin.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

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
  app.enableVersioning({
    type: VersioningType.URI,
  });

  // Validation Pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      exceptionFactory: (validationErrors: ValidationError[]) => {
        const formatErrors = (
          errors: ValidationError[],
        ): Array<{ field: string; message: string }> => {
          const result: Array<{ field: string; message: string }> = [];
          for (const error of errors) {
            if (error.constraints) {
              result.push({
                field: error.property,
                message: Object.values(error.constraints)[0] || 'Invalid value',
              });
            }
            if (error.children && error.children.length > 0) {
              result.push(...formatErrors(error.children));
            }
          }
          return result;
        };

        const formattedErrors = formatErrors(validationErrors);
        return new BadRequestException({
          message: 'Validation failed',
          errors: formattedErrors,
        });
      },
    }),
  );

  // ─── Shared Swagger UI Options ───
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

  const port = process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0');

  logger.log(`Application running on: http://localhost:${port}`);
  logger.log(
    `Patient API Docs: http://localhost:${port}/api/docs`,
  );
  logger.log(
    `Admin API Docs:   http://localhost:${port}/admin/docs`,
  );
}

void bootstrap();
