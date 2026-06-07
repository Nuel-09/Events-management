import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async getCreatorDashboard(creatorId: string) {
    // 1. Fetch all events created by this creator, along with tickets info
    const events = await this.prisma.event.findMany({
      where: { creatorId },
      include: {
        tickets: {
          where: { status: 'PAID' },
          select: {
            id: true,
            scanned: true,
          },
        },
      },
    });

    // 2. Compute overall/lifetime statistics
    const totalEventsCreated = events.length;
    let totalTicketsSold = 0;
    let totalScannedAttendees = 0;

    const eventBreakdown = events.map((event) => {
      const ticketsSold = event.tickets.length; // Paid tickets count
      const ticketsScanned = event.tickets.filter((t) => t.scanned).length;
      
      totalTicketsSold += ticketsSold;
      totalScannedAttendees += ticketsScanned;

      const attendanceRate = ticketsSold > 0 
        ? `${((ticketsScanned / ticketsSold) * 100).toFixed(1)}%` 
        : '0.0%';

      return {
        eventId: event.id,
        title: event.title,
        date: event.date,
        capacity: event.capacity,
        price: event.price,
        ticketsSold,
        ticketsScanned,
        attendanceRate,
      };
    });

    const overallAttendanceRate = totalTicketsSold > 0 
      ? `${((totalScannedAttendees / totalTicketsSold) * 100).toFixed(1)}%` 
      : '0.0%';

    return {
      lifetimeStats: {
        totalEventsCreated,
        totalTicketsSold,
        totalScannedAttendees,
        overallAttendanceRate,
      },
      eventBreakdown,
    };
  }
}
