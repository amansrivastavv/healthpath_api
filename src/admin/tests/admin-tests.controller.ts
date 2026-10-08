import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { AdminTestsService } from './admin-tests.service';
import { CreateTestDto } from './dto/create-test.dto';
import { UpdateTestDto } from './dto/update-test.dto';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AdminJwtGuard } from '../guards/admin-jwt.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Admin - Tests')
@ApiBearerAuth()
@UseGuards(AdminJwtGuard, RolesGuard)
@Roles('ADMIN', 'SUPER_ADMIN')
@Controller({ path: 'admin/tests', version: '1' })
export class AdminTestsController {
  constructor(private readonly adminTestsService: AdminTestsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new test' })
  create(@Body() createTestDto: CreateTestDto) {
    return this.adminTestsService.create(createTestDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all tests' })
  findAll() {
    return this.adminTestsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get test by id' })
  findOne(@Param('id') id: string) {
    return this.adminTestsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update test' })
  update(@Param('id') id: string, @Body() updateTestDto: UpdateTestDto) {
    return this.adminTestsService.update(id, updateTestDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete test' })
  remove(@Param('id') id: string) {
    return this.adminTestsService.remove(id);
  }
}
