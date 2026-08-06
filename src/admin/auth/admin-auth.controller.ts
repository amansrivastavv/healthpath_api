import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Admin - Authentication')
@Controller({
  path: 'admin/auth',
  version: '1',
})
export class AdminAuthController {}
