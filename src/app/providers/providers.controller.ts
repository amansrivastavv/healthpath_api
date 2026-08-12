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
import { ProvidersService } from './providers.service';
import { GetProvidersDto } from './dto/get-providers.dto';
import { NearbyProvidersDto } from './dto/nearby-providers.dto';
import { Public } from '../../common/decorators/public.decorator';
import {
  ApiSuccessResponse,
  ApiErrorResponse,
} from '../../common/decorators/api-response.decorator';
import {
  ProviderEntity,
  ProviderListResponseDto,
  NearbyProviderListResponseDto,
} from './entities/provider.entity';
import { DoctorListResponseDto } from '../../admin/providers/dto/doctor-response.dto';

@ApiTags('App - Providers')
@Controller({
  path: 'providers',
  version: '1',
})
export class ProvidersController {
  constructor(private readonly providersService: ProvidersService) {}

  @Public()
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get all providers',
    description:
      'Retrieve a paginated list of active providers with optional search, filtering by city/state/type/verified/homeCollection, and sorting.',
  })
  @ApiSuccessResponse(ProviderListResponseDto, {
    description: 'Providers fetched successfully',
  })
  @ApiErrorResponse(HttpStatus.BAD_REQUEST, 'Validation failed')
  findAll(@Query() dto: GetProvidersDto) {
    return this.providersService.findAll(dto);
  }

  @Public()
  @Get('nearby')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Find nearby providers',
    description:
      'Search for providers within a specified radius (km) from a given latitude/longitude using the Haversine formula. Results are sorted by distance ascending.',
  })
  @ApiSuccessResponse(NearbyProviderListResponseDto, {
    description: 'Nearby providers fetched successfully',
  })
  @ApiErrorResponse(HttpStatus.BAD_REQUEST, 'Validation failed')
  findNearby(@Query() dto: NearbyProvidersDto) {
    return this.providersService.findNearby(dto);
  }

  @Public()
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get provider details',
    description: 'Retrieve complete information for a single active provider by UUID.',
  })
  @ApiParam({ name: 'id', description: 'Provider UUID', example: 'd3b07384-d113-4956-a5e2-e1c7d23d8c8d' })
  @ApiSuccessResponse(ProviderEntity, {
    description: 'Provider fetched successfully',
  })
  @ApiErrorResponse(HttpStatus.NOT_FOUND, 'Provider not found')
  @ApiErrorResponse(HttpStatus.BAD_REQUEST, 'Invalid UUID format')
  findOne(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    return this.providersService.findOne(id);
  }

  @Public()
  @Get(':id/doctors')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get doctors belonging to a provider (Patient view)',
    description: 'Retrieve a list of active & verified doctors for a given provider.',
  })
  @ApiParam({ name: 'id', description: 'Provider UUID', example: 'd3b07384-d113-4956-a5e2-e1c7d23d8c8d' })
  @ApiSuccessResponse(DoctorListResponseDto, {
    description: 'Provider doctors fetched successfully',
  })
  @ApiErrorResponse(HttpStatus.NOT_FOUND, 'Provider not found')
  getDoctors(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    return this.providersService.findDoctorsByProviderId(id);
  }
}
