import {
  IsString,
  IsNotEmpty,
  IsEmail,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsObject,
  IsEnum,
  IsArray,
  Min,
  Max,
  IsInt,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { ProviderType, VerificationStatus } from '@prisma/client';

export class CreateProviderDto {
  @ApiProperty({ example: 'Apollo Super Speciality Hospital' })
  @IsString()
  @IsNotEmpty({ message: 'Name is required' })
  @Transform(({ value }: { value: unknown }): unknown =>
    typeof value === 'string' ? value.trim() : value,
  )
  name: string;

  @ApiProperty({ example: 'apollo-hospital-gurugram' })
  @IsString()
  @IsNotEmpty({ message: 'Slug is required' })
  slug: string;

  @ApiProperty({ enum: ProviderType, example: ProviderType.HOSPITAL })
  @IsEnum(ProviderType, { message: 'Type must be INDIVIDUAL_DOCTOR, CLINIC, HOSPITAL, LAB, or BOTH' })
  @IsNotEmpty({ message: 'Type is required' })
  type: ProviderType;

  @ApiPropertyOptional({ example: 'Premier multi-speciality hospital offering 24/7 emergency care.' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: 'contact@apollo.com' })
  @IsEmail({}, { message: 'Invalid email address' })
  @IsOptional()
  @Transform(({ value }: { value: unknown }): unknown =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  email?: string;

  @ApiPropertyOptional({ example: '+91-9876543210' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({ example: 'https://www.apollohospitals.com' })
  @IsString()
  @IsOptional()
  website?: string;

  @ApiPropertyOptional({ example: '123, MG Road' })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiPropertyOptional({ example: 'Gurugram' })
  @IsString()
  @IsOptional()
  city?: string;

  @ApiPropertyOptional({ example: 'Haryana' })
  @IsString()
  @IsOptional()
  state?: string;

  @ApiPropertyOptional({ example: 'India' })
  @IsString()
  @IsOptional()
  country?: string;

  @ApiPropertyOptional({ example: '122001' })
  @IsString()
  @IsOptional()
  pincode?: string;

  @ApiPropertyOptional({ example: 28.4595 })
  @IsNumber({}, { message: 'Latitude must be a number' })
  @Min(-90)
  @Max(90)
  @IsOptional()
  @Type(() => Number)
  latitude?: number;

  @ApiPropertyOptional({ example: 77.0266 })
  @IsNumber({}, { message: 'Longitude must be a number' })
  @Min(-180)
  @Max(180)
  @IsOptional()
  @Type(() => Number)
  longitude?: number;

  // Facility Details
  @ApiPropertyOptional({ example: 1995 })
  @IsOptional()
  @IsInt()
  @Min(1800)
  @Max(new Date().getFullYear())
  @Type(() => Number)
  establishedYear?: number;

  @ApiPropertyOptional({ example: true, type: 'boolean' })
  @IsOptional()
  @Transform(({ value }: { value: unknown }) => value === 'true' || value === true)
  @IsBoolean()
  emergencyAvailable?: boolean;

  @ApiPropertyOptional({ example: true, type: 'boolean' })
  @IsOptional()
  @Transform(({ value }: { value: unknown }) => value === 'true' || value === true)
  @IsBoolean()
  available24x7?: boolean;

  @ApiPropertyOptional({ example: true, type: 'boolean' })
  @IsOptional()
  @Transform(({ value }: { value: unknown }) => value === 'true' || value === true)
  @IsBoolean()
  parkingAvailable?: boolean;

  @ApiPropertyOptional({ example: true, type: 'boolean' })
  @IsOptional()
  @Transform(({ value }: { value: unknown }) => value === 'true' || value === true)
  @IsBoolean()
  pharmacyAvailable?: boolean;

  @ApiPropertyOptional({ example: true, type: 'boolean' })
  @IsOptional()
  @Transform(({ value }: { value: unknown }) => value === 'true' || value === true)
  @IsBoolean()
  wheelchairAccessible?: boolean;

  @ApiPropertyOptional({
    example: '{"monday": {"open": "08:00", "close": "20:00"}}',
    type: 'string',
  })
  @IsOptional()
  @Transform(({ value }: { value: unknown }) => {
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    }
    return value;
  })
  @IsObject({ message: 'openingHours must be a valid JSON object' })
  openingHours?: any;

  @ApiPropertyOptional({ example: true, type: 'boolean' })
  @IsOptional()
  @Transform(({ value }: { value: unknown }) => value === 'true' || value === true)
  @IsBoolean()
  homeCollectionAvailable?: boolean;

  @ApiPropertyOptional({
    type: 'string',
    format: 'binary',
    description: 'Direct file upload for profile image',
  })
  @IsOptional()
  profileImage?: any;

  @ApiPropertyOptional({ example: ['https://cdn.example.com/cover1.jpg'], type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  coverImages?: string[];

  @ApiPropertyOptional({ example: true, type: 'boolean' })
  @IsOptional()
  @Transform(({ value }: { value: unknown }) => value === 'true' || value === true)
  @IsBoolean()
  isVerified?: boolean;

  @ApiPropertyOptional({ enum: VerificationStatus, example: VerificationStatus.VERIFIED })
  @IsOptional()
  @IsEnum(VerificationStatus)
  verificationStatus?: VerificationStatus;

  @ApiPropertyOptional({ example: true, type: 'boolean' })
  @IsOptional()
  @Transform(({ value }: { value: unknown }) => value === 'true' || value === true)
  @IsBoolean()
  isActive?: boolean;
}
