import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { SpecializationsService } from './specializations.service';
import { Public } from '../../common/decorators/public.decorator';
import { SpecializationListResponseDto } from '../../admin/specializations/dto/specialization-response.dto';
import { ApiSuccessResponse } from '../../common/decorators/api-response.decorator';

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
  @ApiOperation({ summary: 'Get all active specializations (Patient view)' })
  @ApiSuccessResponse(SpecializationListResponseDto, {
    status: HttpStatus.OK,
    description: 'Specializations fetched successfully',
  })
  findAll() {
    return this.service.findAll();
  }
}
