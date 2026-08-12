import { IsOptional, IsString, IsInt, Min, IsIn, IsUUID, IsEnum } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { ProviderType } from '@prisma/client';

export class GetAppDoctorsDto {
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

  @ApiPropertyOptional({ description: 'Search by doctor name or qualification' })
  @IsOptional()
  @IsString()
  @Transform(({ value }: { value: unknown }): unknown =>
    typeof value === 'string' ? value.trim() : value,
  )
  search?: string;

  @ApiPropertyOptional({ description: 'Filter by city' })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({ description: 'Filter by Specialization UUID' })
  @IsOptional()
  @IsUUID('4')
  specializationId?: string;

  @ApiPropertyOptional({ enum: ProviderType, description: 'Filter by provider type (CLINIC, HOSPITAL, INDIVIDUAL_DOCTOR)' })
  @IsOptional()
  @IsEnum(ProviderType)
  providerType?: ProviderType;

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
