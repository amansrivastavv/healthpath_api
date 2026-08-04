import { ApiProperty } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty({ example: 'd3b07384-d113-4956-a5e2-e1c7d23d8c8d' })
  id: string;

  @ApiProperty({ example: 'Aman Sharma' })
  fullName: string;

  @ApiProperty({ example: 'aman@healthpath.com' })
  email: string;

  @ApiProperty({ example: null, nullable: true })
  profileImage: string | null;

  @ApiProperty({ example: null, nullable: true })
  phoneNumber: string | null;

  @ApiProperty({ example: '2026-08-04T12:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2026-08-04T12:00:00.000Z' })
  updatedAt: Date;
}
