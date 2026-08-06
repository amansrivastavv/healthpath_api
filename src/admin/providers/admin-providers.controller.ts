import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Admin - Providers')
@Controller({
  path: 'admin/providers',
  version: '1',
})
export class AdminProvidersController {}
