import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { ReportsService } from './reports.service';
import { ProviderReportsController } from './provider-reports.controller';
import { PatientReportsController } from './patient-reports.controller';
import { R2Module } from '../../r2/r2.module';
import { RolesGuard } from '../../common/guards/roles.guard';

@Module({
  imports: [AuthModule, R2Module],
  controllers: [ProviderReportsController, PatientReportsController],
  providers: [ReportsService, RolesGuard],
  exports: [ReportsService],
})
export class AppReportsModule {}
