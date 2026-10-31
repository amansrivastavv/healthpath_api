import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { Gender, ReportType } from '@prisma/client';

export class UploadReportDto {
  @ApiProperty({
    description: 'Title of the medical report',
    example: 'Complete Blood Count (CBC) Report',
  })
  @IsNotEmpty({ message: 'Title is required' })
  @IsString()
  title: string;

  @ApiPropertyOptional({
    enum: ReportType,
    default: ReportType.LAB_REPORT,
    description: 'Type of report (LAB_REPORT, PRESCRIPTION, RADIOLOGY_SCAN, DISCHARGE_SUMMARY, OTHER)',
    example: ReportType.LAB_REPORT,
  })
  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.toUpperCase() : value,
  )
  @IsEnum(ReportType)
  reportType?: ReportType = ReportType.LAB_REPORT;

  @ApiPropertyOptional({
    description: 'Detailed description, clinical observations or diagnostic remarks',
    example: 'Hemoglobin slightly low at 11.2 g/dL. All other CBC parameters are within normal limits.',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Patient full name',
    example: 'Rahul Verma',
  })
  @IsNotEmpty({ message: 'Patient name is required' })
  @IsString()
  patientName: string;

  @ApiProperty({
    description: 'Patient mobile phone number (used for linking report to patient mobile app)',
    example: '+919876543210',
  })
  @IsNotEmpty({ message: 'Patient phone number is required' })
  @IsString()
  patientPhone: string;

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
  patientAge?: number;

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
  patientGender?: Gender;

  @ApiPropertyOptional({
    description: 'Optional appointment / booking UUID this report belongs to',
    example: 'c1f7a0b3-96b4-4b55-83c7-31637c22998a',
  })
  @IsOptional()
  @IsUUID('4', { message: 'Invalid bookingId UUID format' })
  bookingId?: string;

  @ApiPropertyOptional({
    description: 'Optional Diagnostic Test UUID (for lab test reports)',
    example: 'b37d23fd-7279-4056-8422-d73c99f22baf',
  })
  @IsOptional()
  @IsUUID('4', { message: 'Invalid testId UUID format' })
  testId?: string;

  @ApiPropertyOptional({
    description: 'Optional Doctor UUID (if hospital is uploading on behalf of an attending doctor)',
    example: 'd-doctor-uuid',
  })
  @IsOptional()
  @IsUUID('4', { message: 'Invalid doctorId UUID format' })
  doctorId?: string;

  @ApiPropertyOptional({
    description: 'Date of consultation / test / report generation (YYYY-MM-DD)',
    example: '2026-11-01',
  })
  @IsOptional()
  @IsString()
  reportDate?: string;
}

