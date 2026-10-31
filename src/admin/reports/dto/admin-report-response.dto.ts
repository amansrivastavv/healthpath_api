import { ApiProperty } from '@nestjs/swagger';
import { ReportItemDto } from '../../../app/reports/dto/report-response.dto';

export class AdminReportSummaryDto {
  @ApiProperty({ example: 120 })
  totalReports: number;

  @ApiProperty({ example: 75 })
  labReports: number;

  @ApiProperty({ example: 30 })
  prescriptions: number;

  @ApiProperty({ example: 15 })
  scans: number;
}

export class AdminReportListResultDto {
  @ApiProperty({ type: [ReportItemDto] })
  items: ReportItemDto[];

  @ApiProperty({
    example: { page: 1, limit: 10, total: 120, totalPages: 12 },
  })
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };

  @ApiProperty({ type: AdminReportSummaryDto })
  summary: AdminReportSummaryDto;
}

