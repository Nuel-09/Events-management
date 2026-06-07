import { Injectable, Inject, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';

@Injectable()
export class EventService {
  constructor(
    private prisma: PrismaService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  private async invalidateCache() {
    try {
      await this.cacheManager.clear();
    } catch (err) {
      console.error('Failed to invalidate Redis cache', err);
    }
  }

  async create(creatorId: string, dto: CreateEventDto) {
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

  async update(eventId: string, creatorId: string, dto: UpdateEventDto) {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    if (event.creatorId !== creatorId) {
      throw new ForbiddenException('Only the creator can edit this event');
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

  async remove(eventId: string, creatorId: string) {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    if (event.creatorId !== creatorId) {
      throw new ForbiddenException('Only the creator can delete this event');
    }

    await this.prisma.event.delete({
      where: { id: eventId },
    });

    await this.invalidateCache();
    return { message: 'Event successfully removed' };
  }

  async findOne(eventId: string) {
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
      throw new NotFoundException('Event not found');
    }

    await this.cacheManager.set(cacheKey, event, 300000); // cache for 5 minutes
    return event;
  }

  async findAll(search?: string, limit = 10, cursor?: string) {
    const cacheKey = `events:list:search_${search || 'none'}:limit_${limit}:cursor_${cursor || 'none'}`;
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) {
      return cached;
    }

    const queryOptions: any = {
      take: limit + 1, // Get one extra to check if there is a next page
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
      queryOptions.skip = 1; // Skip the cursor itself
    }

    const events = await this.prisma.event.findMany(queryOptions);

    let nextCursor: string | null = null;
    if (events.length > limit) {
      const nextItem = events.pop();
      nextCursor = nextItem ? nextItem.id : null;
    }

    const result = {
      events,
      nextCursor,
    };

    await this.cacheManager.set(cacheKey, result, 60000); // Cache search result for 1 minute
    return result;
  }

  async getCreatorEvents(creatorId: string) {
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
}
