import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class TestConditionBriefDto {
  @ApiProperty({ example: 'd3b07384-d113-4956-a5e2-e1c7d23d8c8d' })
  id: string;

  @ApiProperty({ example: 'Diabetes' })
  name: string;

  @ApiProperty({ example: 'diabetes' })
  slug: string;

  @ApiPropertyOptional({ example: 'https://cdn.example.com/icons/diabetes.png' })
  icon?: string;
}

export class TestDto {
  @ApiProperty({ example: 'd3b07384-d113-4956-a5e2-e1c7d23d8c8d' })
  id: string;

  @ApiProperty({ example: 'Complete Blood Count (CBC)' })
  name: string;

  @ApiProperty({ example: 'cbc' })
  slug: string;

  @ApiPropertyOptional({ example: 'CBC' })
  code?: string;

  @ApiPropertyOptional({ example: 'Evaluates overall health and detects wide range of disorders.' })
  shortDescription?: string;

  @ApiPropertyOptional({ example: 'Detailed description of CBC test parameters.' })
  description?: string;

  @ApiPropertyOptional({ example: 'No fasting required.' })
  preparation?: string;

  @ApiPropertyOptional({ example: 'Blood (EDTA)' })
  sampleType?: string;

  @ApiPropertyOptional({ example: '12-24 Hours' })
  tat?: string;

  @ApiProperty({ example: 350 })
  price: number;

  @ApiPropertyOptional({ example: 299 })
  discountPrice?: number;

  @ApiProperty({ example: true })
  isActive: boolean;

  @ApiProperty({ example: true })
  isFeatured: boolean;

  @ApiProperty({ type: [TestConditionBriefDto] })
  conditions: TestConditionBriefDto[];

  @ApiPropertyOptional({ example: 3 })
  availableLabsCount?: number;

  @ApiProperty({ example: '2026-10-06T00:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2026-10-06T00:00:00.000Z' })
  updatedAt: Date;
}

export class TestPaginationDto {
  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 10 })
  limit: number;

  @ApiProperty({ example: 7 })
  total: number;

  @ApiProperty({ example: 1 })
  totalPages: number;
}

export class TestListDataDto {
  @ApiProperty({ type: [TestDto] })
  items: TestDto[];

  @ApiProperty({ type: TestPaginationDto })
  pagination: TestPaginationDto;
}

export class TestListResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'Tests fetched successfully' })
  message: string;

  @ApiProperty({ type: TestListDataDto })
  data: TestListDataDto;
}

export class TestResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'Test details fetched successfully' })
  message: string;

  @ApiProperty({ type: TestDto })
  data: TestDto;
}

export class TestLabDto {
  @ApiProperty({ example: 'd3b07384-d113-4956-a5e2-e1c7d23d8c8d' })
  id: string;

  @ApiProperty({ example: 'HealthPath PathLabs & Diagnostics' })
  name: string;

  @ApiProperty({ example: 'healthpath-pathlabs-gurugram' })
  slug: string;

  @ApiProperty({ example: 'LAB' })
  type: string;

  @ApiPropertyOptional({ example: 'https://images.unsplash.com/photo-1582719478250.jpg' })
  profileImage?: string;

  @ApiPropertyOptional({ example: 'https://images.unsplash.com/photo-1579684385.jpg' })
  coverImage?: string;

  @ApiPropertyOptional({ example: 'Plot 45, Sector 44' })
  address?: string;

  @ApiPropertyOptional({ example: 'Gurugram' })
  city?: string;

  @ApiPropertyOptional({ example: 'Haryana' })
  state?: string;

  @ApiPropertyOptional({ example: '122003' })
  pincode?: string;

  @ApiPropertyOptional({ example: 28.4595 })
  latitude?: number;

  @ApiPropertyOptional({ example: 77.0266 })
  longitude?: number;

  @ApiPropertyOptional({ example: 2.45 })
  distance?: number;

  @ApiProperty({ example: 4.8 })
  rating: number;

  @ApiProperty({ example: 142 })
  totalRatings: number;

  @ApiProperty({ example: 350 })
  testPrice: number;

  @ApiPropertyOptional({ example: 299 })
  discountPrice?: number;

  @ApiProperty({ example: true })
  homeCollectionAvailable: boolean;

  @ApiProperty({ example: true })
  labVisitAvailable: boolean;

  @ApiPropertyOptional({ example: '12-24 Hours' })
  turnaroundTime?: string;

  @ApiPropertyOptional({
    example: { monday: { open: '07:00', close: '21:00' } },
  })
  openingHours?: any;

  @ApiProperty({ example: true })
  isVerified: boolean;
}

export class TestLabListDataDto {
  @ApiProperty({ type: [TestLabDto] })
  items: TestLabDto[];

  @ApiProperty({ type: TestPaginationDto })
  pagination: TestPaginationDto;
}

export class TestLabListResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'Labs for test fetched successfully' })
  message: string;

  @ApiProperty({ type: TestLabListDataDto })
  data: TestLabListDataDto;
}
