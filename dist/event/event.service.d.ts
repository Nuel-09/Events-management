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
    }>;
    update(eventId: string, creatorId: string, dto: UpdateEventDto): Promise<{
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
    }>;
    remove(eventId: string, creatorId: string): Promise<{
        message: string;
    }>;
    findOne(eventId: string): Promise<{}>;
    findAll(search?: string, limit?: number, cursor?: string): Promise<{}>;
    getCreatorEvents(creatorId: string): Promise<({
        tickets: ({
            user: {
                email: string;
                name: string;
                id: string;
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
        })[];
    } & {
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
    })[]>;
}
