import { Controller, Get } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('Health')
@Controller()
export class HealthController {
  @Public()
  @Get('health')
  @ApiResponse({ status: 200 })
  getHealth() {
    return {
      success: true,
      status: 'ok',
    };
  }

  @Public()
  @Get('api/health')
  @ApiResponse({ status: 200 })
  getApiHealth() {
    return {
      success: true,
      status: 'ok',
    };
  }
}
