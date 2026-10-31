import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { AdminBookingsService } from './admin-bookings.service';
import { GetAdminBookingsDto } from './dto/get-admin-bookings.dto';
import { UpdateAdminBookingDto } from './dto/update-admin-booking.dto';
import { UpdateAdminBookingStatusDto } from './dto/update-admin-booking-status.dto';
import {
  AdminBookingItemDto,
  AdminBookingListResultDto,
} from './dto/admin-booking-response.dto';
import { AdminJwtGuard } from '../guards/admin-jwt.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import {
  ApiErrorResponse,
  ApiSuccessResponse,
} from '../../common/decorators/api-response.decorator';

@ApiTags('Admin - Bookings')
@ApiBearerAuth()
@UseGuards(AdminJwtGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
@Controller({
  path: 'admin/bookings',
  version: '1',
})
export class AdminBookingsController {
  constructor(private readonly adminBookingsService: AdminBookingsService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'List and filter all bookings',
    description:
      'Retrieve paginated bookings with full filter support (status, paymentStatus, mode, doctorId, providerId, testId, date ranges, search) along with aggregate status counts and total revenue.',
  })
  @ApiSuccessResponse(AdminBookingListResultDto, {
    status: HttpStatus.OK,
    description: 'Bookings list retrieved successfully',
  })
  @ApiErrorResponse(HttpStatus.UNAUTHORIZED, 'Authentication token missing or invalid')
  @ApiErrorResponse(HttpStatus.FORBIDDEN, 'Insufficient permissions')
  findAll(@Query() query: GetAdminBookingsDto) {
    return this.adminBookingsService.findAll(query);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get single booking by ID or Reference',
    description:
      'Retrieve comprehensive details for a specific booking by UUID or booking reference (e.g. HP-BK-...).',
  })
  @ApiParam({
    name: 'id',
    description: 'Booking UUID or booking reference string',
    example: 'HP-BK-20261030-A1B2',
  })
  @ApiSuccessResponse(AdminBookingItemDto, {
    status: HttpStatus.OK,
    description: 'Booking details retrieved successfully',
  })
  @ApiErrorResponse(HttpStatus.NOT_FOUND, 'Booking not found')
  @ApiErrorResponse(HttpStatus.UNAUTHORIZED, 'Authentication token missing or invalid')
  @ApiErrorResponse(HttpStatus.FORBIDDEN, 'Insufficient permissions')
  findOne(@Param('id') id: string) {
    return this.adminBookingsService.findOne(id);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Update / edit a booking (PATCH)',
    description:
      'Edit any booking properties including status, paymentStatus, date, slot time, consultation mode, patient details, price, notes, or reassign doctor/provider/test.',
  })
  @ApiParam({
    name: 'id',
    description: 'Booking UUID or booking reference string',
    example: 'HP-BK-20261030-A1B2',
  })
  @ApiSuccessResponse(AdminBookingItemDto, {
    status: HttpStatus.OK,
    description: 'Booking updated successfully',
  })
  @ApiErrorResponse(HttpStatus.BAD_REQUEST, 'Validation failed or foreign entity not found')
  @ApiErrorResponse(HttpStatus.NOT_FOUND, 'Booking not found')
  @ApiErrorResponse(HttpStatus.UNAUTHORIZED, 'Authentication token missing or invalid')
  @ApiErrorResponse(HttpStatus.FORBIDDEN, 'Insufficient permissions')
  update(
    @Param('id') id: string,
    @Body() updateDto: UpdateAdminBookingDto,
  ) {
    return this.adminBookingsService.update(id, updateDto);
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Update / edit a booking (PUT)',
    description:
      'Edit any booking properties including status, paymentStatus, date, slot time, consultation mode, patient details, price, notes, or reassign doctor/provider/test.',
  })
  @ApiParam({
    name: 'id',
    description: 'Booking UUID or booking reference string',
    example: 'HP-BK-20261030-A1B2',
  })
  @ApiSuccessResponse(AdminBookingItemDto, {
    status: HttpStatus.OK,
    description: 'Booking updated successfully',
  })
  @ApiErrorResponse(HttpStatus.BAD_REQUEST, 'Validation failed or foreign entity not found')
  @ApiErrorResponse(HttpStatus.NOT_FOUND, 'Booking not found')
  @ApiErrorResponse(HttpStatus.UNAUTHORIZED, 'Authentication token missing or invalid')
  @ApiErrorResponse(HttpStatus.FORBIDDEN, 'Insufficient permissions')
  updatePut(
    @Param('id') id: string,
    @Body() updateDto: UpdateAdminBookingDto,
  ) {
    return this.adminBookingsService.update(id, updateDto);
  }

  @Patch(':id/status')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Update booking status & payment status',
    description:
      'Quick status update for booking status (PENDING, CONFIRMED, COMPLETED, CANCELLED), payment status (PENDING, PAID, FAILED, REFUNDED), and notes.',
  })
  @ApiParam({
    name: 'id',
    description: 'Booking UUID or booking reference string',
    example: 'HP-BK-20261030-A1B2',
  })
  @ApiSuccessResponse(AdminBookingItemDto, {
    status: HttpStatus.OK,
    description: 'Booking status updated successfully',
  })
  @ApiErrorResponse(HttpStatus.BAD_REQUEST, 'Validation failed')
  @ApiErrorResponse(HttpStatus.NOT_FOUND, 'Booking not found')
  @ApiErrorResponse(HttpStatus.UNAUTHORIZED, 'Authentication token missing or invalid')
  @ApiErrorResponse(HttpStatus.FORBIDDEN, 'Insufficient permissions')
  updateStatus(
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateAdminBookingStatusDto,
  ) {
    return this.adminBookingsService.updateStatus(id, updateStatusDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Delete a booking',
    description:
      'Permanently remove a booking record by UUID or booking reference.',
  })
  @ApiParam({
    name: 'id',
    description: 'Booking UUID or booking reference string',
  })
  @ApiSuccessResponse(Object, {
    status: HttpStatus.OK,
    description: 'Booking deleted successfully',
  })
  @ApiErrorResponse(HttpStatus.NOT_FOUND, 'Booking not found')
  @ApiErrorResponse(HttpStatus.UNAUTHORIZED, 'Authentication token missing or invalid')
  @ApiErrorResponse(HttpStatus.FORBIDDEN, 'Insufficient permissions')
  remove(@Param('id') id: string) {
    return this.adminBookingsService.remove(id);
  }
}
