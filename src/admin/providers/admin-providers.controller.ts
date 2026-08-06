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
import { AdminProvidersService } from './admin-providers.service';
import { CreateProviderDto } from './dto/create-provider.dto';
import { UpdateProviderDto } from './dto/update-provider.dto';
import { GetProvidersDto } from '../../app/providers/dto/get-providers.dto';
import { AdminJwtGuard } from '../guards/admin-jwt.guard';
import {
  AdminProviderResponseDto,
  AdminProviderListResponseDto,
} from './dto/admin-provider-response.dto';
import { EmptyResponseDto } from '../../app/auth/dto/user-response.dto';
import {
  ApiSuccessResponse,
  ApiErrorResponse,
} from '../../common/decorators/api-response.decorator';

@ApiTags('Admin - Providers')
@ApiBearerAuth()
@UseGuards(AdminJwtGuard)
@Controller({
  path: 'admin/providers',
  version: '1',
})
export class AdminProvidersController {
  constructor(private readonly providersService: AdminProvidersService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new provider' })
  @ApiSuccessResponse(AdminProviderResponseDto, {
    status: HttpStatus.CREATED,
    description: 'Provider created successfully',
  })
  @ApiErrorResponse(HttpStatus.BAD_REQUEST, 'Validation failed')
  @ApiErrorResponse(HttpStatus.CONFLICT, 'Slug already exists')
  create(@Body() dto: CreateProviderDto) {
    return this.providersService.create(dto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all providers (Admin view)' })
  @ApiSuccessResponse(AdminProviderListResponseDto, {
    status: HttpStatus.OK,
    description: 'Providers fetched successfully',
  })
  findAll(@Query() dto: GetProvidersDto) {
    return this.providersService.findAll(dto);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get provider details' })
  @ApiParam({ name: 'id', description: 'Provider UUID' })
  @ApiSuccessResponse(AdminProviderResponseDto, {
    status: HttpStatus.OK,
    description: 'Provider fetched successfully',
  })
  @ApiErrorResponse(HttpStatus.NOT_FOUND, 'Provider not found')
  findOne(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    return this.providersService.findOne(id);
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update provider' })
  @ApiParam({ name: 'id', description: 'Provider UUID' })
  @ApiSuccessResponse(AdminProviderResponseDto, {
    status: HttpStatus.OK,
    description: 'Provider updated successfully',
  })
  @ApiErrorResponse(HttpStatus.NOT_FOUND, 'Provider not found')
  update(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() dto: UpdateProviderDto,
  ) {
    return this.providersService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Soft delete a provider' })
  @ApiParam({ name: 'id', description: 'Provider UUID' })
  @ApiSuccessResponse(EmptyResponseDto, {
    status: HttpStatus.OK,
    description: 'Provider deleted successfully',
  })
  @ApiErrorResponse(HttpStatus.NOT_FOUND, 'Provider not found')
  remove(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    return this.providersService.remove(id);
  }
}
