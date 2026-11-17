import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { MonitorsService } from './monitors.service.js';
import { CreateMonitorDto } from './dto/create-monitor.dto.js';
import { UpdateMonitorDto } from './dto/update-monitor.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';

@ApiTags('monitors')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('monitors')
export class MonitorsController {
  constructor(private readonly monitorsService: MonitorsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new monitor scoped to the authenticated user' })
  @ApiResponse({ status: 201, description: 'Monitor created successfully' })
  create(
    @CurrentUser('userId') userId: string,
    @Body() createMonitorDto: CreateMonitorDto,
  ) {
    return this.monitorsService.create(userId, createMonitorDto);
  }

  @Get()
  @ApiOperation({ summary: 'Retrieve all monitors belonging to the authenticated user' })
  @ApiResponse({ status: 200, description: 'List of user monitors' })
  findAll(@CurrentUser('userId') userId: string) {
    return this.monitorsService.findAll(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get details of a specific monitor' })
  @ApiResponse({ status: 200, description: 'Monitor details' })
  @ApiResponse({ status: 404, description: 'Monitor not found or unauthorized' })
  findOne(
    @Param('id') id: string,
    @CurrentUser('userId') userId: string,
  ) {
    return this.monitorsService.findOne(id, userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update monitor configuration' })
  @ApiResponse({ status: 200, description: 'Monitor updated successfully' })
  @ApiResponse({ status: 404, description: 'Monitor not found or unauthorized' })
  update(
    @Param('id') id: string,
    @CurrentUser('userId') userId: string,
    @Body() updateMonitorDto: UpdateMonitorDto,
  ) {
    return this.monitorsService.update(id, userId, updateMonitorDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a monitor and all its associated check logs' })
  @ApiResponse({ status: 200, description: 'Monitor deleted successfully' })
  @ApiResponse({ status: 404, description: 'Monitor not found or unauthorized' })
  remove(
    @Param('id') id: string,
    @CurrentUser('userId') userId: string,
  ) {
    return this.monitorsService.remove(id, userId);
  }

  // 🚀 Step 4.5: On-demand check trigger endpoint
  @Post(':id/check')
  @ApiOperation({ summary: 'Trigger an immediate on-demand health check for a monitor' })
  @ApiResponse({ status: 201, description: 'Health check executed and time-series result stored' })
  @ApiResponse({ status: 404, description: 'Monitor not found or unauthorized' })
  runCheck(
    @Param('id') id: string,
    @CurrentUser('userId') userId: string,
  ) {
    return this.monitorsService.runCheck(id, userId);
  }

  // 🚀 Step 4.5: Historical check latency & uptime logs
  @Get(':id/checks')
  @ApiOperation({ summary: 'Get recent health check history and latency logs for a monitor' })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of recent checks to return (default: 50)',
  })
  @ApiResponse({ status: 200, description: 'List of recent checks ordered by checkedAt DESC' })
  @ApiResponse({ status: 404, description: 'Monitor not found or unauthorized' })
  getChecks(
    @Param('id') id: string,
    @CurrentUser('userId') userId: string,
    @Query('limit') limit?: number,
  ) {
    return this.monitorsService.getMonitorChecks(id, userId, limit ? +limit : 50);
  }
}
