import { IsOptional, IsString, IsInt, Min, IsIn, IsUUID, IsBoolean } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class GetTestsDto {
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

  @ApiPropertyOptional({ description: 'Search test by name, code, or description' })
  @IsOptional()
  @IsString()
  @Transform(({ value }: { value: unknown }): unknown =>
    typeof value === 'string' ? value.trim() : value,
  )
  search?: string;

  @ApiPropertyOptional({ description: 'Filter by Condition UUID' })
  @IsOptional()
  @IsUUID('4')
  conditionId?: string;

  @ApiPropertyOptional({ description: 'Filter by sample type (e.g. Blood, Urine)' })
  @IsOptional()
  @IsString()
  sampleType?: string;

  @ApiPropertyOptional({ description: 'Filter featured tests only' })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isFeatured?: boolean;

  @ApiPropertyOptional({
    default: 'name',
    enum: ['name', 'price', 'isFeatured', 'createdAt'],
  })
  @IsOptional()
  @IsString()
  @IsIn(['name', 'price', 'isFeatured', 'createdAt'])
  sortBy?: string = 'name';

  @ApiPropertyOptional({ default: 'asc', enum: ['asc', 'desc'] })
  @IsOptional()
  @IsString()
  @IsIn(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc' = 'asc';
}
