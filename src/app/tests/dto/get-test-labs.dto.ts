import {
  IsOptional,
  IsString,
  IsNumber,
  IsInt,
  Min,
  Max,
  IsIn,
  IsBooleanString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class GetTestLabsDto {
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

  @ApiPropertyOptional({ description: 'User latitude for distance calculation', example: 28.4595 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude?: number;

  @ApiPropertyOptional({ description: 'User longitude for distance calculation', example: 77.0266 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude?: number;

  @ApiPropertyOptional({ description: 'Search radius in kilometers', example: 10, minimum: 1, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  radius?: number = 10;

  @ApiPropertyOptional({ description: 'Filter by city', example: 'Gurugram' })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({ description: 'Filter by home collection availability', example: 'true' })
  @IsOptional()
  @IsBooleanString()
  homeCollection?: string;

  @ApiPropertyOptional({
    default: 'price',
    enum: ['price', 'rating', 'distance'],
  })
  @IsOptional()
  @IsString()
  @IsIn(['price', 'rating', 'distance'])
  sortBy?: 'price' | 'rating' | 'distance' = 'price';

  @ApiPropertyOptional({ default: 'asc', enum: ['asc', 'desc'] })
  @IsOptional()
  @IsString()
  @IsIn(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc' = 'asc';
}
