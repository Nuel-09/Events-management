import { Test, TestingModule } from '@nestjs/testing';
import { EventService } from './event.service';
import { PrismaService } from '../prisma/prisma.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { NotFoundException, ForbiddenException } from '@nestjs/common';

const mockPrismaService = {
  event: {
    create: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    findMany: jest.fn(),
  },
};

const mockCacheManager = {
  get: jest.fn(),
  set: jest.fn(),
  del: jest.fn(),
  clear: jest.fn(),
};

describe('EventService', () => {
  let service: EventService;
  let prisma: PrismaService;
  let cache: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: CACHE_MANAGER, useValue: mockCacheManager },
      ],
    }).compile();

    service = module.get<EventService>(EventService);
    prisma = module.get<PrismaService>(PrismaService);
    cache = module.get(CACHE_MANAGER);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new event and invalidate cache', async () => {
      const creatorId = 'creator-uuid';
      const createDto = {
        title: 'Summer festival',
        description: 'Music concert',
        date: '2026-07-20T12:00:00.000Z',
        location: 'Stadium',
        price: 20.0,
        capacity: 100,
      };

      const mockEvent = {
        id: 'event-uuid',
        ...createDto,
        date: new Date(createDto.date),
        creatorId,
        ticketsSold: 0,
        reminderInterval: '1_DAY',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.event.create.mockResolvedValue(mockEvent);
      mockCacheManager.clear.mockResolvedValue(undefined);

      const result = await service.create(creatorId, createDto);

      expect(prisma.event.create).toHaveBeenCalled();
      expect(cache.clear).toHaveBeenCalled();
      expect(result.title).toBe(createDto.title);
    });
  });

  describe('update', () => {
    it('should throw ForbiddenException if user is not the creator', async () => {
      const eventId = 'event-uuid';
      const otherCreatorId = 'other-creator-uuid';
      const updateDto = { title: 'Updated Title' };

      const existingEvent = {
        id: eventId,
        title: 'Old Title',
        creatorId: 'original-creator-uuid',
      };

      mockPrismaService.event.findUnique.mockResolvedValue(existingEvent);

      await expect(service.update(eventId, otherCreatorId, updateDto)).rejects.toThrow(ForbiddenException);
      expect(prisma.event.update).not.toHaveBeenCalled();
    });

    it('should successfully update event and clear cache if creator matches', async () => {
      const eventId = 'event-uuid';
      const creatorId = 'creator-uuid';
      const updateDto = { title: 'Updated Title' };

      const existingEvent = {
        id: eventId,
        title: 'Old Title',
        creatorId,
      };

      const updatedEvent = { ...existingEvent, ...updateDto };

      mockPrismaService.event.findUnique.mockResolvedValue(existingEvent);
      mockPrismaService.event.update.mockResolvedValue(updatedEvent);
      mockCacheManager.clear.mockResolvedValue(undefined);

      const result = await service.update(eventId, creatorId, updateDto);

      expect(prisma.event.update).toHaveBeenCalled();
      expect(result.title).toBe('Updated Title');
    });
  });

  describe('findOne', () => {
    it('should return cached event if it exists in Redis', async () => {
      const eventId = 'event-uuid';
      const cachedEvent = { id: eventId, title: 'Cached Event' };
      mockCacheManager.get.mockResolvedValue(cachedEvent);

      const result = await service.findOne(eventId);

      expect(cache.get).toHaveBeenCalledWith(`events:item:${eventId}`);
      expect(prisma.event.findUnique).not.toHaveBeenCalled();
      expect(result).toEqual(cachedEvent);
    });

    it('should fetch from database and cache it if not in Redis', async () => {
      const eventId = 'event-uuid';
      const dbEvent = { id: eventId, title: 'DB Event', creator: { id: '1', name: 'Creator' } };
      
      mockCacheManager.get.mockResolvedValue(null);
      mockPrismaService.event.findUnique.mockResolvedValue(dbEvent);

      const result = await service.findOne(eventId);

      expect(cache.get).toHaveBeenCalledWith(`events:item:${eventId}`);
      expect(prisma.event.findUnique).toHaveBeenCalled();
      expect(cache.set).toHaveBeenCalledWith(`events:item:${eventId}`, dbEvent, 300000);
      expect(result).toEqual(dbEvent);
    });

    it('should throw NotFoundException if event does not exist in DB', async () => {
      const eventId = 'nonexistent-uuid';
      mockCacheManager.get.mockResolvedValue(null);
      mockPrismaService.event.findUnique.mockResolvedValue(null);

      await expect(service.findOne(eventId)).rejects.toThrow(NotFoundException);
    });
  });
});
