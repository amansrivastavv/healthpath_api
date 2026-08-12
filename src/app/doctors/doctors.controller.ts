import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam } from '@nestjs/swagger';
import { DoctorsService } from './doctors.service';
import { GetAppDoctorsDto } from './dto/get-app-doctors.dto';
import { Public } from '../../common/decorators/public.decorator';
import { DoctorResponseDto, DoctorListResponseDto } from '../../admin/providers/dto/doctor-response.dto';
import {
  ApiSuccessResponse,
  ApiErrorResponse,
} from '../../common/decorators/api-response.decorator';

@ApiTags('App - Doctors')
@Controller({
  path: 'doctors',
  version: '1',
})
export class DoctorsController {
  constructor(private readonly doctorsService: DoctorsService) {}

  @Public()
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get all active & verified doctors (Patient view)',
    description: 'Retrieve a paginated list of doctors with filtering by city, specialization, provider type, search, and sorting.',
  })
  @ApiSuccessResponse(DoctorListResponseDto, {
    status: HttpStatus.OK,
    description: 'Doctors fetched successfully',
  })
  @ApiErrorResponse(HttpStatus.BAD_REQUEST, 'Validation failed')
  findAll(@Query() dto: GetAppDoctorsDto) {
    return this.doctorsService.findAll(dto);
  }

  @Public()
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get doctor details by ID (Patient view)',
    description: 'Retrieve detailed information of a verified doctor including specialization, provider, and availabilities.',
  })
  @ApiParam({ name: 'id', description: 'Doctor UUID' })
  @ApiSuccessResponse(DoctorResponseDto, {
    status: HttpStatus.OK,
    description: 'Doctor fetched successfully',
  })
  @ApiErrorResponse(HttpStatus.NOT_FOUND, 'Doctor not found')
  findOne(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    return this.doctorsService.findOne(id);
  }
}
