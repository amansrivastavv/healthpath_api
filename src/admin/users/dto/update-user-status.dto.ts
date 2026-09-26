import { IsEnum, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserStatus } from '@prisma/client';

export class UpdateUserStatusDto {
  @ApiProperty({
    enum: UserStatus,
    example: UserStatus.ACTIVE,
    description: 'Account status to set for the user',
  })
  @IsNotEmpty({ message: 'Status is required' })
  @IsEnum(UserStatus, {
    message: `Status must be one of the following: ${Object.values(UserStatus).join(', ')}`,
  })
  status: UserStatus;
}
