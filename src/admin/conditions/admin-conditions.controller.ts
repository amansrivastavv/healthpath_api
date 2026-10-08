import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { AdminConditionsService } from './admin-conditions.service';
import { CreateConditionDto } from './dto/create-condition.dto';
import { UpdateConditionDto } from './dto/update-condition.dto';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Admin - Conditions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'SUPER_ADMIN')
@Controller({ path: 'admin/conditions', version: '1' })
export class AdminConditionsController {
  constructor(private readonly adminConditionsService: AdminConditionsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new condition' })
  create(@Body() createConditionDto: CreateConditionDto) {
    return this.adminConditionsService.create(createConditionDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all conditions' })
  findAll() {
    return this.adminConditionsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get condition by id' })
  findOne(@Param('id') id: string) {
    return this.adminConditionsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update condition' })
  update(@Param('id') id: string, @Body() updateConditionDto: UpdateConditionDto) {
    return this.adminConditionsService.update(id, updateConditionDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete condition' })
  remove(@Param('id') id: string) {
    return this.adminConditionsService.remove(id);
  }
}
