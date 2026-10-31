import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { BookingMode, BookingStatus, PaymentStatus } from '@prisma/client';

export class GetAdminBookingsDto {
  @ApiPropertyOptional({ default: 1, minimum: 1, description: 'Page number' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    default: 10,
    minimum: 1,
    maximum: 100,
    description: 'Items per page',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @ApiPropertyOptional({
    enum: BookingStatus,
    description: 'Filter by booking status (PENDING, CONFIRMED, COMPLETED, CANCELLED)',
  })
  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.toUpperCase() : value,
  )
  @IsEnum(BookingStatus)
  status?: BookingStatus;

  @ApiPropertyOptional({
    enum: PaymentStatus,
    description: 'Filter by payment status (PENDING, PAID, FAILED, REFUNDED)',
  })
  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.toUpperCase() : value,
  )
  @IsEnum(PaymentStatus)
  paymentStatus?: PaymentStatus;

  @ApiPropertyOptional({
    enum: BookingMode,
    description: 'Filter by booking mode (ONLINE, OFFLINE)',
  })
  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.toUpperCase() : value,
  )
  @IsEnum(BookingMode)
  mode?: BookingMode;

  @ApiPropertyOptional({
    description:
      'Search across booking reference, patient name, patient phone, doctor name, provider name, or user email',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Filter bookings by Doctor UUID',
  })
  @IsOptional()
  @IsUUID()
  doctorId?: string;

  @ApiPropertyOptional({
    description: 'Filter bookings by Provider (Clinic/Hospital/Lab) UUID',
  })
  @IsOptional()
  @IsUUID()
  providerId?: string;

  @ApiPropertyOptional({
    description: 'Filter bookings by Diagnostic Test UUID',
  })
  @IsOptional()
  @IsUUID()
  testId?: string;

  @ApiPropertyOptional({
    description: 'Filter bookings by registered User ID',
  })
  @IsOptional()
  @IsUUID()
  userId?: string;

  @ApiPropertyOptional({
    description: 'Filter bookings on or after this date (YYYY-MM-DD)',
  })
  @IsOptional()
  @IsString()
  fromDate?: string;

  @ApiPropertyOptional({
    description: 'Filter bookings on or before this date (YYYY-MM-DD)',
  })
  @IsOptional()
  @IsString()
  toDate?: string;

  @ApiPropertyOptional({
    enum: ['createdAt', 'date', 'price', 'status'],
    default: 'createdAt',
    description: 'Sort by column',
  })
  @IsOptional()
  @IsString()
  sortBy?: 'createdAt' | 'date' | 'price' | 'status' = 'createdAt';

  @ApiPropertyOptional({
    enum: ['asc', 'desc'],
    default: 'desc',
    description: 'Sort direction',
  })
  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.toLowerCase() : value,
  )
  @IsEnum(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc' = 'desc';
}
