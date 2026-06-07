import { Controller, Get, Param, Post, Body, UseGuards } from '@nestjs/common';
import { TicketService } from './ticket.service';
import { VerifyTicketDto } from './dto/verify-ticket.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';
import { CurrentUser } from '../auth/current-user.decorator';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Tickets')
@Controller('tickets')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TicketController {
  constructor(private ticketService: TicketService) {}

  @Get()
  @UseGuards(RolesGuard)
  @Roles(Role.EVENTEE)
  @ApiOperation({ summary: 'Get list of paid tickets booked by the logged-in eventee' })
  @ApiResponse({ status: 200, description: 'User ticket history.' })
  async getMyTickets(@CurrentUser('id') userId: string) {
    return this.ticketService.getUserTickets(userId);
  }

  @Post('verify-qr')
  @UseGuards(RolesGuard)
  @Roles(Role.CREATOR)
  @ApiOperation({ summary: 'Verify eventee ticket QR verification token (Creators only)' })
  @ApiResponse({ status: 200, description: 'Ticket validated successfully, access granted.' })
  @ApiResponse({ status: 400, description: 'Invalid token, already scanned, or unpaid ticket.' })
  @ApiResponse({ status: 403, description: 'Creator does not own the event.' })
  async verifyTicket(@Body() dto: VerifyTicketDto, @CurrentUser('id') creatorId: string) {
    return this.ticketService.verifyTicketQr(creatorId, dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get details of a single ticket (includes QR Code image data URL)' })
  @ApiResponse({ status: 200, description: 'Ticket details.' })
  @ApiResponse({ status: 403, description: 'Forbidden access to ticket.' })
  @ApiResponse({ status: 404, description: 'Ticket not found.' })
  async getTicket(
    @Param('id') ticketId: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') role: string,
  ) {
    return this.ticketService.getTicketById(ticketId, userId, role);
  }
}
