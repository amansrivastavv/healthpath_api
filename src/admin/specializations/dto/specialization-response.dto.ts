import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SpecializationDto {
  @ApiProperty({ example: 'd3b07384-d113-4956-a5e2-e1c7d23d8c8d' })
  id: string;

  @ApiProperty({ example: 'Cardiologist' })
  name: string;

  @ApiProperty({ example: 'cardiologist' })
  slug: string;

  @ApiPropertyOptional({ example: 'https://cdn.example.com/icons/cardio.png' })
  icon?: string;

  @ApiPropertyOptional({ example: 'Heart and cardiovascular system specialists' })
  description?: string;

  @ApiProperty({ example: true })
  isActive: boolean;

  @ApiProperty({ example: '2026-08-12T00:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2026-08-12T00:00:00.000Z' })
  updatedAt: Date;
}

export class SpecializationResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'Specialization details' })
  message: string;

  @ApiProperty({ type: SpecializationDto })
  data: SpecializationDto;
}

export class SpecializationPaginationDto {
  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 10 })
  limit: number;

  @ApiProperty({ example: 1 })
  total: number;

  @ApiProperty({ example: 1 })
  totalPages: number;
}

export class SpecializationListDataDto {
  @ApiProperty({ type: [SpecializationDto] })
  items: SpecializationDto[];

  @ApiProperty({ type: SpecializationPaginationDto })
  pagination: SpecializationPaginationDto;
}

export class SpecializationListResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'Specializations fetched successfully' })
  message: string;

  @ApiProperty({ type: SpecializationListDataDto })
  data: SpecializationListDataDto;
}
