import { Test, TestingModule } from '@nestjs/testing';
import { TicketService } from './ticket.service';
import { PrismaService } from '../prisma/prisma.service';

describe('TicketService', () => {
  let service: TicketService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TicketService,
        { provide: PrismaService, useValue: {} },
      ],
    }).compile();

    service = module.get<TicketService>(TicketService);
  });

  describe('parseVerificationToken', () => {
    it('returns raw UUID token as-is', () => {
      const token = 'abc-123-def';
      expect(service.parseVerificationToken(token)).toBe(token);
    });

    it('extracts ticket id from deep link URL', () => {
      const url = 'http://localhost:5173/tickets?ticket=ticket-uuid-123';
      expect(service.parseVerificationToken(url)).toBe('ticket-uuid-123');
    });

    it('extracts token from path segment', () => {
      const url = 'http://localhost:5173/tickets/abc-token';
      expect(service.parseVerificationToken(url)).toBe('abc-token');
    });
  });
});
