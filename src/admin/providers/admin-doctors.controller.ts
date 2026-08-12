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
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam, ApiConsumes } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { AdminDoctorsService } from './admin-doctors.service';
import { CreateDoctorDto } from './dto/create-doctor.dto';
import { UpdateDoctorDto } from './dto/update-doctor.dto';
import { GetDoctorsDto } from './dto/get-doctors.dto';
import { AdminJwtGuard } from '../guards/admin-jwt.guard';
import { DoctorResponseDto, DoctorListResponseDto } from './dto/doctor-response.dto';
import { EmptyResponseDto } from '../../app/auth/dto/user-response.dto';
import {
  ApiSuccessResponse,
  ApiErrorResponse,
} from '../../common/decorators/api-response.decorator';

@ApiTags('Admin - Doctors')
@ApiBearerAuth()
@UseGuards(AdminJwtGuard)
@Controller({
  path: 'admin/doctors',
  version: '1',
})
export class AdminDoctorsController {
  constructor(private readonly doctorsService: AdminDoctorsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new doctor record' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('profileImage'))
  @ApiSuccessResponse(DoctorResponseDto, {
    status: HttpStatus.CREATED,
    description: 'Doctor created successfully',
  })
  @ApiErrorResponse(HttpStatus.BAD_REQUEST, 'Validation failed')
  @ApiErrorResponse(HttpStatus.NOT_FOUND, 'Specialization or Provider not found')
  @ApiErrorResponse(HttpStatus.CONFLICT, 'Medical registration number already exists')
  create(
    @Body() dto: CreateDoctorDto,
    @UploadedFile() profileImage?: Express.Multer.File,
  ) {
    return this.doctorsService.create(dto, profileImage);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all doctors with filtering and pagination' })
  @ApiSuccessResponse(DoctorListResponseDto, {
    status: HttpStatus.OK,
    description: 'Doctors fetched successfully',
  })
  findAll(@Query() dto: GetDoctorsDto) {
    return this.doctorsService.findAll(dto);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get doctor by ID' })
  @ApiParam({ name: 'id', description: 'Doctor UUID' })
  @ApiSuccessResponse(DoctorResponseDto, {
    status: HttpStatus.OK,
    description: 'Doctor fetched successfully',
  })
  @ApiErrorResponse(HttpStatus.NOT_FOUND, 'Doctor not found')
  findOne(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    return this.doctorsService.findOne(id);
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update doctor record' })
  @ApiParam({ name: 'id', description: 'Doctor UUID' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('profileImage'))
  @ApiSuccessResponse(DoctorResponseDto, {
    status: HttpStatus.OK,
    description: 'Doctor updated successfully',
  })
  @ApiErrorResponse(HttpStatus.NOT_FOUND, 'Doctor not found')
  @ApiErrorResponse(HttpStatus.CONFLICT, 'Medical registration number already exists')
  update(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() dto: UpdateDoctorDto,
    @UploadedFile() profileImage?: Express.Multer.File,
  ) {
    return this.doctorsService.update(id, dto, profileImage);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Soft delete a doctor record' })
  @ApiParam({ name: 'id', description: 'Doctor UUID' })
  @ApiSuccessResponse(EmptyResponseDto, {
    status: HttpStatus.OK,
    description: 'Doctor deleted successfully',
  })
  @ApiErrorResponse(HttpStatus.NOT_FOUND, 'Doctor not found')
  remove(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    return this.doctorsService.remove(id);
  }
}
