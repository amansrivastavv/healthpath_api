import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { ReportsService } from './reports.service';
import { UploadReportDto } from './dto/upload-report.dto';
import { GetReportsDto } from './dto/get-reports.dto';
import { GetProviderPatientsDto } from './dto/get-provider-patients.dto';
import {
  ReportItemDto,
  ReportListResultDto,
} from './dto/report-response.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';
import {
  ApiErrorResponse,
  ApiSuccessResponse,
} from '../../common/decorators/api-response.decorator';

@ApiTags('Provider - Medical Reports (Doctors, Hospitals, Labs)')
@ApiBearerAuth()
@UseGuards(RolesGuard)
@Roles(
  UserRole.DOCTOR,
  UserRole.LAB_OWNER,
  UserRole.LAB_STAFF,
  UserRole.TECHNICIAN,
  UserRole.ADMIN,
  UserRole.SUPER_ADMIN,
)
@Controller({
  path: 'provider/reports',
  version: '1',
})
export class ProviderReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Post('upload')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Upload medical report for a patient (Doctor, Hospital, or Lab)',
    description:
      'Uploads a medical diagnostic report, prescription, radiology scan, or discharge summary (PDF / JPEG / PNG) to Cloudflare R2 and links it with the patient. Automatically verifies that the booking or patient belongs to this provider/doctor.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['title', 'patientName', 'patientPhone', 'file'],
      properties: {
        title: {
          type: 'string',
          example: 'Complete Blood Count (CBC) Report',
        },
        reportType: {
          type: 'string',
          enum: ['LAB_REPORT', 'PRESCRIPTION', 'RADIOLOGY_SCAN', 'DISCHARGE_SUMMARY', 'OTHER'],
          example: 'LAB_REPORT',
        },
        description: {
          type: 'string',
          example: 'Hemoglobin slightly low at 11.2 g/dL.',
        },
        patientName: {
          type: 'string',
          example: 'Rahul Verma',
        },
        patientPhone: {
          type: 'string',
          example: '+919876543210',
        },
        patientAge: {
          type: 'integer',
          example: 32,
        },
        patientGender: {
          type: 'string',
          enum: ['MALE', 'FEMALE', 'OTHER'],
          example: 'MALE',
        },
        bookingId: {
          type: 'string',
          format: 'uuid',
          example: 'c1f7a0b3-96b4-4b55-83c7-31637c22998a',
        },
        testId: {
          type: 'string',
          format: 'uuid',
          example: 'b37d23fd-7279-4056-8422-d73c99f22baf',
        },
        doctorId: {
          type: 'string',
          format: 'uuid',
          example: 'd-doctor-uuid',
        },
        reportDate: {
          type: 'string',
          example: '2026-11-01',
        },
        file: {
          type: 'string',
          format: 'binary',
          description: 'Report document file (PDF, JPEG, PNG, WebP up to 25MB)',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  @ApiSuccessResponse(ReportItemDto, {
    status: HttpStatus.CREATED,
    description: 'Medical report uploaded and stored successfully',
  })
  @ApiErrorResponse(HttpStatus.BAD_REQUEST, 'Validation failed or missing file')
  @ApiErrorResponse(HttpStatus.FORBIDDEN, 'Access denied: Booking/patient belongs to another provider')
  upload(
    @CurrentUser('sub') uploaderId: string,
    @CurrentUser('role') uploaderRole: UserRole,
    @Body() dto: UploadReportDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.reportsService.uploadReport(uploaderId, uploaderRole, dto, file);
  }

  @Get('patients')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get list of patients belonging to this doctor / facility',
    description:
      'Retrieves all distinct patients who have visited, booked, or received reports from this specific doctor or healthcare facility.',
  })
  @ApiSuccessResponse(Object, {
    status: HttpStatus.OK,
    description: 'Provider patients retrieved successfully',
  })
  @ApiErrorResponse(HttpStatus.FORBIDDEN, 'Insufficient permissions')
  getPatients(
    @CurrentUser('sub') uploaderId: string,
    @CurrentUser('role') uploaderRole: UserRole,
    @Query() query: GetProviderPatientsDto,
  ) {
    return this.reportsService.getProviderPatients(uploaderId, uploaderRole, query);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'List reports uploaded by this doctor / facility',
    description:
      'Retrieve paginated reports uploaded by this doctor or healthcare facility, with filters by reportType, date range, and search.',
  })
  @ApiSuccessResponse(ReportListResultDto, {
    status: HttpStatus.OK,
    description: 'Reports list retrieved successfully',
  })
  @ApiErrorResponse(HttpStatus.FORBIDDEN, 'Insufficient permissions')
  findAll(
    @CurrentUser('sub') uploaderId: string,
    @CurrentUser('role') uploaderRole: UserRole,
    @Query() query: GetReportsDto,
  ) {
    return this.reportsService.getProviderReports(uploaderId, uploaderRole, query);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get report details by ID or Reference Number',
    description:
      'Retrieve details for a specific report. Strictly enforces that the report belongs to this provider/doctor.',
  })
  @ApiParam({
    name: 'id',
    description: 'Report UUID or report number string (e.g. HP-REP-20261101-A1B2)',
  })
  @ApiSuccessResponse(ReportItemDto, {
    status: HttpStatus.OK,
    description: 'Medical report details retrieved successfully',
  })
  @ApiErrorResponse(HttpStatus.NOT_FOUND, 'Medical report not found')
  @ApiErrorResponse(HttpStatus.FORBIDDEN, 'Access denied to this report')
  findOne(
    @Param('id') id: string,
    @CurrentUser('sub') callerId: string,
    @CurrentUser('role') callerRole: UserRole,
  ) {
    return this.reportsService.getReportById(id, callerId, callerRole);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Delete medical report',
    description:
      'Permanently deletes a report and removes the file from Cloudflare R2 storage. Only authorized provider/doctor or admin can delete.',
  })
  @ApiParam({
    name: 'id',
    description: 'Report UUID or report number string',
  })
  @ApiSuccessResponse(Object, {
    status: HttpStatus.OK,
    description: 'Medical report deleted successfully',
  })
  @ApiErrorResponse(HttpStatus.NOT_FOUND, 'Medical report not found')
  @ApiErrorResponse(HttpStatus.FORBIDDEN, 'Access denied to delete this report')
  remove(
    @Param('id') id: string,
    @CurrentUser('sub') callerId: string,
    @CurrentUser('role') callerRole: UserRole,
  ) {
    return this.reportsService.deleteReport(id, callerId, callerRole);
  }
}

