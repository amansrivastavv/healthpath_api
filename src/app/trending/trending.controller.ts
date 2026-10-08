import { Controller, Get, Query, ParseIntPipe, DefaultValuePipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { TrendingService } from './trending.service';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('App - Trending')
@Controller({ path: '', version: '1' })
export class TrendingController {
  constructor(private readonly trendingService: TrendingService) {}

  @Public()
  @Get('trending-doctors')
  @ApiOperation({ summary: 'Get trending doctors' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  getDoctors(@Query('limit', new DefaultValuePipe(5), ParseIntPipe) limit: number) {
    return this.trendingService.getTrendingDoctors(limit);
  }

  @Public()
  @Get('trending-conditions')
  @ApiOperation({ summary: 'Get trending conditions' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  getConditions(@Query('limit', new DefaultValuePipe(5), ParseIntPipe) limit: number) {
    return this.trendingService.getTrendingConditions(limit);
  }

  @Public()
  @Get('trending-tests')
  @ApiOperation({ summary: 'Get trending diagnostic tests' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  getTests(@Query('limit', new DefaultValuePipe(5), ParseIntPipe) limit: number) {
    return this.trendingService.getTrendingTests(limit);
  }
}
