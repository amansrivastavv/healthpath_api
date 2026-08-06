import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ProviderEntity {
  @ApiProperty({ example: 'd3b07384-d113-4956-a5e2-e1c7d23d8c8d' })
  id: string;

  @ApiProperty({ example: 'HealthPath Diagnostics' })
  name: string;

  @ApiProperty({ example: 'healthpath-diagnostics' })
  slug: string;

  @ApiProperty({ example: 'LAB', enum: ['LAB', 'CLINIC', 'BOTH'] })
  type: string;

  @ApiPropertyOptional({ example: 'A leading diagnostic lab offering 500+ tests with home collection.' })
  description: string | null;

  @ApiPropertyOptional({ example: 'contact@healthpath.com' })
  email: string | null;

  @ApiPropertyOptional({ example: '+91-9876543210' })
  phone: string | null;

  @ApiPropertyOptional({ example: '123, MG Road, Sector 14' })
  address: string | null;

  @ApiPropertyOptional({ example: 'Gurugram' })
  city: string | null;

  @ApiPropertyOptional({ example: 'Haryana' })
  state: string | null;

  @ApiPropertyOptional({ example: 'India' })
  country: string | null;

  @ApiPropertyOptional({ example: '122001' })
  pincode: string | null;

  @ApiPropertyOptional({ example: 28.4595 })
  latitude: number | null;

  @ApiPropertyOptional({ example: 77.0266 })
  longitude: number | null;

  @ApiProperty({ example: 4.5 })
  rating: number | null;

  @ApiProperty({ example: 120 })
  totalRatings: number;

  @ApiPropertyOptional({
    example: {
      monday: { open: '08:00', close: '20:00' },
      tuesday: { open: '08:00', close: '20:00' },
      sunday: null,
    },
  })
  openingHours: any;

  @ApiProperty({ example: true })
  homeCollectionAvailable: boolean;

  @ApiPropertyOptional({ example: 'https://cdn.healthpath.com/profiles/lab-1.jpg' })
  profileImage: string | null;

  @ApiPropertyOptional({ example: 'https://cdn.healthpath.com/covers/lab-1.jpg' })
  coverImage: string | null;

  @ApiProperty({ example: true })
  isVerified: boolean;

  @ApiProperty({ example: true })
  isActive: boolean;

  @ApiProperty({ example: false })
  isFeatured: boolean;

  @ApiProperty({ example: '2026-08-06T12:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2026-08-06T12:00:00.000Z' })
  updatedAt: Date;
}

export class PaginationMeta {
  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 10 })
  limit: number;

  @ApiProperty({ example: 25 })
  total: number;

  @ApiProperty({ example: 3 })
  totalPages: number;
}

export class ProviderListResponseDto {
  @ApiProperty({ type: [ProviderEntity] })
  items: ProviderEntity[];

  @ApiProperty({ type: PaginationMeta })
  pagination: PaginationMeta;
}

export class NearbyProviderEntity extends ProviderEntity {
  @ApiProperty({ example: 2.45, description: 'Distance in kilometers from the search point' })
  distance: number;
}

export class NearbyProviderListResponseDto {
  @ApiProperty({ type: [NearbyProviderEntity] })
  items: NearbyProviderEntity[];

  @ApiProperty({ type: PaginationMeta })
  pagination: PaginationMeta;
}
