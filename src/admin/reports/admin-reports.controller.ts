import {
  Controller,
  Delete,
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
import { ReportsService } from '../../app/reports/reports.service';
import { GetAdminReportsDto } from './dto/get-admin-reports.dto';
import { AdminReportListResultDto } from './dto/admin-report-response.dto';
import { ReportItemDto } from '../../app/reports/dto/report-response.dto';
import { AdminJwtGuard } from '../guards/admin-jwt.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import {
  ApiErrorResponse,
  ApiSuccessResponse,
} from '../../common/decorators/api-response.decorator';

@ApiTags('Admin - Reports')
@ApiBearerAuth()
@UseGuards(AdminJwtGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
@Controller({
  path: 'admin/reports',
  version: '1',
})
export class AdminReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'List and filter all platform medical reports',
    description:
      'Retrieve paginated reports across all doctors, hospitals, and diagnostic labs with comprehensive filters (reportType, doctorId, providerId, testId, userId, date ranges, search) and summary statistics.',
  })
  @ApiSuccessResponse(AdminReportListResultDto, {
    status: HttpStatus.OK,
    description: 'Reports retrieved successfully',
  })
  @ApiErrorResponse(HttpStatus.UNAUTHORIZED, 'Authentication token missing or invalid')
  @ApiErrorResponse(HttpStatus.FORBIDDEN, 'Insufficient permissions')
  findAll(@Query() query: GetAdminReportsDto) {
    return this.reportsService.getAdminReports(query);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get report details by ID or report number',
    description: 'Retrieve full details of any medical report across the platform.',
  })
  @ApiParam({
    name: 'id',
    description: 'Report UUID or report number string (e.g. HP-REP-20261101-A1B2)',
    example: 'HP-REP-20261101-A1B2',
  })
  @ApiSuccessResponse(ReportItemDto, {
    status: HttpStatus.OK,
    description: 'Report details retrieved successfully',
  })
  @ApiErrorResponse(HttpStatus.NOT_FOUND, 'Medical report not found')
  @ApiErrorResponse(HttpStatus.UNAUTHORIZED, 'Authentication token missing or invalid')
  @ApiErrorResponse(HttpStatus.FORBIDDEN, 'Insufficient permissions')
  findOne(@Param('id') id: string) {
    return this.reportsService.getAdminReportById(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Delete medical report',
    description:
      'Permanently delete a medical report and remove its file from Cloudflare R2 storage.',
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
  @ApiErrorResponse(HttpStatus.UNAUTHORIZED, 'Authentication token missing or invalid')
  @ApiErrorResponse(HttpStatus.FORBIDDEN, 'Insufficient permissions')
  remove(@Param('id') id: string) {
    return this.reportsService.deleteAdminReport(id);
  }
}
