"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TicketService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let TicketService = class TicketService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    parseVerificationToken(input) {
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
        }
        catch {
        }
        return trimmed;
    }
    async getUserTickets(userId) {
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
    async getTicketById(ticketId, userId, role) {
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
            throw new common_1.NotFoundException('Ticket not found');
        }
        if (role === 'EVENTEE' && ticket.userId !== userId) {
            throw new common_1.ForbiddenException('You do not have permission to view this ticket');
        }
        if (role === 'CREATOR' && ticket.event.creatorId !== userId) {
            throw new common_1.ForbiddenException('You do not have permission to view tickets for other creators events');
        }
        return ticket;
    }
    async verifyTicketQr(creatorId, dto) {
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
            throw new common_1.NotFoundException('Invalid ticket token. Verification failed.');
        }
        if (ticket.status !== 'PAID') {
            throw new common_1.BadRequestException('This ticket has not been paid for.');
        }
        if (ticket.event.creatorId !== creatorId) {
            throw new common_1.ForbiddenException('You are not authorized to verify tickets for this event');
        }
        if (ticket.scanned) {
            throw new common_1.BadRequestException(`Ticket has already been verified and scanned at: ${ticket.scannedAt?.toISOString()}`);
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
};
exports.TicketService = TicketService;
exports.TicketService = TicketService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TicketService);
//# sourceMappingURL=ticket.service.js.map