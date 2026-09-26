import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AdminProfileDto {
  @ApiProperty({ example: 'd3b07384-d113-4956-a5e2-e1c7d23d8c8d' })
  id: string;

  @ApiProperty({ example: 'Super Admin' })
  fullName: string;

  @ApiProperty({ example: 'admin@healthpath.com' })
  email: string;

  @ApiProperty({ example: 'ADMIN', enum: ['ADMIN', 'SUPER_ADMIN'] })
  role: string;

  @ApiPropertyOptional({ example: 'ACTIVE', enum: ['ACTIVE', 'INACTIVE', 'SUSPENDED', 'PENDING_VERIFICATION'] })
  status?: string;
}

export class AdminLoginResponseDto {
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  accessToken: string;

  @ApiProperty({ type: AdminProfileDto })
  user: AdminProfileDto;
}
