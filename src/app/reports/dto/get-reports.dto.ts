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
import { ReportType } from '@prisma/client';

export class GetReportsDto {
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
    enum: ReportType,
    description: 'Filter by report type (LAB_REPORT, PRESCRIPTION, RADIOLOGY_SCAN, DISCHARGE_SUMMARY, OTHER)',
  })
  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.toUpperCase() : value,
  )
  @IsEnum(ReportType)
  reportType?: ReportType;

  @ApiPropertyOptional({
    description: 'Search by report title, report number, or patient name/phone',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Filter by patient mobile phone number',
  })
  @IsOptional()
  @IsString()
  patientPhone?: string;

  @ApiPropertyOptional({
    description: 'Filter by Doctor UUID',
  })
  @IsOptional()
  @IsUUID('4')
  doctorId?: string;

  @ApiPropertyOptional({
    description: 'Filter by Provider UUID (Hospital/Lab/Clinic)',
  })
  @IsOptional()
  @IsUUID('4')
  providerId?: string;

  @ApiPropertyOptional({
    description: 'Filter reports on or after this date (YYYY-MM-DD)',
  })
  @IsOptional()
  @IsString()
  fromDate?: string;

  @ApiPropertyOptional({
    description: 'Filter reports on or before this date (YYYY-MM-DD)',
  })
  @IsOptional()
  @IsString()
  toDate?: string;
}

