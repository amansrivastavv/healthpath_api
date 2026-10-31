import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';
import { BookingStatus, PaymentStatus } from '@prisma/client';

export class UpdateAdminBookingStatusDto {
  @ApiPropertyOptional({
    enum: BookingStatus,
    description: 'Booking status (PENDING, CONFIRMED, COMPLETED, CANCELLED)',
    example: BookingStatus.CONFIRMED,
  })
  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.toUpperCase() : value,
  )
  @IsEnum(BookingStatus, {
    message: `Status must be one of the following: ${Object.values(BookingStatus).join(', ')}`,
  })
  status?: BookingStatus;

  @ApiPropertyOptional({
    enum: PaymentStatus,
    description: 'Payment status (PENDING, PAID, FAILED, REFUNDED)',
    example: PaymentStatus.PAID,
  })
  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.toUpperCase() : value,
  )
  @IsEnum(PaymentStatus, {
    message: `Payment status must be one of the following: ${Object.values(PaymentStatus).join(', ')}`,
  })
  paymentStatus?: PaymentStatus;

  @ApiPropertyOptional({
    description: 'Internal admin notes or cancellation reason',
    example: 'Patient completed the consultation successfully',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}

