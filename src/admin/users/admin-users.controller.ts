import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { AdminUsersService } from './admin-users.service';
import { GetUsersDto } from './dto/get-users.dto';
import { AdminJwtGuard } from '../guards/admin-jwt.guard';
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
}
