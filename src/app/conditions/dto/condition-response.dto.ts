import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ConditionDto {
  @ApiProperty({ example: 'd3b07384-d113-4956-a5e2-e1c7d23d8c8d' })
  id: string;

  @ApiProperty({ example: 'Diabetes' })
  name: string;

  @ApiProperty({ example: 'diabetes' })
  slug: string;

  @ApiPropertyOptional({ example: 'https://cdn.example.com/icons/diabetes.png' })
  icon?: string;

  @ApiPropertyOptional({ example: 'Blood sugar regulation and diabetes care' })
  description?: string;

  @ApiProperty({ example: true })
  isActive: boolean;

  @ApiPropertyOptional({ example: 5 })
  doctorsCount?: number;

  @ApiPropertyOptional({ example: 4 })
  testsCount?: number;

  @ApiProperty({ example: '2026-10-06T00:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2026-10-06T00:00:00.000Z' })
  updatedAt: Date;
}

export class ConditionPaginationDto {
  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 20 })
  limit: number;

  @ApiProperty({ example: 8 })
  total: number;

  @ApiProperty({ example: 1 })
  totalPages: number;
}

export class ConditionListDataDto {
  @ApiProperty({ type: [ConditionDto] })
  items: ConditionDto[];

  @ApiProperty({ type: ConditionPaginationDto })
  pagination: ConditionPaginationDto;
}

export class ConditionListResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'Conditions fetched successfully' })
  message: string;

  @ApiProperty({ type: ConditionListDataDto })
  data: ConditionListDataDto;
}

export class ConditionResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'Condition details fetched successfully' })
  message: string;

  @ApiProperty({ type: ConditionDto })
  data: ConditionDto;
}
