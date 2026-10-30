import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { Gender, BookingMode } from '@prisma/client';

export class PatientDetailsDto {
  @ApiProperty({
    example: 'Rahul Verma',
    description: 'Full name of the patient',
  })
  @IsString()
  @IsNotEmpty({ message: 'Patient name is required' })
  patientName: string;

  @ApiProperty({
    example: 32,
    description: 'Age of the patient',
  })
  @IsInt({ message: 'Age must be an integer' })
  @Min(0, { message: 'Age must be at least 0' })
  @Max(150, { message: 'Age must not exceed 150' })
  @Type(() => Number)
  age: number;

  @ApiProperty({
    enum: Gender,
    example: Gender.MALE,
    description: 'Gender of the patient (MALE, FEMALE, OTHER)',
  })
  @Transform(({ value }) =>
    typeof value === 'string' ? value.toUpperCase() : value,
  )
  @IsEnum(Gender, {
    message: 'Gender must be MALE, FEMALE, or OTHER',
  })
  gender: Gender;

  @ApiProperty({
    example: '+919876543210',
    description: 'Contact phone number of the patient',
  })
  @IsString()
  @IsNotEmpty({ message: 'Phone number is required' })
  phone: string;

  @ApiPropertyOptional({
    example: 'Experiencing mild fever and headache for 2 days',
    description: 'Reason for the consultation or symptoms',
  })
  @IsOptional()
  @IsString()
  reason?: string;
}

export class CreateBookingDto {
  @ApiProperty({
    example: 500,
    description: 'Price / consultation fee for the booking',
  })
  @IsNumber({}, { message: 'Price must be a valid number' })
  @Min(0, { message: 'Price must be greater than or equal to 0' })
  @Type(() => Number)
  price: number;

  @ApiProperty({
    example: '2026-11-15',
    description: 'Booking appointment date (YYYY-MM-DD or ISO 8601 string)',
  })
  @IsNotEmpty({ message: 'Date is required' })
  @IsString()
  date: string;

  @ApiPropertyOptional({
    example: '10:30 AM',
    description:
      'Available slot time for appointment (e.g., 10:30 AM, 11:00 AM)',
  })
  @IsOptional()
  @IsString()
  availableSlotTime?: string;

  @ApiPropertyOptional({
    example: '10:30 AM',
    description: 'Alternative alias for slot time',
  })
  @IsOptional()
  @IsString()
  slotTime?: string;

  @ApiProperty({
    enum: BookingMode,
    example: BookingMode.ONLINE,
    description: 'Consultation mode (ONLINE or OFFLINE)',
  })
  @Transform(({ value }) =>
    typeof value === 'string' ? value.toUpperCase() : value,
  )
  @IsEnum(BookingMode, {
    message: 'Mode must be ONLINE or OFFLINE (case-insensitive)',
  })
  mode: BookingMode;

  @ApiPropertyOptional({
    type: () => PatientDetailsDto,
    description: 'Patient details object (name, age, gender, phone, reason)',
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => PatientDetailsDto)
  patientDetails?: PatientDetailsDto;

  @ApiPropertyOptional({
    example: 'Rahul Verma',
    description:
      'Patient full name (can also be provided inside patientDetails)',
  })
  @IsOptional()
  @IsString()
  patientName?: string;

  @ApiPropertyOptional({
    example: 32,
    description: 'Patient age (can also be provided inside patientDetails)',
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(150)
  @Type(() => Number)
  age?: number;

  @ApiPropertyOptional({
    enum: Gender,
    example: Gender.MALE,
    description: 'Patient gender (can also be provided inside patientDetails)',
  })
  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.toUpperCase() : value,
  )
  @IsEnum(Gender)
  gender?: Gender;

  @ApiPropertyOptional({
    example: '+919876543210',
    description:
      'Patient phone number (can also be provided inside patientDetails)',
  })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({
    example: 'Experiencing mild fever and headache for 2 days',
    description:
      'Reason for consultation (can also be provided inside patientDetails)',
  })
  @IsOptional()
  @IsString()
  reason?: string;

  @ApiPropertyOptional({
    description: 'UUID of the Doctor (optional, if booking a specific doctor)',
  })
  @IsOptional()
  @IsUUID('4', { message: 'doctorId must be a valid UUID v4' })
  doctorId?: string;

  @ApiPropertyOptional({
    description: 'UUID of the Provider/Clinic/Hospital (optional)',
  })
  @IsOptional()
  @IsUUID('4', { message: 'providerId must be a valid UUID v4' })
  providerId?: string;

  @ApiPropertyOptional({
    description: 'UUID of the Diagnostic Test (optional, if booking a lab test)',
  })
  @IsOptional()
  @IsUUID('4', { message: 'testId must be a valid UUID v4' })
  testId?: string;

  @ApiPropertyOptional({
    example: 'Please call before arriving',
    description: 'Additional notes or special instructions',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
