import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DocumentType, VerificationStatus } from '@prisma/client';

export class DocumentDto {
  @ApiProperty({ example: 'doc123-d113-4956-a5e2-e1c7d23d8c8d' })
  id: string;

  @ApiPropertyOptional({ example: 'p1b07384-d113-4956-a5e2-e1c7d23d8c8d' })
  providerId?: string;

  @ApiPropertyOptional({ example: 'd3b07384-d113-4956-a5e2-e1c7d23d8c8d' })
  doctorId?: string;

  @ApiProperty({ enum: DocumentType, example: DocumentType.DOCTOR_REGISTRATION })
  documentType: DocumentType;

  @ApiProperty({ example: 'https://cdn.example.com/docs/reg.pdf' })
  documentUrl: string;

  @ApiPropertyOptional({ example: 'Approved by admin' })
  notes?: string;

  @ApiProperty({ example: '2026-08-12T00:00:00.000Z' })
  uploadedAt: Date;

  @ApiProperty({ enum: VerificationStatus, example: VerificationStatus.VERIFIED })
  verificationStatus: VerificationStatus;

  @ApiProperty({ example: '2026-08-12T00:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2026-08-12T00:00:00.000Z' })
  updatedAt: Date;
}

export class DocumentResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'Document uploaded successfully' })
  message: string;

  @ApiProperty({ type: DocumentDto })
  data: DocumentDto;
}

export class DocumentListResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'Documents fetched successfully' })
  message: string;

  @ApiProperty({ type: [DocumentDto] })
  data: DocumentDto[];
}
