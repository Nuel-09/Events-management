import { Controller, Get, UseGuards } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';
import { CurrentUser } from '../auth/current-user.decorator';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Analytics')
@Controller('analytics')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class AnalyticsController {
  constructor(private analyticsService: AnalyticsService) {}

  @Get('dashboard')
  @Roles(Role.CREATOR)
  @ApiOperation({ summary: 'Retrieve lifetime statistics and per-event breakdowns (Creators only)' })
  @ApiResponse({ status: 200, description: 'Aggregated analytics data.' })
  @ApiResponse({ status: 403, description: 'Only creators can access this dashboard.' })
  async getDashboard(@CurrentUser('id') creatorId: string) {
    return this.analyticsService.getCreatorDashboard(creatorId);
  }
}
