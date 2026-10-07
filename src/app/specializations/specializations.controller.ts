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
import { SpecializationsService } from './specializations.service';
import { GetSpecializationDoctorsDto } from './dto/get-specialization-doctors.dto';
import { Public } from '../../common/decorators/public.decorator';
import { SpecializationListResponseDto } from '../../admin/specializations/dto/specialization-response.dto';
import { DoctorListResponseDto } from '../../admin/providers/dto/doctor-response.dto';
import {
  ApiSuccessResponse,
  ApiErrorResponse,
} from '../../common/decorators/api-response.decorator';

@ApiTags('App - Specializations')
@Controller({
  path: 'specializations',
  version: '1',
})
export class SpecializationsController {
  constructor(private readonly service: SpecializationsService) {}

  @Public()
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get all active specializations (Patient view)',
    description: 'Retrieve a list of all active specializations for the mobile home screen.',
  })
  @ApiSuccessResponse(SpecializationListResponseDto, {
    status: HttpStatus.OK,
    description: 'Specializations fetched successfully',
  })
  findAll() {
    return this.service.findAll();
  }

  @Public()
  @Get(':id/doctors')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get doctors by specialization (Patient view)',
    description:
      'Retrieve a paginated list of active & verified doctors belonging to a given specialization with provider/hospital details.',
  })
  @ApiParam({
    name: 'id',
    description: 'Specialization UUID',
    example: '5a639034-bdca-476a-a626-73e7d3720aff',
  })
  @ApiSuccessResponse(DoctorListResponseDto, {
    status: HttpStatus.OK,
    description: 'Specialization doctors fetched successfully',
  })
  @ApiErrorResponse(HttpStatus.NOT_FOUND, 'Specialization not found')
  @ApiErrorResponse(HttpStatus.BAD_REQUEST, 'Invalid UUID format or validation error')
  findDoctors(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Query() dto: GetSpecializationDoctorsDto,
  ) {
    return this.service.findDoctors(id, dto);
  }
}
