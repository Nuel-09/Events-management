import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { VerifyTicketDto } from './dto/verify-ticket.dto';

@Injectable()
export class TicketService {
  constructor(private prisma: PrismaService) {}

  /** Extract verification token from raw UUID or deep-link URL */
  parseVerificationToken(input: string): string {
    const trimmed = input.trim();
    try {
      const url = new URL(trimmed);
      const ticketParam = url.searchParams.get('ticket');
      if (ticketParam) {
        return ticketParam;
      }
      const pathParts = url.pathname.split('/').filter(Boolean);
      const last = pathParts[pathParts.length - 1];
      if (last && last !== 'tickets') {
        return last;
      }
    } catch {
      // not a URL — use as raw token
    }
    return trimmed;
  }

  async getUserTickets(userId: string) {
    return this.prisma.ticket.findMany({
      where: {
        userId,
        status: 'PAID',
      },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            date: true,
            location: true,
            price: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getTicketById(ticketId: string, userId: string, role: string) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id: ticketId },
      include: {
        event: true,
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    if (role === 'EVENTEE' && ticket.userId !== userId) {
      throw new ForbiddenException('You do not have permission to view this ticket');
    }

    if (role === 'CREATOR' && ticket.event.creatorId !== userId) {
      throw new ForbiddenException('You do not have permission to view tickets for other creators events');
    }

    return ticket;
  }

  async verifyTicketQr(creatorId: string, dto: VerifyTicketDto) {
    const rawInput = this.parseVerificationToken(dto.token);

    let ticket = await this.prisma.ticket.findUnique({
      where: { verificationToken: rawInput },
      include: {
        event: true,
        user: { select: { id: true, name: true, email: true } },
      },
    });

    if (!ticket) {
      ticket = await this.prisma.ticket.findUnique({
        where: { id: rawInput },
        include: {
          event: true,
          user: { select: { id: true, name: true, email: true } },
        },
      });
    }

    if (!ticket) {
      throw new NotFoundException('Invalid ticket token. Verification failed.');
    }

    if (ticket.status !== 'PAID') {
      throw new BadRequestException('This ticket has not been paid for.');
    }

    if (ticket.event.creatorId !== creatorId) {
      throw new ForbiddenException('You are not authorized to verify tickets for this event');
    }

    if (ticket.scanned) {
      throw new BadRequestException(
        `Ticket has already been verified and scanned at: ${ticket.scannedAt?.toISOString()}`,
      );
    }

    const updatedTicket = await this.prisma.ticket.update({
      where: { id: ticket.id },
      data: {
        scanned: true,
        scannedAt: new Date(),
      },
      include: {
        user: {
          select: { name: true, email: true },
        },
      },
    });

    return {
      message: 'Ticket verified successfully! Access GRANTED.',
      attendee: updatedTicket.user.name,
      email: updatedTicket.user.email,
      eventTitle: ticket.event.title,
      scannedAt: updatedTicket.scannedAt,
    };
  }
}
