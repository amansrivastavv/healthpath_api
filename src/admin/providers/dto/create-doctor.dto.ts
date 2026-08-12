import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsEnum,
  IsUUID,
  IsArray,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { Gender, ConsultationType, VerificationStatus } from '@prisma/client';

export class CreateDoctorDto {
  @ApiProperty({ example: 'Dr. Sarah Connor' })
  @IsString()
  @IsNotEmpty({ message: 'Full name is required' })
  @Transform(({ value }: { value: unknown }): unknown =>
    typeof value === 'string' ? value.trim() : value,
  )
  fullName: string;

  @ApiProperty({ example: 'd3b07384-d113-4956-a5e2-e1c7d23d8c8d' })
  @IsUUID('4', { message: 'Invalid specialization ID' })
  @IsNotEmpty({ message: 'Specialization ID is required' })
  specializationId: string;

  @ApiProperty({ example: 'MBBS, MD (Cardiology)' })
  @IsString()
  @IsNotEmpty({ message: 'Qualification is required' })
  qualification: string;

  @ApiProperty({ example: 10, default: 0 })
  @IsNumber({}, { message: 'Experience years must be a number' })
  @Min(0, { message: 'Experience years must be >= 0' })
  @Type(() => Number)
  experienceYears: number;

  @ApiProperty({ example: 'MCI-123456' })
  @IsString()
  @IsNotEmpty({ message: 'Medical registration number is required' })
  medicalRegistrationNumber: string;

  @ApiProperty({ enum: Gender, example: Gender.FEMALE })
  @IsEnum(Gender, { message: 'Gender must be MALE, FEMALE, or OTHER' })
  gender: Gender;

  @ApiPropertyOptional({ example: ['English', 'Hindi'], type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  languages?: string[];

  @ApiPropertyOptional({ example: 'Experienced cardiologist specializing in heart failure treatment.' })
  @IsOptional()
  @IsString()
  about?: string;

  @ApiPropertyOptional({ example: 800, default: 0 })
  @IsOptional()
  @IsNumber({}, { message: 'Consultation fee must be a number' })
  @Min(0)
  @Type(() => Number)
  consultationFee?: number;

  @ApiPropertyOptional({ example: 600 })
  @IsOptional()
  @IsNumber({}, { message: 'Online fee must be a number' })
  @Min(0)
  @Type(() => Number)
  onlineConsultationFee?: number;

  @ApiPropertyOptional({ example: 800 })
  @IsOptional()
  @IsNumber({}, { message: 'In-person fee must be a number' })
  @Min(0)
  @Type(() => Number)
  inPersonConsultationFee?: number;

  @ApiPropertyOptional({ example: 1500 })
  @IsOptional()
  @IsNumber({}, { message: 'Home visit fee must be a number' })
  @Min(0)
  @Type(() => Number)
  homeVisitFee?: number;

  @ApiPropertyOptional({
    enum: ConsultationType,
    isArray: true,
    example: [ConsultationType.IN_PERSON, ConsultationType.ONLINE],
  })
  @IsOptional()
  @IsArray()
  @IsEnum(ConsultationType, { each: true, message: 'Invalid consultation type' })
  consultationTypes?: ConsultationType[];

  @ApiProperty({ example: 'e5f6g7h8-d113-4956-a5e2-e1c7d23d8c8d' })
  @IsUUID('4', { message: 'Invalid provider ID' })
  @IsNotEmpty({ message: 'Provider ID is required' })
  providerId: string;

  @ApiPropertyOptional({ example: true, type: 'boolean' })
  @IsOptional()
  @Transform(({ value }: { value: unknown }) => value === 'true' || value === true)
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ enum: VerificationStatus, example: VerificationStatus.VERIFIED })
  @IsOptional()
  @IsEnum(VerificationStatus)
  verificationStatus?: VerificationStatus;

  @ApiPropertyOptional({
    type: 'string',
    format: 'binary',
    description: 'Direct file upload for profile image',
  })
  @IsOptional()
  profileImage?: any;
}
