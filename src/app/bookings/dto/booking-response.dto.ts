import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  BookingMode,
  BookingStatus,
  Gender,
  PaymentStatus,
  ProviderType,
} from '@prisma/client';

export class BookingPatientResponseDto {
  @ApiProperty({ example: 'Rahul Verma' })
  patientName: string;

  @ApiProperty({ example: 32 })
  age: number;

  @ApiProperty({ enum: Gender, example: Gender.MALE })
  gender: Gender;

  @ApiProperty({ example: '+919876543210' })
  phone: string;

  @ApiPropertyOptional({ example: 'Experiencing mild fever and headache' })
  reason?: string | null;
}

export class BookingDoctorSummaryDto {
  @ApiProperty({ example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' })
  id: string;

  @ApiProperty({ example: 'Dr. Rajesh Kumar' })
  fullName: string;

  @ApiPropertyOptional({ example: 'https://example.com/doctor.jpg' })
  profileImage?: string | null;

  @ApiPropertyOptional({ example: 'Cardiology' })
  specialization?: string | null;
}

export class BookingProviderSummaryDto {
  @ApiProperty({ example: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22' })
  id: string;

  @ApiProperty({ example: 'City Care Hospital' })
  name: string;

  @ApiProperty({ enum: ProviderType, example: ProviderType.HOSPITAL })
  type: ProviderType;

  @ApiPropertyOptional({ example: 'Mumbai' })
  city?: string | null;

  @ApiPropertyOptional({ example: '123 Marine Lines' })
  address?: string | null;
}

export class BookingTestSummaryDto {
  @ApiProperty({ example: 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33' })
  id: string;

  @ApiProperty({ example: 'Complete Blood Count (CBC)' })
  name: string;

  @ApiPropertyOptional({ example: 'CBC01' })
  code?: string | null;
}

export class BookingRazorpayOrderDto {
  @ApiProperty({ example: 'order_PU3bQx1zY2a3b4', description: 'Razorpay Order ID' })
  orderId: string;

  @ApiProperty({ example: 50000, description: 'Amount in paise (e.g. 500 INR = 50000 paise)' })
  amount: number;

  @ApiProperty({ example: 500, description: 'Amount in INR' })
  amountInRupees: number;

  @ApiProperty({ example: 'INR', description: 'Currency code' })
  currency: string;

  @ApiProperty({ example: 'rzp_test_Tu2ZhwagzsADdl', description: 'Public key ID for checkout' })
  keyId: string;
}

export class BookingResponseDto {
  @ApiProperty({ example: 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44' })
  id: string;

  @ApiProperty({ example: 'HP-BK-20261030-A1B2' })
  bookingReference: string;

  @ApiProperty({ example: 500 })
  price: number;

  @ApiProperty({ example: '2026-11-15' })
  date: string;

  @ApiProperty({ example: '10:30 AM' })
  slotTime: string;

  @ApiProperty({ example: '10:30 AM' })
  availableSlotTime: string;

  @ApiProperty({ enum: BookingMode, example: BookingMode.ONLINE })
  mode: BookingMode;

  @ApiProperty({ type: () => BookingPatientResponseDto })
  patientDetails: BookingPatientResponseDto;

  @ApiProperty({ enum: BookingStatus, example: BookingStatus.PENDING })
  status: BookingStatus;

  @ApiProperty({ enum: PaymentStatus, example: PaymentStatus.PENDING })
  paymentStatus: PaymentStatus;

  @ApiPropertyOptional({ example: 'Please call before arriving' })
  notes?: string | null;

  @ApiPropertyOptional({ type: () => BookingDoctorSummaryDto })
  doctor?: BookingDoctorSummaryDto | null;

  @ApiPropertyOptional({ type: () => BookingProviderSummaryDto })
  provider?: BookingProviderSummaryDto | null;

  @ApiPropertyOptional({ type: () => BookingTestSummaryDto })
  test?: BookingTestSummaryDto | null;

  @ApiPropertyOptional({ example: 'u0eebc99-9c0b-4ef8-bb6d-6bb9bd380a00' })
  userId?: string | null;

  @ApiPropertyOptional({ type: () => BookingRazorpayOrderDto, description: 'Razorpay checkout configuration for frontend popup' })
  payment?: BookingRazorpayOrderDto | null;

  @ApiPropertyOptional({ example: 'order_PU3bQx1zY2a3b4' })
  razorpayOrderId?: string | null;

  @ApiPropertyOptional({ example: 'pay_PU3cDe5fG6h7i8' })
  razorpayPaymentId?: string | null;

  @ApiProperty({ example: '2026-10-30T07:30:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2026-10-30T07:30:00.000Z' })
  updatedAt: Date;
}

export class BookingPaginationMetaDto {
  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 10 })
  limit: number;

  @ApiProperty({ example: 25 })
  total: number;

  @ApiProperty({ example: 3 })
  totalPages: number;
}

export class BookingListResponseDto {
  @ApiProperty({ type: [BookingResponseDto] })
  items: BookingResponseDto[];

  @ApiProperty({ type: () => BookingPaginationMetaDto })
  meta: BookingPaginationMetaDto;
}
