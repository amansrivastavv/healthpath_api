import { Module } from '@nestjs/common';
import { BookingsController } from './bookings.controller';
import { BookingsService } from './bookings.service';
import { RazorpayService } from './razorpay.service';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [BookingsController],
  providers: [BookingsService, RazorpayService],
  exports: [BookingsService, RazorpayService],
})
export class AppBookingsModule {}
