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
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { AdminSpecializationsService } from './admin-specializations.service';
import { CreateSpecializationDto } from './dto/create-specialization.dto';
import { UpdateSpecializationDto } from './dto/update-specialization.dto';
import { GetSpecializationsDto } from './dto/get-specializations.dto';
import { AdminJwtGuard } from '../guards/admin-jwt.guard';
import {
  SpecializationResponseDto,
  SpecializationListResponseDto,
} from './dto/specialization-response.dto';
import { EmptyResponseDto } from '../../app/auth/dto/user-response.dto';
import {
  ApiSuccessResponse,
  ApiErrorResponse,
} from '../../common/decorators/api-response.decorator';

@ApiTags('Admin - Specializations')
@ApiBearerAuth()
@UseGuards(AdminJwtGuard)
@Controller({
  path: 'admin/specializations',
  version: '1',
})
export class AdminSpecializationsController {
  constructor(private readonly service: AdminSpecializationsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new medical specialization' })
  @ApiSuccessResponse(SpecializationResponseDto, {
    status: HttpStatus.CREATED,
    description: 'Specialization created successfully',
  })
  @ApiErrorResponse(HttpStatus.BAD_REQUEST, 'Validation failed')
  @ApiErrorResponse(HttpStatus.CONFLICT, 'Specialization name or slug already exists')
  create(@Body() dto: CreateSpecializationDto) {
    return this.service.create(dto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all specializations (Admin view)' })
  @ApiSuccessResponse(SpecializationListResponseDto, {
    status: HttpStatus.OK,
    description: 'Specializations fetched successfully',
  })
  findAll(@Query() dto: GetSpecializationsDto) {
    return this.service.findAll(dto);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get specialization by ID' })
  @ApiParam({ name: 'id', description: 'Specialization UUID' })
  @ApiSuccessResponse(SpecializationResponseDto, {
    status: HttpStatus.OK,
    description: 'Specialization fetched successfully',
  })
  @ApiErrorResponse(HttpStatus.NOT_FOUND, 'Specialization not found')
  findOne(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    return this.service.findOne(id);
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update a specialization' })
  @ApiParam({ name: 'id', description: 'Specialization UUID' })
  @ApiSuccessResponse(SpecializationResponseDto, {
    status: HttpStatus.OK,
    description: 'Specialization updated successfully',
  })
  @ApiErrorResponse(HttpStatus.NOT_FOUND, 'Specialization not found')
  @ApiErrorResponse(HttpStatus.CONFLICT, 'Specialization name or slug already exists')
  update(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() dto: UpdateSpecializationDto,
  ) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Soft delete a specialization' })
  @ApiParam({ name: 'id', description: 'Specialization UUID' })
  @ApiSuccessResponse(EmptyResponseDto, {
    status: HttpStatus.OK,
    description: 'Specialization deleted successfully',
  })
  @ApiErrorResponse(HttpStatus.NOT_FOUND, 'Specialization not found')
  remove(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    return this.service.remove(id);
  }
}
