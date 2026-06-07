import { PrismaService } from '../prisma/prisma.service';
export declare class AnalyticsService {
    private prisma;
    constructor(prisma: PrismaService);
    getCreatorDashboard(creatorId: string): Promise<{
        lifetimeStats: {
            totalEventsCreated: number;
            totalTicketsSold: number;
            totalScannedAttendees: number;
            overallAttendanceRate: string;
        };
        eventBreakdown: {
            eventId: string;
            title: string;
            date: Date;
            capacity: number;
            price: number;
            ticketsSold: number;
            ticketsScanned: number;
            attendanceRate: string;
        }[];
    }>;
}
