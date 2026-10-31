import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { BookingMode, BookingStatus, Gender, PaymentStatus } from '@prisma/client';

export class UpdateAdminBookingDto {
  @ApiPropertyOptional({
    enum: BookingStatus,
    description: 'Booking status (PENDING, CONFIRMED, COMPLETED, CANCELLED)',
    example: BookingStatus.CONFIRMED,
  })
  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.toUpperCase() : value,
  )
  @IsEnum(BookingStatus)
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
  @IsEnum(PaymentStatus)
  paymentStatus?: PaymentStatus;

  @ApiPropertyOptional({
    description: 'Appointment date in ISO format or YYYY-MM-DD',
    example: '2026-11-15',
  })
  @IsOptional()
  @IsString()
  date?: string;

  @ApiPropertyOptional({
    description: 'Appointment time slot',
    example: '10:30 AM',
  })
  @IsOptional()
  @IsString()
  slotTime?: string;

  @ApiPropertyOptional({
    enum: BookingMode,
    description: 'Consultation mode (ONLINE, OFFLINE)',
    example: BookingMode.ONLINE,
  })
  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.toUpperCase() : value,
  )
  @IsEnum(BookingMode)
  mode?: BookingMode;

  @ApiPropertyOptional({
    description: 'Patient full name',
    example: 'Rahul Verma',
  })
  @IsOptional()
  @IsString()
  patientName?: string;

  @ApiPropertyOptional({
    description: 'Patient age in years',
    example: 32,
    minimum: 0,
    maximum: 150,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(150)
  age?: number;

  @ApiPropertyOptional({
    enum: Gender,
    description: 'Patient gender (MALE, FEMALE, OTHER)',
    example: Gender.MALE,
  })
  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.toUpperCase() : value,
  )
  @IsEnum(Gender)
  gender?: Gender;

  @ApiPropertyOptional({
    description: 'Patient phone number',
    example: '+919876543210',
  })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({
    description: 'Consultation reason or symptoms described by patient',
    example: 'Follow-up consultation after lab report analysis',
  })
  @IsOptional()
  @IsString()
  reason?: string;

  @ApiPropertyOptional({
    description: 'Booking fee / price in INR',
    example: 600,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  price?: number;

  @ApiPropertyOptional({
    description: 'Internal admin / doctor notes',
    example: 'Rescheduled upon patient request due to fever.',
  })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({
    description: 'Reassign Doctor UUID',
  })
  @IsOptional()
  @IsUUID()
  doctorId?: string;

  @ApiPropertyOptional({
    description: 'Reassign Provider UUID',
  })
  @IsOptional()
  @IsUUID()
  providerId?: string;

  @ApiPropertyOptional({
    description: 'Reassign Diagnostic Test UUID',
  })
  @IsOptional()
  @IsUUID()
  testId?: string;

  @ApiPropertyOptional({
    description: 'Razorpay Order ID',
  })
  @IsOptional()
  @IsString()
  razorpayOrderId?: string;

  @ApiPropertyOptional({
    description: 'Razorpay Payment ID',
  })
  @IsOptional()
  @IsString()
  razorpayPaymentId?: string;

  @ApiPropertyOptional({
    description: 'Razorpay Signature',
  })
  @IsOptional()
  @IsString()
  razorpaySignature?: string;
}
