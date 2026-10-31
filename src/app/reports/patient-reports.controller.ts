import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { GetReportsDto } from './dto/get-reports.dto';
import {
  DownloadReportResultDto,
  ReportItemDto,
  ReportListResultDto,
} from './dto/report-response.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';
import {
  ApiErrorResponse,
  ApiSuccessResponse,
} from '../../common/decorators/api-response.decorator';

@ApiTags('App - Medical Reports (Mobile Patient)')
@ApiBearerAuth()
@Controller({
  path: 'reports',
  version: '1',
})
export class PatientReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('my-reports')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get all medical reports for logged-in patient',
    description:
      'Retrieve paginated reports (Lab tests, prescriptions, radiology scans, discharge summaries) for the logged-in mobile app patient. Matched automatically via user account ID and verified phone number.',
  })
  @ApiSuccessResponse(ReportListResultDto, {
    status: HttpStatus.OK,
    description: 'Patient medical reports retrieved successfully',
  })
  findMyReports(
    @CurrentUser('sub') userId: string,
    @Query() query: GetReportsDto,
  ) {
    return this.reportsService.getPatientReports(userId, query);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get medical report details',
    description:
      'Retrieve complete details of a report by UUID or report number. Only the owner patient or treating doctor can view.',
  })
  @ApiParam({
    name: 'id',
    description: 'Report UUID or report reference number (e.g. HP-REP-20261101-A1B2)',
  })
  @ApiSuccessResponse(ReportItemDto, {
    status: HttpStatus.OK,
    description: 'Report details retrieved successfully',
  })
  @ApiErrorResponse(HttpStatus.NOT_FOUND, 'Report not found')
  @ApiErrorResponse(HttpStatus.FORBIDDEN, 'Access denied: You do not own this report')
  findOne(
    @Param('id') id: string,
    @CurrentUser('sub') userId: string,
    @CurrentUser('role') role: UserRole,
  ) {
    return this.reportsService.getReportById(id, userId, role);
  }

  @Get(':id/download')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get secure time-limited download URL for medical report',
    description:
      'Generates a secure presigned download URL (valid for 15 minutes) to download or view the report PDF or image in the mobile application.',
  })
  @ApiParam({
    name: 'id',
    description: 'Report UUID or report reference number',
  })
  @ApiSuccessResponse(DownloadReportResultDto, {
    status: HttpStatus.OK,
    description: 'Signed download URL generated successfully',
  })
  @ApiErrorResponse(HttpStatus.NOT_FOUND, 'Report not found')
  @ApiErrorResponse(HttpStatus.FORBIDDEN, 'Access denied: You do not own this report')
  download(
    @Param('id') id: string,
    @CurrentUser('sub') userId: string,
    @CurrentUser('role') role: UserRole,
  ) {
    return this.reportsService.getReportDownloadUrl(id, userId, role);
  }
}

