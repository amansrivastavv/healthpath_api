import { Module } from '@nestjs/common';
import { AdminAuthModule } from '../auth/admin-auth.module';
import { AdminReportsController } from './admin-reports.controller';
import { AppReportsModule } from '../../app/reports/app-reports.module';
import { RolesGuard } from '../../common/guards/roles.guard';

@Module({
  imports: [AdminAuthModule, AppReportsModule],
  controllers: [AdminReportsController],
  providers: [RolesGuard],
})
export class AdminReportsModule {}
