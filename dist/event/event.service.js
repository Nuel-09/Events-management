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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const cache_manager_1 = require("@nestjs/cache-manager");
let EventService = class EventService {
    prisma;
    cacheManager;
    constructor(prisma, cacheManager) {
        this.prisma = prisma;
        this.cacheManager = cacheManager;
    }
    async invalidateCache() {
        try {
            await this.cacheManager.clear();
        }
        catch (err) {
            console.error('Failed to invalidate Redis cache', err);
        }
    }
    async create(creatorId, dto) {
        const event = await this.prisma.event.create({
            data: {
                title: dto.title,
                description: dto.description,
                date: new Date(dto.date),
                location: dto.location,
                price: dto.price,
                capacity: dto.capacity,
                creatorId,
                reminderInterval: dto.reminderInterval || '1_DAY',
            },
        });
        await this.invalidateCache();
        return event;
    }
    async update(eventId, creatorId, dto) {
        const event = await this.prisma.event.findUnique({
            where: { id: eventId },
        });
        if (!event) {
            throw new common_1.NotFoundException('Event not found');
        }
        if (event.creatorId !== creatorId) {
            throw new common_1.ForbiddenException('Only the creator can edit this event');
        }
        const updatedEvent = await this.prisma.event.update({
            where: { id: eventId },
            data: {
                ...dto,
                date: dto.date ? new Date(dto.date) : undefined,
            },
        });
        await this.invalidateCache();
        return updatedEvent;
    }
    async remove(eventId, creatorId) {
        const event = await this.prisma.event.findUnique({
            where: { id: eventId },
        });
        if (!event) {
            throw new common_1.NotFoundException('Event not found');
        }
        if (event.creatorId !== creatorId) {
            throw new common_1.ForbiddenException('Only the creator can delete this event');
        }
        await this.prisma.event.delete({
            where: { id: eventId },
        });
        await this.invalidateCache();
        return { message: 'Event successfully removed' };
    }
    async findOne(eventId) {
        const cacheKey = `events:item:${eventId}`;
        const cached = await this.cacheManager.get(cacheKey);
        if (cached) {
            return cached;
        }
        const event = await this.prisma.event.findUnique({
            where: { id: eventId },
            include: {
                creator: {
                    select: { id: true, name: true, email: true },
                },
            },
        });
        if (!event) {
            throw new common_1.NotFoundException('Event not found');
        }
        await this.cacheManager.set(cacheKey, event, 300000);
        return event;
    }
    async findAll(search, limit = 10, cursor) {
        const cacheKey = `events:list:search_${search || 'none'}:limit_${limit}:cursor_${cursor || 'none'}`;
        const cached = await this.cacheManager.get(cacheKey);
        if (cached) {
            return cached;
        }
        const queryOptions = {
            take: limit + 1,
            orderBy: { date: 'desc' },
            where: {},
            include: {
                creator: {
                    select: { id: true, name: true },
                },
            },
        };
        if (search) {
            queryOptions.where = {
                OR: [
                    { title: { contains: search, mode: 'insensitive' } },
                    { description: { contains: search, mode: 'insensitive' } },
                    { location: { contains: search, mode: 'insensitive' } },
                ],
            };
        }
        if (cursor) {
            queryOptions.cursor = { id: cursor };
            queryOptions.skip = 1;
        }
        const events = await this.prisma.event.findMany(queryOptions);
        let nextCursor = null;
        if (events.length > limit) {
            const nextItem = events.pop();
            nextCursor = nextItem ? nextItem.id : null;
        }
        const result = {
            events,
            nextCursor,
        };
        await this.cacheManager.set(cacheKey, result, 60000);
        return result;
    }
    async getCreatorEvents(creatorId) {
        return this.prisma.event.findMany({
            where: { creatorId },
            include: {
                tickets: {
                    include: {
                        user: {
                            select: { id: true, name: true, email: true },
                        },
                    },
                },
            },
        });
    }
};
exports.EventService = EventService;
exports.EventService = EventService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, common_1.Inject)(cache_manager_1.CACHE_MANAGER)),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService, Object])
], EventService);
//# sourceMappingURL=event.service.js.map