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

  const port = process.env.PORT || 3000;
  await app.listen(port);

  logger.log(`Application running on: http://localhost:${port}`);
  logger.log(
    `Swagger Docs available at: http://localhost:${port}/docs and http://localhost:${port}/api/docs`,
  );
}

void bootstrap();
