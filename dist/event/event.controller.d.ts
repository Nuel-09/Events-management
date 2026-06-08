import { EventService } from './event.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import type { Response } from 'express';
export declare class EventController {
    private eventService;
    constructor(eventService: EventService);
    create(createEventDto: CreateEventDto, creatorId: string): Promise<{
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
    update(eventId: string, updateEventDto: UpdateEventDto, creatorId: string): Promise<{
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
    findAll(search?: string, limit?: number, cursor?: string): Promise<{}>;
    shareEvent(eventId: string, res: Response): Promise<Response<any, Record<string, any>>>;
    findOne(eventId: string): Promise<{}>;
}
