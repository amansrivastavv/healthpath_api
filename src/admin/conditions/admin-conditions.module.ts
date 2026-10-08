import { Module } from '@nestjs/common';
import { AdminConditionsService } from './admin-conditions.service';
import { AdminConditionsController } from './admin-conditions.controller';
import { AdminAuthModule } from '../auth/admin-auth.module';

@Module({
  imports: [AdminAuthModule],
  controllers: [AdminConditionsController],
  providers: [AdminConditionsService],
})
export class AdminConditionsModule {}
