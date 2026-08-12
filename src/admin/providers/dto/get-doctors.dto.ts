import { IsOptional, IsString, IsInt, Min, IsIn, IsUUID, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { VerificationStatus, ProviderType } from '@prisma/client';

export class GetDoctorsDto {
  @ApiPropertyOptional({ default: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 10, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;

  @ApiPropertyOptional({ description: 'Search term for name, qualification, or registration number' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Filter by Provider UUID' })
  @IsOptional()
  @IsUUID('4')
  providerId?: string;

  @ApiPropertyOptional({ description: 'Filter by Specialization UUID' })
  @IsOptional()
  @IsUUID('4')
  specializationId?: string;

  @ApiPropertyOptional({ enum: ProviderType, description: 'Filter by associated provider type' })
  @IsOptional()
  @IsEnum(ProviderType)
  providerType?: ProviderType;

  @ApiPropertyOptional({ description: 'Filter by city' })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({ description: 'Filter by state' })
  @IsOptional()
  @IsString()
  state?: string;

  @ApiPropertyOptional({ description: 'Filter by active status ("true" or "false")' })
  @IsOptional()
  @IsString()
  isActive?: string;

  @ApiPropertyOptional({ enum: VerificationStatus, description: 'Filter by verification status' })
  @IsOptional()
  @IsEnum(VerificationStatus)
  verificationStatus?: VerificationStatus;

  @ApiPropertyOptional({ default: 'createdAt', enum: ['fullName', 'experienceYears', 'createdAt'] })
  @IsOptional()
  @IsString()
  @IsIn(['fullName', 'experienceYears', 'createdAt'])
  sortBy?: string = 'createdAt';

  @ApiPropertyOptional({ default: 'desc', enum: ['asc', 'desc'] })
  @IsOptional()
  @IsString()
  @IsIn(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc' = 'desc';
}
