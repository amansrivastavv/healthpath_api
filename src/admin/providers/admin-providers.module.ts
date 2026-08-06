import { Module } from '@nestjs/common';
import { AdminProvidersService } from './admin-providers.service';
import { AdminProvidersController } from './admin-providers.controller';
import { JwtModule } from '@nestjs/jwt';
import { R2Module } from '../../r2/r2.module';

@Module({
  imports: [JwtModule, R2Module],
  controllers: [AdminProvidersController],
  providers: [AdminProvidersService],
  exports: [AdminProvidersService],
})
export class AdminProvidersModule {}
