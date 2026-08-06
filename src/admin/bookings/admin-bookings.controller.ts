import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Admin - Bookings')
@Controller({
  path: 'admin/bookings',
  version: '1',
})
export class AdminBookingsController {}
