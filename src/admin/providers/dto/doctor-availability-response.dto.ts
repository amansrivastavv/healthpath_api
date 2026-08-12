import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DayOfWeek } from '@prisma/client';

export class DoctorAvailabilityDto {
  @ApiProperty({ example: 'a1b07384-d113-4956-a5e2-e1c7d23d8c8d' })
  id: string;

  @ApiProperty({ example: 'd3b07384-d113-4956-a5e2-e1c7d23d8c8d' })
  doctorId: string;

  @ApiProperty({ enum: DayOfWeek, example: DayOfWeek.MONDAY })
  dayOfWeek: DayOfWeek;

  @ApiProperty({ example: '10:00' })
  startTime: string;

  @ApiProperty({ example: '17:00' })
  endTime: string;

  @ApiProperty({ example: 30 })
  slotDuration: number;

  @ApiPropertyOptional({ example: '13:00' })
  breakStart?: string;

  @ApiPropertyOptional({ example: '14:00' })
  breakEnd?: string;

  @ApiProperty({ example: true })
  isActive: boolean;

  @ApiProperty({ example: '2026-08-12T00:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2026-08-12T00:00:00.000Z' })
  updatedAt: Date;
}

export class DoctorAvailabilityResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'Availability schedule created successfully' })
  message: string;

  @ApiProperty({ type: DoctorAvailabilityDto })
  data: DoctorAvailabilityDto;
}

export class DoctorAvailabilityListResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'Availability schedules fetched successfully' })
  message: string;

  @ApiProperty({ type: [DoctorAvailabilityDto] })
  data: DoctorAvailabilityDto[];
}
