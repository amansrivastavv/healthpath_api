import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { AdminAvailabilityService } from './admin-availability.service';
import { CreateDoctorAvailabilityDto } from './dto/create-doctor-availability.dto';
import { UpdateDoctorAvailabilityDto } from './dto/update-doctor-availability.dto';
import { AdminJwtGuard } from '../guards/admin-jwt.guard';
import {
  DoctorAvailabilityResponseDto,
  DoctorAvailabilityListResponseDto,
} from './dto/doctor-availability-response.dto';
import { EmptyResponseDto } from '../../app/auth/dto/user-response.dto';
import {
  ApiSuccessResponse,
  ApiErrorResponse,
} from '../../common/decorators/api-response.decorator';

@ApiTags('Admin - Availability')
@ApiBearerAuth()
@UseGuards(AdminJwtGuard)
@Controller({
  path: 'admin/doctors/:doctorId/availability',
  version: '1',
})
export class AdminAvailabilityController {
  constructor(private readonly availabilityService: AdminAvailabilityService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Add an availability schedule for a doctor' })
  @ApiParam({ name: 'doctorId', description: 'Doctor UUID' })
  @ApiSuccessResponse(DoctorAvailabilityResponseDto, {
    status: HttpStatus.CREATED,
    description: 'Availability schedule created successfully',
  })
  @ApiErrorResponse(HttpStatus.BAD_REQUEST, 'Validation failed')
  @ApiErrorResponse(HttpStatus.NOT_FOUND, 'Doctor not found')
  create(
    @Param('doctorId', new ParseUUIDPipe({ version: '4' })) doctorId: string,
    @Body() dto: CreateDoctorAvailabilityDto,
  ) {
    return this.availabilityService.create(doctorId, dto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all availability schedules for a doctor' })
  @ApiParam({ name: 'doctorId', description: 'Doctor UUID' })
  @ApiSuccessResponse(DoctorAvailabilityListResponseDto, {
    status: HttpStatus.OK,
    description: 'Availability schedules fetched successfully',
  })
  @ApiErrorResponse(HttpStatus.NOT_FOUND, 'Doctor not found')
  findAll(@Param('doctorId', new ParseUUIDPipe({ version: '4' })) doctorId: string) {
    return this.availabilityService.findAll(doctorId);
  }

  @Put(':availabilityId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update an availability schedule' })
  @ApiParam({ name: 'doctorId', description: 'Doctor UUID' })
  @ApiParam({ name: 'availabilityId', description: 'Availability UUID' })
  @ApiSuccessResponse(DoctorAvailabilityResponseDto, {
    status: HttpStatus.OK,
    description: 'Availability schedule updated successfully',
  })
  @ApiErrorResponse(HttpStatus.NOT_FOUND, 'Availability schedule or doctor not found')
  update(
    @Param('doctorId', new ParseUUIDPipe({ version: '4' })) doctorId: string,
    @Param('availabilityId', new ParseUUIDPipe({ version: '4' })) availabilityId: string,
    @Body() dto: UpdateDoctorAvailabilityDto,
  ) {
    return this.availabilityService.update(doctorId, availabilityId, dto);
  }

  @Delete(':availabilityId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete (soft-delete) an availability schedule' })
  @ApiParam({ name: 'doctorId', description: 'Doctor UUID' })
  @ApiParam({ name: 'availabilityId', description: 'Availability UUID' })
  @ApiSuccessResponse(EmptyResponseDto, {
    status: HttpStatus.OK,
    description: 'Availability schedule deleted successfully',
  })
  @ApiErrorResponse(HttpStatus.NOT_FOUND, 'Availability schedule or doctor not found')
  remove(
    @Param('doctorId', new ParseUUIDPipe({ version: '4' })) doctorId: string,
    @Param('availabilityId', new ParseUUIDPipe({ version: '4' })) availabilityId: string,
  ) {
    return this.availabilityService.remove(doctorId, availabilityId);
  }
}
