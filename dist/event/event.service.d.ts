import { PrismaService } from '../prisma/prisma.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import type { Cache } from 'cache-manager';
export declare class EventService {
    private prisma;
    private cacheManager;
    constructor(prisma: PrismaService, cacheManager: Cache);
    private invalidateCache;
    create(creatorId: string, dto: CreateEventDto): Promise<{
        id: string;
        title: string;
        description: string;
        date: Date;
        location: string;
        price: number;
        capacity: number;
        ticketsSold: number;
        reminderInterval: string;
        createdAt: Date;
        updatedAt: Date;
        creatorId: string;
    }>;
    update(eventId: string, creatorId: string, dto: UpdateEventDto): Promise<{
        id: string;
        title: string;
        description: string;
        date: Date;
        location: string;
        price: number;
        capacity: number;
        ticketsSold: number;
        reminderInterval: string;
        createdAt: Date;
        updatedAt: Date;
        creatorId: string;
    }>;
    remove(eventId: string, creatorId: string): Promise<{
        message: string;
    }>;
    findOne(eventId: string): Promise<{}>;
    findAll(search?: string, limit?: number, cursor?: string): Promise<{}>;
    getCreatorEvents(creatorId: string): Promise<({
        tickets: ({
            user: {
                id: string;
                name: string;
                email: string;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            eventId: string;
            userId: string;
            paymentReference: string;
            status: import("@prisma/client").$Enums.TicketStatus;
            verificationToken: string;
            qrCodeUrl: string | null;
            scanned: boolean;
            scannedAt: Date | null;
        })[];
    } & {
        id: string;
        title: string;
        description: string;
        date: Date;
        location: string;
        price: number;
        capacity: number;
        ticketsSold: number;
        reminderInterval: string;
        createdAt: Date;
        updatedAt: Date;
        creatorId: string;
    })[]>;
}
