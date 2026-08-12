import { Module } from '@nestjs/common';
import { AdminAuthModule } from '../auth/admin-auth.module';
import { AdminSpecializationsController } from './admin-specializations.controller';
import { AdminSpecializationsService } from './admin-specializations.service';

@Module({
  imports: [AdminAuthModule],
  controllers: [AdminSpecializationsController],
  providers: [AdminSpecializationsService],
  exports: [AdminSpecializationsService],
})
export class AdminSpecializationsModule {}
