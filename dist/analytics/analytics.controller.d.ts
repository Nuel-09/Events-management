import { AnalyticsService } from './analytics.service';
export declare class AnalyticsController {
    private analyticsService;
    constructor(analyticsService: AnalyticsService);
    getDashboard(creatorId: string): Promise<{
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
