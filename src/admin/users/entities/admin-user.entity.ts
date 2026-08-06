import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole, UserStatus } from '@prisma/client';
import { PaginationMeta } from '../../../app/providers/entities/provider.entity';

export class AdminUserEntity {
  @ApiProperty({ example: 'd3b07384-d113-4956-a5e2-e1c7d23d8c8d' })
  id: string;

  @ApiProperty({ example: 'Aman Sharma' })
  fullName: string;

  @ApiProperty({ example: 'aman@healthpath.com' })
  email: string;

  @ApiPropertyOptional({ example: '+91-9876543210' })
  phoneNumber: string | null;

  @ApiPropertyOptional({ example: '+91' })
  countryCode: string | null;

  @ApiPropertyOptional({ example: 'https://cdn.healthpath.com/profile.jpg' })
  profileImage: string | null;

  @ApiProperty({ enum: UserRole, example: 'PATIENT' })
  role: UserRole;

  @ApiProperty({ enum: UserStatus, example: 'ACTIVE' })
  status: UserStatus;

  @ApiProperty({ example: true })
  emailVerified: boolean;

  @ApiProperty({ example: false })
  phoneVerified: boolean;

  @ApiPropertyOptional({ example: '2026-08-06T12:00:00.000Z' })
  lastLoginAt: Date | null;

  @ApiProperty({ example: '2026-08-04T12:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2026-08-04T12:00:00.000Z' })
  updatedAt: Date;
}

export class AdminUserListResponseDto {
  @ApiProperty({ type: [AdminUserEntity] })
  items: AdminUserEntity[];

  @ApiProperty({ type: PaginationMeta })
  pagination: PaginationMeta;
}

export class AdminUserSingleResponseDto {
  @ApiProperty({ type: AdminUserEntity })
  data: AdminUserEntity;
}
