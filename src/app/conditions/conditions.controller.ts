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
import { ConditionsService } from './conditions.service';
import { GetConditionsDto } from './dto/get-conditions.dto';
import { GetConditionDoctorsDto } from './dto/get-condition-doctors.dto';
import { GetConditionTestsDto } from './dto/get-condition-tests.dto';
import { Public } from '../../common/decorators/public.decorator';
import {
  ConditionListResponseDto,
  ConditionResponseDto,
} from './dto/condition-response.dto';
import { DoctorListResponseDto } from '../../admin/providers/dto/doctor-response.dto';
import {
  ApiSuccessResponse,
  ApiErrorResponse,
} from '../../common/decorators/api-response.decorator';

@ApiTags('App - Conditions')
@Controller({
  path: 'conditions',
  version: '1',
})
export class ConditionsController {
  constructor(private readonly conditionsService: ConditionsService) {}

  @Public()
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get all active conditions (Patient view)',
    description:
      'Retrieve active lifestyle and medical conditions for the mobile home screen with test and doctor counts.',
  })
  @ApiSuccessResponse(ConditionListResponseDto, {
    status: HttpStatus.OK,
    description: 'Conditions fetched successfully',
  })
  findAll(@Query() dto: GetConditionsDto) {
    return this.conditionsService.findAll(dto);
  }

  @Public()
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get condition details by ID (Patient view)',
    description: 'Retrieve details of a single active condition.',
  })
  @ApiParam({
    name: 'id',
    description: 'Condition UUID',
    example: 'd3b07384-d113-4956-a5e2-e1c7d23d8c8d',
  })
  @ApiSuccessResponse(ConditionResponseDto, {
    status: HttpStatus.OK,
    description: 'Condition details fetched successfully',
  })
  @ApiErrorResponse(HttpStatus.NOT_FOUND, 'Condition not found')
  @ApiErrorResponse(HttpStatus.BAD_REQUEST, 'Invalid UUID format')
  findOne(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    return this.conditionsService.findOne(id);
  }

  @Public()
  @Get(':id/doctors')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get doctors for a condition (Patient view)',
    description:
      'Retrieve a paginated list of active & verified doctors specialized or experienced in treating this condition.',
  })
  @ApiParam({
    name: 'id',
    description: 'Condition UUID',
    example: 'd3b07384-d113-4956-a5e2-e1c7d23d8c8d',
  })
  @ApiSuccessResponse(DoctorListResponseDto, {
    status: HttpStatus.OK,
    description: 'Condition doctors fetched successfully',
  })
  @ApiErrorResponse(HttpStatus.NOT_FOUND, 'Condition not found')
  @ApiErrorResponse(HttpStatus.BAD_REQUEST, 'Invalid UUID format')
  findDoctors(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Query() dto: GetConditionDoctorsDto,
  ) {
    return this.conditionsService.findDoctors(id, dto);
  }

  @Public()
  @Get(':id/tests')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get lab tests for a condition (Patient view)',
    description:
      'Retrieve a paginated list of diagnostic tests recommended for this condition.',
  })
  @ApiParam({
    name: 'id',
    description: 'Condition UUID',
    example: 'd3b07384-d113-4956-a5e2-e1c7d23d8c8d',
  })
  @ApiSuccessResponse(ConditionListResponseDto, {
    status: HttpStatus.OK,
    description: 'Condition tests fetched successfully',
  })
  @ApiErrorResponse(HttpStatus.NOT_FOUND, 'Condition not found')
  @ApiErrorResponse(HttpStatus.BAD_REQUEST, 'Invalid UUID format')
  findTests(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Query() dto: GetConditionTestsDto,
  ) {
    return this.conditionsService.findTests(id, dto);
  }
}
