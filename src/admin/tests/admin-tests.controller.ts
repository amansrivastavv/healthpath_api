import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Admin - Tests')
@Controller({
  path: 'admin/tests',
  version: '1',
})
export class AdminTestsController {}
