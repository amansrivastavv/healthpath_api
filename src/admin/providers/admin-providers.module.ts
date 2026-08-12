import { Module } from '@nestjs/common';
import { R2Module } from '../../r2/r2.module';
import { AdminAuthModule } from '../auth/admin-auth.module';
import { AdminProvidersService } from './admin-providers.service';
import { AdminProvidersController } from './admin-providers.controller';
import { AdminDoctorsService } from './admin-doctors.service';
import { AdminDoctorsController } from './admin-doctors.controller';
import { AdminAvailabilityService } from './admin-availability.service';
import { AdminAvailabilityController } from './admin-availability.controller';
import { AdminDocumentsService } from './admin-documents.service';
import { AdminDocumentsController } from './admin-documents.controller';

@Module({
  imports: [AdminAuthModule, R2Module],
  controllers: [
    AdminProvidersController,
    AdminDoctorsController,
    AdminAvailabilityController,
    AdminDocumentsController,
  ],
  providers: [
    AdminProvidersService,
    AdminDoctorsService,
    AdminAvailabilityService,
    AdminDocumentsService,
  ],
  exports: [
    AdminProvidersService,
    AdminDoctorsService,
    AdminAvailabilityService,
    AdminDocumentsService,
  ],
})
export class AdminProvidersModule {}
