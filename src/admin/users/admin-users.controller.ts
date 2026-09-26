import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { AdminUsersService, CurrentAdminContext } from './admin-users.service';
import { GetUsersDto } from './dto/get-users.dto';
import { CreateAdminUserDto } from './dto/create-admin-user.dto';
import { AssignRoleDto } from './dto/assign-role.dto';
import { UpdateUserStatusDto } from './dto/update-user-status.dto';
import { UpdateAdminUserDto } from './dto/update-admin-user.dto';
import { AdminJwtGuard } from '../guards/admin-jwt.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';
import {
  AdminUserListResponseDto,
  AdminUserSingleResponseDto,
} from './entities/admin-user.entity';
import {
  ApiSuccessResponse,
  ApiErrorResponse,
} from '../../common/decorators/api-response.decorator';

@ApiTags('Admin - Users')
@ApiBearerAuth()
@UseGuards(AdminJwtGuard)
@Controller({
  path: 'admin/users',
  version: '1',
})
export class AdminUsersController {
  constructor(private readonly usersService: AdminUsersService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create user / admin account',
    description:
      'Create a new dashboard administrator or system user. Only SUPER_ADMIN can create other SUPER_ADMIN accounts.',
  })
  @ApiSuccessResponse(AdminUserSingleResponseDto, {
    status: HttpStatus.CREATED,
    description: 'User created successfully',
  })
  @ApiErrorResponse(HttpStatus.BAD_REQUEST, 'Validation failed')
  @ApiErrorResponse(HttpStatus.CONFLICT, 'Email or phone number already exists')
  @ApiErrorResponse(HttpStatus.FORBIDDEN, 'Insufficient permissions')
  create(
    @Body() dto: CreateAdminUserDto,
    @CurrentUser() currentAdmin: CurrentAdminContext,
  ) {
    return this.usersService.create(dto, currentAdmin);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get all users',
    description:
      'Retrieve a paginated list of all users with optional search, role/status filtering, and sorting.',
  })
  @ApiSuccessResponse(AdminUserListResponseDto, {
    status: HttpStatus.OK,
    description: 'Users fetched successfully',
  })
  @ApiErrorResponse(HttpStatus.BAD_REQUEST, 'Validation failed')
  @ApiErrorResponse(HttpStatus.UNAUTHORIZED, 'Unauthorized access')
  findAll(@Query() dto: GetUsersDto) {
    return this.usersService.findAll(dto);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get user details',
    description: 'Retrieve complete information for a single user by UUID.',
  })
  @ApiParam({
    name: 'id',
    description: 'User UUID',
    example: 'd3b07384-d113-4956-a5e2-e1c7d23d8c8d',
  })
  @ApiSuccessResponse(AdminUserSingleResponseDto, {
    status: HttpStatus.OK,
    description: 'User details fetched successfully',
  })
  @ApiErrorResponse(HttpStatus.NOT_FOUND, 'User not found')
  @ApiErrorResponse(HttpStatus.BAD_REQUEST, 'Invalid UUID format')
  @ApiErrorResponse(HttpStatus.UNAUTHORIZED, 'Unauthorized access')
  findOne(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id/role')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Assign user role (Super Admin only)',
    description:
      'Assign or change a user role (e.g., ADMIN, SUPER_ADMIN, LAB_OWNER, PATIENT). Strictly restricted to SUPER_ADMIN.',
  })
  @ApiParam({
    name: 'id',
    description: 'User UUID',
    example: 'd3b07384-d113-4956-a5e2-e1c7d23d8c8d',
  })
  @ApiSuccessResponse(AdminUserSingleResponseDto, {
    status: HttpStatus.OK,
    description: 'User role updated successfully',
  })
  @ApiErrorResponse(HttpStatus.NOT_FOUND, 'User not found')
  @ApiErrorResponse(HttpStatus.FORBIDDEN, 'Access denied: Requires SUPER_ADMIN role')
  @ApiErrorResponse(
    HttpStatus.BAD_REQUEST,
    'Invalid request or cannot demote self',
  )
  assignRole(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() dto: AssignRoleDto,
    @CurrentUser() currentAdmin: CurrentAdminContext,
  ) {
    return this.usersService.assignRole(id, dto, currentAdmin);
  }

  @Patch(':id/status')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Update user status',
    description:
      'Update user account status (ACTIVE, INACTIVE, SUSPENDED, PENDING_VERIFICATION).',
  })
  @ApiParam({
    name: 'id',
    description: 'User UUID',
    example: 'd3b07384-d113-4956-a5e2-e1c7d23d8c8d',
  })
  @ApiSuccessResponse(AdminUserSingleResponseDto, {
    status: HttpStatus.OK,
    description: 'User status updated successfully',
  })
  @ApiErrorResponse(HttpStatus.NOT_FOUND, 'User not found')
  @ApiErrorResponse(
    HttpStatus.BAD_REQUEST,
    'Invalid request or cannot deactivate own account',
  )
  @ApiErrorResponse(HttpStatus.FORBIDDEN, 'Insufficient permissions')
  updateStatus(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() dto: UpdateUserStatusDto,
    @CurrentUser() currentAdmin: CurrentAdminContext,
  ) {
    return this.usersService.updateStatus(id, dto, currentAdmin);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Update user profile',
    description: 'Update profile information for a user (full name, phone, etc.).',
  })
  @ApiParam({
    name: 'id',
    description: 'User UUID',
    example: 'd3b07384-d113-4956-a5e2-e1c7d23d8c8d',
  })
  @ApiSuccessResponse(AdminUserSingleResponseDto, {
    status: HttpStatus.OK,
    description: 'User profile updated successfully',
  })
  @ApiErrorResponse(HttpStatus.NOT_FOUND, 'User not found')
  @ApiErrorResponse(HttpStatus.CONFLICT, 'Phone number already in use')
  @ApiErrorResponse(HttpStatus.FORBIDDEN, 'Insufficient permissions')
  update(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() dto: UpdateAdminUserDto,
    @CurrentUser() currentAdmin: CurrentAdminContext,
  ) {
    return this.usersService.update(id, dto, currentAdmin);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Deactivate user (Super Admin only)',
    description:
      'Soft-deactivate a user account. Strictly restricted to SUPER_ADMIN.',
  })
  @ApiParam({
    name: 'id',
    description: 'User UUID',
    example: 'd3b07384-d113-4956-a5e2-e1c7d23d8c8d',
  })
  @ApiSuccessResponse(AdminUserSingleResponseDto, {
    status: HttpStatus.OK,
    description: 'User deactivated successfully',
  })
  @ApiErrorResponse(HttpStatus.NOT_FOUND, 'User not found')
  @ApiErrorResponse(HttpStatus.FORBIDDEN, 'Access denied: Requires SUPER_ADMIN role')
  @ApiErrorResponse(HttpStatus.BAD_REQUEST, 'Cannot delete own account')
  remove(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @CurrentUser() currentAdmin: CurrentAdminContext,
  ) {
    return this.usersService.remove(id, currentAdmin);
  }
}
