import { Module } from '@nestjs/common';
import { AdminProvidersController } from './admin-providers.controller';

@Module({
  controllers: [AdminProvidersController],
})
export class AdminProvidersModule {}
