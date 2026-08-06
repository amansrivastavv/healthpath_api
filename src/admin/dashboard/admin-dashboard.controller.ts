import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Admin - Dashboard')
@Controller({
  path: 'admin/dashboard',
  version: '1',
})
export class AdminDashboardController {}
