import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Admin - Users')
@Controller({
  path: 'admin/users',
  version: '1',
})
export class AdminUsersController {}
