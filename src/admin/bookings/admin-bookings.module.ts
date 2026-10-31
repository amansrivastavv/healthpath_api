import { Module } from '@nestjs/common';
import { AdminAuthModule } from '../auth/admin-auth.module';
import { AdminBookingsController } from './admin-bookings.controller';
import { AdminBookingsService } from './admin-bookings.service';
import { RolesGuard } from '../../common/guards/roles.guard';

@Module({
  imports: [AdminAuthModule],
  controllers: [AdminBookingsController],
  providers: [AdminBookingsService, RolesGuard],
  exports: [AdminBookingsService],
})
export class AdminBookingsModule {}
