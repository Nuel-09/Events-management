import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { MailService } from './mail.service';

describe('MailService', () => {
  let service: MailService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MailService,
        {
          provide: ConfigService,
          useValue: {
            get: (key: string) => {
              const map: Record<string, string> = {
                CLIENT_URL: 'http://localhost:5173',
              };
              return map[key];
            },
          },
        },
      ],
    }).compile();

    service = module.get<MailService>(MailService);
  });

  it('sendWelcome runs without Resend key (dev log mode)', async () => {
    await expect(service.sendWelcome('test@example.com', 'Test User')).resolves.toBeUndefined();
  });
});
