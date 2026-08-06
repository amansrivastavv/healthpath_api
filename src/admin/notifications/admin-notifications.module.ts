import { Module } from '@nestjs/common';
import { AdminNotificationsController } from './admin-notifications.controller';

@Module({
  controllers: [AdminNotificationsController],
})
export class AdminNotificationsModule {}
