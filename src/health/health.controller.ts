import { Controller, Get } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('Health')
@Controller()
export class HealthController {
  @Public()
  @Get()
  @ApiResponse({ status: 200, description: 'API status and endpoints' })
  getRoot() {
    return {
      name: 'HealthPath Backend API',
      status: 'online',
      docs: {
        patient: '/api/docs',
        admin: '/admin/docs',
      },
      health: '/health',
    };
  }

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
