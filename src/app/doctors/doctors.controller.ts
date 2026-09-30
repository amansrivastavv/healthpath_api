import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Query,
  Patch,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { DoctorsService } from './doctors.service';
import { GetAppDoctorsDto } from './dto/get-app-doctors.dto';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { DoctorResponseDto, DoctorListResponseDto } from '../../admin/providers/dto/doctor-response.dto';
import { UpdateDoctorProfileDto } from './dto/update-doctor-profile.dto';
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

  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles(UserRole.DOCTOR)
  @Get('me')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get current doctor profile',
    description: 'Retrieve the profile of the currently logged-in doctor.',
  })
  @ApiSuccessResponse(DoctorResponseDto)
  getMe(@CurrentUser('sub') userId: string) {
    return this.doctorsService.getMe(userId);
  }

  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles(UserRole.DOCTOR)
  @Patch('me')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Update current doctor profile',
    description: 'Allow doctor to update permitted profile fields.',
  })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('profileImage'))
  @ApiSuccessResponse(DoctorResponseDto)
  updateMe(
    @CurrentUser('sub') userId: string,
    @Body() dto: UpdateDoctorProfileDto,
    @UploadedFile() profileImage?: Express.Multer.File,
  ) {
    return this.doctorsService.updateMe(userId, dto, profileImage);
  }

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
