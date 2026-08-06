import {
  IsString,
  IsNotEmpty,
  IsEmail,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsObject,
  IsIn,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';

export class CreateProviderDto {
  @ApiProperty({ example: 'HealthPath Diagnostics' })
  @IsString()
  @IsNotEmpty({ message: 'Name is required' })
  @Transform(({ value }: { value: unknown }): unknown =>
    typeof value === 'string' ? value.trim() : value,
  )
  name: string;

  @ApiProperty({ example: 'healthpath-diagnostics' })
  @IsString()
  @IsNotEmpty({ message: 'Slug is required' })
  slug: string;

  @ApiProperty({ example: 'LAB', enum: ['LAB', 'CLINIC', 'BOTH'] })
  @IsIn(['LAB', 'CLINIC', 'BOTH'], { message: 'Type must be LAB, CLINIC, or BOTH' })
  @IsNotEmpty({ message: 'Type is required' })
  type: string;

  @ApiPropertyOptional({ example: 'A leading diagnostic lab.' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: 'contact@healthpath.com' })
  @IsEmail({}, { message: 'Invalid email address' })
  @IsOptional()
  @Transform(({ value }: { value: unknown }): unknown =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  email?: string;

  @ApiPropertyOptional({ example: '+91-9876543210' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({ example: '123, MG Road' })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiPropertyOptional({ example: 'Gurugram' })
  @IsString()
  @IsOptional()
  city?: string;

  @ApiPropertyOptional({ example: 'Haryana' })
  @IsString()
  @IsOptional()
  state?: string;

  @ApiPropertyOptional({ example: 'India' })
  @IsString()
  @IsOptional()
  country?: string;

  @ApiPropertyOptional({ example: '122001' })
  @IsString()
  @IsOptional()
  pincode?: string;

  @ApiPropertyOptional({ example: 28.4595 })
  @IsNumber({}, { message: 'Latitude must be a number' })
  @Min(-90)
  @Max(90)
  @IsOptional()
  @Type(() => Number)
  latitude?: number;

  @ApiPropertyOptional({ example: 77.0266 })
  @IsNumber({}, { message: 'Longitude must be a number' })
  @Min(-180)
  @Max(180)
  @IsOptional()
  @Type(() => Number)
  longitude?: number;

  @ApiPropertyOptional({
    example: '{"monday": {"open": "08:00", "close": "20:00"}}',
    type: 'string',
  })
  @IsOptional()
  @Transform(({ value }: { value: unknown }) => {
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    }
    return value;
  })
  @IsObject({ message: 'openingHours must be a valid JSON object' })
  openingHours?: any;

  @ApiPropertyOptional({ example: true, type: 'boolean' })
  @IsOptional()
  @Transform(({ value }: { value: unknown }) => value === 'true' || value === true)
  @IsBoolean()
  homeCollectionAvailable?: boolean;

  @ApiPropertyOptional({
    type: 'string',
    format: 'binary',
    description: 'Direct file upload for profile image',
  })
  @IsOptional()
  profileImage?: any;

  @ApiPropertyOptional({ example: true, type: 'boolean' })
  @IsOptional()
  @Transform(({ value }: { value: unknown }) => value === 'true' || value === true)
  @IsBoolean()
  isVerified?: boolean;

  @ApiPropertyOptional({ example: true, type: 'boolean' })
  @IsOptional()
  @Transform(({ value }: { value: unknown }) => value === 'true' || value === true)
  @IsBoolean()
  isActive?: boolean;
}
