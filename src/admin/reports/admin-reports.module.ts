import { Module } from '@nestjs/common';
import { AdminReportsController } from './admin-reports.controller';

@Module({
  controllers: [AdminReportsController],
})
export class AdminReportsModule {}
