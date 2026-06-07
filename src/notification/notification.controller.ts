import { Controller, Post, Param, Body, UseGuards } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { CustomReminderDto } from './dto/custom-reminder.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';
import { CurrentUser } from '../auth/current-user.decorator';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Notifications')
@Controller('events')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class NotificationController {
  constructor(private notificationService: NotificationService) {}

  @Post(':id/reminders')
  @UseGuards(RolesGuard)
  @Roles(Role.EVENTEE)
  @ApiOperation({ summary: 'Schedule a custom event reminder (Eventees only, requires paid ticket)' })
  @ApiResponse({ status: 201, description: 'Custom reminder successfully scheduled.' })
  @ApiResponse({ status: 400, description: 'Invalid trigger time or trigger time is not before event date.' })
  @ApiResponse({ status: 403, description: 'Eventee has not bought a ticket for this event.' })
  async scheduleCustomReminder(
    @Param('id') eventId: string,
    @Body() dto: CustomReminderDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.notificationService.scheduleCustomReminder(userId, eventId, dto.triggerTime);
  }
}
