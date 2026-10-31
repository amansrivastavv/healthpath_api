import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Gender, ReportType } from '@prisma/client';

export class ReportPatientDto {
  @ApiPropertyOptional({ example: 'u-1234-uuid' })
  userId?: string | null;

  @ApiProperty({ example: 'Rahul Verma' })
  patientName: string;

  @ApiProperty({ example: '+919876543210' })
  patientPhone: string;

  @ApiPropertyOptional({ example: 32 })
  patientAge?: number | null;

  @ApiPropertyOptional({ enum: Gender, example: Gender.MALE })
  patientGender?: Gender | null;
}

export class ReportDoctorDto {
  @ApiProperty({ example: 'd-1234-uuid' })
  id: string;

  @ApiProperty({ example: 'Dr. Rajesh Kumar' })
  fullName: string;

  @ApiPropertyOptional({ example: 'General Physician' })
  specialization?: string | null;
}

export class ReportProviderDto {
  @ApiProperty({ example: 'p-1234-uuid' })
  id: string;

  @ApiProperty({ example: 'Apollo Diagnostic Lab' })
  name: string;

  @ApiProperty({ example: 'LAB' })
  type: string;

  @ApiPropertyOptional({ example: 'Mumbai' })
  city?: string | null;
}

export class ReportTestDto {
  @ApiProperty({ example: 't-1234-uuid' })
  id: string;

  @ApiProperty({ example: 'Complete Blood Count (CBC)' })
  name: string;

  @ApiPropertyOptional({ example: 'CBC01' })
  code?: string | null;
}

export class ReportItemDto {
  @ApiProperty({ example: 'r-1234-uuid' })
  id: string;

  @ApiProperty({ example: 'HP-REP-20261101-A1B2' })
  reportNumber: string;

  @ApiProperty({ example: 'Complete Blood Count (CBC) Report' })
  title: string;

  @ApiProperty({ enum: ReportType, example: ReportType.LAB_REPORT })
  reportType: ReportType;

  @ApiPropertyOptional({ example: 'Normal hemoglobin levels.' })
  description?: string | null;

  @ApiProperty({ example: 'https://r2.example.com/reports/12345.pdf' })
  fileUrl: string;

  @ApiProperty({ example: 'cbc-report.pdf' })
  fileName: string;

  @ApiPropertyOptional({ example: 1048576 })
  fileSize?: number | null;

  @ApiPropertyOptional({ example: 'application/pdf' })
  mimeType?: string | null;

  @ApiProperty({ example: '2026-11-01' })
  reportDate: string;

  @ApiProperty({ type: ReportPatientDto })
  patient: ReportPatientDto;

  @ApiPropertyOptional({ type: ReportDoctorDto })
  doctor?: ReportDoctorDto | null;

  @ApiPropertyOptional({ type: ReportProviderDto })
  provider?: ReportProviderDto | null;

  @ApiPropertyOptional({ type: ReportTestDto })
  test?: ReportTestDto | null;

  @ApiPropertyOptional({ example: 'b-1234-uuid' })
  bookingId?: string | null;

  @ApiProperty({ example: '2026-11-01T10:00:00.000Z' })
  createdAt: string;
}

export class ReportListResultDto {
  @ApiProperty({ type: [ReportItemDto] })
  items: ReportItemDto[];

  @ApiProperty({
    example: { page: 1, limit: 10, total: 24, totalPages: 3 },
  })
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export class DownloadReportResultDto {
  @ApiProperty({ example: 'https://r2.example.com/reports/12345.pdf?signed=...' })
  downloadUrl: string;

  @ApiProperty({ example: 'cbc-report.pdf' })
  fileName: string;

  @ApiProperty({ example: 'application/pdf' })
  mimeType?: string | null;

  @ApiProperty({ example: 900, description: 'Expiry duration in seconds' })
  expiresInSeconds: number;
}

