import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  BookingMode,
  BookingStatus,
  Gender,
  PaymentStatus,
  ProviderType,
} from '@prisma/client';

export class AdminBookingUserDto {
  @ApiProperty({ example: 'u-1234-uuid' })
  id: string;

  @ApiProperty({ example: 'John Doe' })
  fullName: string;

  @ApiProperty({ example: 'john@example.com' })
  email: string;

  @ApiPropertyOptional({ example: '+919876543210' })
  phoneNumber?: string | null;
}

export class AdminBookingDoctorDto {
  @ApiProperty({ example: 'd-1234-uuid' })
  id: string;

  @ApiProperty({ example: 'Dr. Ramesh Gupta' })
  fullName: string;

  @ApiPropertyOptional({ example: 'https://example.com/doctor.jpg' })
  profileImage?: string | null;

  @ApiPropertyOptional({ example: 'Cardiology' })
  specialization?: string | null;

  @ApiPropertyOptional({ example: 500 })
  consultationFee?: number | null;
}

export class AdminBookingProviderDto {
  @ApiProperty({ example: 'p-1234-uuid' })
  id: string;

  @ApiProperty({ example: 'Apollo Clinic' })
  name: string;

  @ApiProperty({ enum: ProviderType, example: ProviderType.CLINIC })
  type: ProviderType;

  @ApiPropertyOptional({ example: 'Mumbai' })
  city?: string | null;

  @ApiPropertyOptional({ example: 'Maharashtra' })
  state?: string | null;

  @ApiPropertyOptional({ example: '123 Health Way' })
  address?: string | null;

  @ApiPropertyOptional({ example: '+919876500000' })
  phone?: string | null;
}

export class AdminBookingTestDto {
  @ApiProperty({ example: 't-1234-uuid' })
  id: string;

  @ApiProperty({ example: 'Lipid Profile' })
  name: string;

  @ApiPropertyOptional({ example: 'LPD01' })
  code?: string | null;

  @ApiPropertyOptional({ example: 450 })
  price?: number | null;
}

export class AdminBookingPatientDto {
  @ApiProperty({ example: 'Rahul Verma' })
  patientName: string;

  @ApiProperty({ example: 32 })
  age: number;

  @ApiProperty({ enum: Gender, example: Gender.MALE })
  gender: Gender;

  @ApiProperty({ example: '+919876543210' })
  phone: string;

  @ApiPropertyOptional({ example: 'High fever and headache' })
  reason?: string | null;
}

export class AdminBookingItemDto {
  @ApiProperty({ example: 'b-1234-uuid' })
  id: string;

  @ApiProperty({ example: 'HP-BK-20261030-A1B2' })
  bookingReference: string;

  @ApiProperty({ example: 500 })
  price: number;

  @ApiProperty({ example: '2026-11-15' })
  date: string;

  @ApiProperty({ example: '10:30 AM' })
  slotTime: string;

  @ApiProperty({ enum: BookingMode, example: BookingMode.ONLINE })
  mode: BookingMode;

  @ApiProperty({ enum: BookingStatus, example: BookingStatus.CONFIRMED })
  status: BookingStatus;

  @ApiProperty({ enum: PaymentStatus, example: PaymentStatus.PAID })
  paymentStatus: PaymentStatus;

  @ApiProperty({ type: AdminBookingPatientDto })
  patientDetails: AdminBookingPatientDto;

  @ApiPropertyOptional({ type: AdminBookingUserDto })
  user?: AdminBookingUserDto | null;

  @ApiPropertyOptional({ type: AdminBookingDoctorDto })
  doctor?: AdminBookingDoctorDto | null;

  @ApiPropertyOptional({ type: AdminBookingProviderDto })
  provider?: AdminBookingProviderDto | null;

  @ApiPropertyOptional({ type: AdminBookingTestDto })
  test?: AdminBookingTestDto | null;

  @ApiPropertyOptional({ example: 'Internal admin notes' })
  notes?: string | null;

  @ApiPropertyOptional({ example: 'order_PU3bQx1zY2a3b4' })
  razorpayOrderId?: string | null;

  @ApiPropertyOptional({ example: 'pay_PU3bQx1zY2a3b4' })
  razorpayPaymentId?: string | null;

  @ApiProperty({ example: '2026-10-30T10:00:00.000Z' })
  createdAt: string;

  @ApiProperty({ example: '2026-10-30T10:00:00.000Z' })
  updatedAt: string;
}

export class AdminBookingMetaDto {
  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 10 })
  limit: number;

  @ApiProperty({ example: 52 })
  total: number;

  @ApiProperty({ example: 6 })
  totalPages: number;
}

export class AdminBookingSummaryDto {
  @ApiProperty({ example: 52 })
  totalBookings: number;

  @ApiProperty({ example: 12 })
  pending: number;

  @ApiProperty({ example: 25 })
  confirmed: number;

  @ApiProperty({ example: 10 })
  completed: number;

  @ApiProperty({ example: 5 })
  cancelled: number;

  @ApiProperty({ example: 26000 })
  totalRevenue: number;
}

export class AdminBookingListResultDto {
  @ApiProperty({ type: [AdminBookingItemDto] })
  items: AdminBookingItemDto[];

  @ApiProperty({ type: AdminBookingMetaDto })
  meta: AdminBookingMetaDto;

  @ApiProperty({ type: AdminBookingSummaryDto })
  summary: AdminBookingSummaryDto;
}

export class AdminBookingListResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'Bookings retrieved successfully' })
  message: string;

  @ApiProperty({ type: AdminBookingListResultDto })
  data: AdminBookingListResultDto;
}

export class AdminBookingSingleResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'Booking retrieved successfully' })
  message: string;

  @ApiProperty({ type: AdminBookingItemDto })
  data: AdminBookingItemDto;
}
