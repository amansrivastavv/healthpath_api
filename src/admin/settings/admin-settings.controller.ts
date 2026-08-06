import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Admin - Settings')
@Controller({
  path: 'admin/settings',
  version: '1',
})
export class AdminSettingsController {}
