import { TicketService } from './ticket.service';
import { VerifyTicketDto } from './dto/verify-ticket.dto';
export declare class TicketController {
    private ticketService;
    constructor(ticketService: TicketService);
    getMyTickets(userId: string): Promise<({
        event: {
            title: string;
            id: string;
            date: Date;
            location: string;
            price: number;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        eventId: string;
        paymentReference: string;
        status: import("@prisma/client").$Enums.TicketStatus;
        verificationToken: string;
        qrCodeUrl: string | null;
        scanned: boolean;
        scannedAt: Date | null;
        userId: string;
    })[]>;
    verifyTicket(dto: VerifyTicketDto, creatorId: string): Promise<{
        message: string;
        attendee: string;
        email: string;
        eventTitle: string;
        scannedAt: Date | null;
    }>;
    getTicket(ticketId: string, userId: string, role: string): Promise<{
        user: {
            email: string;
            name: string;
            id: string;
        };
        event: {
            description: string;
            title: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            date: Date;
            location: string;
            price: number;
            capacity: number;
            reminderInterval: string;
            ticketsSold: number;
            creatorId: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        eventId: string;
        paymentReference: string;
        status: import("@prisma/client").$Enums.TicketStatus;
        verificationToken: string;
        qrCodeUrl: string | null;
        scanned: boolean;
        scannedAt: Date | null;
        userId: string;
    }>;
}
