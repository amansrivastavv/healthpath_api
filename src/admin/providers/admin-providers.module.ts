import { Module } from '@nestjs/common';
import { AdminProvidersService } from './admin-providers.service';
import { AdminProvidersController } from './admin-providers.controller';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [JwtModule],
  controllers: [AdminProvidersController],
  providers: [AdminProvidersService],
  exports: [AdminProvidersService],
})
export class AdminProvidersModule {}
