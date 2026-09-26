import { IsEnum, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';

export class AssignRoleDto {
  @ApiProperty({
    enum: UserRole,
    example: UserRole.ADMIN,
    description: 'Role to assign to the user (e.g., ADMIN, SUPER_ADMIN, LAB_OWNER, PATIENT)',
  })
  @IsNotEmpty({ message: 'Role is required' })
  @IsEnum(UserRole, {
    message: `Role must be one of the following: ${Object.values(UserRole).join(', ')}`,
  })
  role: UserRole;
}
