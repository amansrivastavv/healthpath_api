import { Module } from '@nestjs/common';
import { ProvidersController } from './providers.controller';
import { ProvidersService } from './providers.service';

/**
 * Module for App Providers feature.
 * Contains provider search, details, and nearby functionality.
 */
@Module({
  controllers: [ProvidersController],
  providers: [ProvidersService],
  exports: [ProvidersService],
})
export class AppProvidersModule {}
