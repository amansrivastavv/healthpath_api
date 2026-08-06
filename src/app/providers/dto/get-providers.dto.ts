import {
  IsOptional,
  IsString,
  IsInt,
  Min,
  Max,
  IsIn,
  IsEnum,
  IsBooleanString,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';

export enum ProviderSortBy {
  NAME = 'name',
  RATING = 'rating',
  CREATED_AT = 'createdAt',
}

export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

export class GetProvidersDto {
  @ApiPropertyOptional({ description: 'Page number', example: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Page must be an integer' })
  @Min(1, { message: 'Page must be at least 1' })
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Items per page', example: 10, minimum: 1, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Limit must be an integer' })
  @Min(1, { message: 'Limit must be at least 1' })
  @Max(100, { message: 'Limit cannot exceed 100' })
  limit?: number = 10;

  @ApiPropertyOptional({ description: 'Search by provider name', example: 'HealthPath' })
  @IsOptional()
  @IsString()
  @Transform(({ value }: { value: unknown }): unknown =>
    typeof value === 'string' ? value.trim() : value,
  )
  search?: string;

  @ApiPropertyOptional({ description: 'Filter by city', example: 'Gurugram' })
  @IsOptional()
  @IsString()
  @Transform(({ value }: { value: unknown }): unknown =>
    typeof value === 'string' ? value.trim() : value,
  )
  city?: string;

  @ApiPropertyOptional({ description: 'Filter by provider type', enum: ['LAB', 'CLINIC', 'BOTH'] })
  @IsOptional()
  @IsIn(['LAB', 'CLINIC', 'BOTH'], { message: 'Type must be LAB, CLINIC, or BOTH' })
  type?: string;

  @ApiPropertyOptional({ description: 'Filter by verification status', example: 'true' })
  @IsOptional()
  @IsBooleanString({ message: 'Verified must be true or false' })
  verified?: string;

  @ApiPropertyOptional({ description: 'Filter by home collection availability', example: 'true' })
  @IsOptional()
  @IsBooleanString({ message: 'homeCollection must be true or false' })
  homeCollection?: string;

  @ApiPropertyOptional({ description: 'Sort by field', enum: ProviderSortBy, default: ProviderSortBy.CREATED_AT })
  @IsOptional()
  @IsEnum(ProviderSortBy, { message: 'sortBy must be name, rating, or createdAt' })
  sortBy?: ProviderSortBy = ProviderSortBy.CREATED_AT;

  @ApiPropertyOptional({ description: 'Sort order', enum: SortOrder, default: SortOrder.DESC })
  @IsOptional()
  @IsEnum(SortOrder, { message: 'sortOrder must be asc or desc' })
  sortOrder?: SortOrder = SortOrder.DESC;
}
