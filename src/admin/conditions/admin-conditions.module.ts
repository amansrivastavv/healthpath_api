import { Module } from '@nestjs/common';
import { AdminConditionsService } from './admin-conditions.service';
import { AdminConditionsController } from './admin-conditions.controller';

@Module({
  controllers: [AdminConditionsController],
  providers: [AdminConditionsService],
})
export class AdminConditionsModule {}
