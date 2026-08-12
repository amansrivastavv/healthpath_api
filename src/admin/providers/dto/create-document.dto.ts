import { IsEnum, IsNotEmpty, IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DocumentType, VerificationStatus } from '@prisma/client';

export class CreateDocumentDto {
  @ApiProperty({ enum: DocumentType, example: DocumentType.FACILITY_REGISTRATION })
  @IsEnum(DocumentType, { message: 'Invalid document type' })
  @IsNotEmpty({ message: 'documentType is required' })
  documentType: DocumentType;

  @ApiPropertyOptional({ example: 'https://cdn.example.com/docs/reg.pdf' })
  @IsOptional()
  @IsString()
  documentUrl?: string;

  @ApiPropertyOptional({ example: 'State medical council registration document' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ enum: VerificationStatus, example: VerificationStatus.PENDING })
  @IsOptional()
  @IsEnum(VerificationStatus)
  verificationStatus?: VerificationStatus;

  @ApiPropertyOptional({
    type: 'string',
    format: 'binary',
    description: 'Direct file upload for verification document',
  })
  @IsOptional()
  file?: any;
}
