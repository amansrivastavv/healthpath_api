import { Module } from '@nestjs/common';
import { AdminBookingsController } from './admin-bookings.controller';

@Module({
  controllers: [AdminBookingsController],
})
export class AdminBookingsModule {}
