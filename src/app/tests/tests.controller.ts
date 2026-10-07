import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam } from '@nestjs/swagger';
import { TestsService } from './tests.service';
import { GetTestsDto } from './dto/get-tests.dto';
import { GetTestLabsDto } from './dto/get-test-labs.dto';
import { Public } from '../../common/decorators/public.decorator';
import {
  TestListResponseDto,
  TestResponseDto,
  TestLabListResponseDto,
} from './dto/test-response.dto';
import {
  ApiSuccessResponse,
  ApiErrorResponse,
} from '../../common/decorators/api-response.decorator';

@ApiTags('App - Tests')
@Controller({
  path: 'tests',
  version: '1',
})
export class TestsController {
  constructor(private readonly testsService: TestsService) {}

  @Public()
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get diagnostic tests catalog (Patient view)',
    description:
      'Retrieve a paginated list of active diagnostic tests with search, condition filter, sample type filter, and indicative pricing.',
  })
  @ApiSuccessResponse(TestListResponseDto, {
    status: HttpStatus.OK,
    description: 'Tests fetched successfully',
  })
  @ApiErrorResponse(HttpStatus.BAD_REQUEST, 'Validation failed')
  findAll(@Query() dto: GetTestsDto) {
    return this.testsService.findAll(dto);
  }

  @Public()
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get test details by ID (Patient view)',
    description:
      'Retrieve full diagnostic test information including preparation instructions, sample requirements, turnaround time, and related conditions.',
  })
  @ApiParam({
    name: 'id',
    description: 'Test UUID',
    example: 'd3b07384-d113-4956-a5e2-e1c7d23d8c8d',
  })
  @ApiSuccessResponse(TestResponseDto, {
    status: HttpStatus.OK,
    description: 'Test details fetched successfully',
  })
  @ApiErrorResponse(HttpStatus.NOT_FOUND, 'Test not found')
  @ApiErrorResponse(HttpStatus.BAD_REQUEST, 'Invalid UUID format')
  findOne(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    return this.testsService.findOne(id);
  }

  @Public()
  @Get(':id/labs')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get labs offering a specific test (Patient view)',
    description:
      'Discover active and verified diagnostic labs that provide this test, with lab pricing, distance from user location, home collection availability, and turnaround times.',
  })
  @ApiParam({
    name: 'id',
    description: 'Test UUID',
    example: 'd3b07384-d113-4956-a5e2-e1c7d23d8c8d',
  })
  @ApiSuccessResponse(TestLabListResponseDto, {
    status: HttpStatus.OK,
    description: 'Labs for test fetched successfully',
  })
  @ApiErrorResponse(HttpStatus.NOT_FOUND, 'Test not found')
  @ApiErrorResponse(HttpStatus.BAD_REQUEST, 'Invalid UUID format or validation error')
  findLabs(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Query() dto: GetTestLabsDto,
  ) {
    return this.testsService.findLabs(id, dto);
  }
}
