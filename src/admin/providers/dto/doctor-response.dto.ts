import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Gender, ConsultationType, VerificationStatus } from '@prisma/client';

export class DoctorDto {
  @ApiProperty({ example: 'd3b07384-d113-4956-a5e2-e1c7d23d8c8d' })
  id: string;

  @ApiProperty({ example: 'Dr. Sarah Connor' })
  fullName: string;

  @ApiPropertyOptional({ example: 'https://cdn.example.com/profiles/doctor.jpg' })
  profileImage?: string;

  @ApiProperty({ example: 'c1b07384-d113-4956-a5e2-e1c7d23d8c8d' })
  specializationId: string;

  @ApiProperty({ example: 'MBBS, MD (Cardiology)' })
  qualification: string;

  @ApiProperty({ example: 10 })
  experienceYears: number;

  @ApiProperty({ example: 'MCI-123456' })
  medicalRegistrationNumber: string;

  @ApiProperty({ enum: Gender, example: Gender.FEMALE })
  gender: Gender;

  @ApiProperty({ example: ['English', 'Hindi'] })
  languages: string[];

  @ApiPropertyOptional({ example: 'Experienced cardiologist' })
  about?: string;

  @ApiProperty({ example: 800 })
  consultationFee: number;

  @ApiPropertyOptional({ example: 600 })
  onlineConsultationFee?: number;

  @ApiPropertyOptional({ example: 800 })
  inPersonConsultationFee?: number;

  @ApiPropertyOptional({ example: 1500 })
  homeVisitFee?: number;

  @ApiProperty({ enum: ConsultationType, isArray: true, example: [ConsultationType.IN_PERSON] })
  consultationTypes: ConsultationType[];

  @ApiProperty({ example: 'p1b07384-d113-4956-a5e2-e1c7d23d8c8d' })
  providerId: string;

  @ApiProperty({ example: true })
  isActive: boolean;

  @ApiProperty({ enum: VerificationStatus, example: VerificationStatus.VERIFIED })
  verificationStatus: VerificationStatus;

  @ApiProperty({ example: '2026-08-12T00:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2026-08-12T00:00:00.000Z' })
  updatedAt: Date;
}

export class DoctorResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'Doctor fetched successfully' })
  message: string;

  @ApiProperty({ type: DoctorDto })
  data: DoctorDto;
}

export class DoctorPaginationDto {
  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 10 })
  limit: number;

  @ApiProperty({ example: 1 })
  total: number;

  @ApiProperty({ example: 1 })
  totalPages: number;
}

export class DoctorListDataDto {
  @ApiProperty({ type: [DoctorDto] })
  items: DoctorDto[];

  @ApiProperty({ type: DoctorPaginationDto })
  pagination: DoctorPaginationDto;
}

export class DoctorListResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'Doctors fetched successfully' })
  message: string;

  @ApiProperty({ type: DoctorListDataDto })
  data: DoctorListDataDto;
}
