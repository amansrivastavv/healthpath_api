import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Admin - Notifications')
@Controller({
  path: 'admin/notifications',
  version: '1',
})
export class AdminNotificationsController {}
