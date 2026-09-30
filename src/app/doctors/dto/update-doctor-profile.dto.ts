import { IsOptional, IsString, IsNumber, IsArray, IsEnum, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { ConsultationType } from '@prisma/client';
import { Transform, Type } from 'class-transformer';

export class UpdateDoctorProfileDto {
  @ApiPropertyOptional({ example: 'Dr. Sarah Connor' })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  fullName?: string;

  @ApiPropertyOptional({ example: 'Experienced cardiologist.' })
  @IsOptional()
  @IsString()
  about?: string;

  @ApiPropertyOptional({ example: 800 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  consultationFee?: number;

  @ApiPropertyOptional({ example: 600 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  onlineConsultationFee?: number;

  @ApiPropertyOptional({ example: 800 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  inPersonConsultationFee?: number;

  @ApiPropertyOptional({ example: 1500 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  homeVisitFee?: number;

  @ApiPropertyOptional({
    enum: ConsultationType,
    isArray: true,
  })
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.split(',').map((v) => v.trim()).filter(Boolean);
    }
    return value;
  })
  @IsArray()
  @IsEnum(ConsultationType, { each: true })
  consultationTypes?: ConsultationType[];

  @ApiPropertyOptional({ example: ['English', 'Hindi'] })
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.split(',').map((v) => v.trim()).filter(Boolean);
    }
    return value;
  })
  @IsArray()
  @IsString({ each: true })
  languages?: string[];

  @ApiPropertyOptional({
    type: 'string',
    format: 'binary',
    description: 'Direct file upload for profile image',
  })
  @IsOptional()
  profileImage?: any;
}
