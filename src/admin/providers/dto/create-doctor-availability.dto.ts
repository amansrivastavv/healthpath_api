import { IsEnum, IsNotEmpty, IsString, IsOptional, IsInt, Min, Matches, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { DayOfWeek } from '@prisma/client';

export class CreateDoctorAvailabilityDto {
  @ApiProperty({ enum: DayOfWeek, example: DayOfWeek.MONDAY })
  @IsEnum(DayOfWeek, { message: 'dayOfWeek must be a valid DayOfWeek enum' })
  @IsNotEmpty({ message: 'dayOfWeek is required' })
  dayOfWeek: DayOfWeek;

  @ApiProperty({ example: '10:00', description: '24-hour format HH:mm' })
  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, { message: 'startTime must be in HH:mm format' })
  @IsNotEmpty({ message: 'startTime is required' })
  startTime: string;

  @ApiProperty({ example: '17:00', description: '24-hour format HH:mm' })
  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, { message: 'endTime must be in HH:mm format' })
  @IsNotEmpty({ message: 'endTime is required' })
  endTime: string;

  @ApiPropertyOptional({ example: 30, default: 30, description: 'Duration of each consultation slot in minutes' })
  @IsOptional()
  @IsInt()
  @Min(5, { message: 'slotDuration must be at least 5 minutes' })
  @Type(() => Number)
  slotDuration?: number = 30;

  @ApiPropertyOptional({ example: '13:00', description: 'Optional break start in HH:mm' })
  @IsOptional()
  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, { message: 'breakStart must be in HH:mm format' })
  breakStart?: string;

  @ApiPropertyOptional({ example: '14:00', description: 'Optional break end in HH:mm' })
  @IsOptional()
  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, { message: 'breakEnd must be in HH:mm format' })
  breakEnd?: string;

  @ApiPropertyOptional({ example: true, type: 'boolean' })
  @IsOptional()
  @Transform(({ value }: { value: unknown }) => value === 'true' || value === true)
  @IsBoolean()
  isActive?: boolean;
}
