import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, UnauthorizedException, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

import { MailService } from '../mail/mail.service';

jest.mock('bcrypt');

const mockMailService = {
  sendWelcome: jest.fn().mockResolvedValue(undefined),
  sendDomainTest: jest.fn().mockResolvedValue(undefined),
};

const mockPrismaService = {
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};

const mockJwtService = {
  sign: jest.fn(),
};

describe('AuthService', () => {
  let service: AuthService;
  let prisma: PrismaService;
  let jwt: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: MailService, useValue: mockMailService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get<PrismaService>(PrismaService);
    jwt = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should successfully register a new user', async () => {
      const registerDto = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      };

      mockPrismaService.user.findUnique.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');
      
      const createdUser = {
        id: 'user-id',
        email: 'test@example.com',
        password: 'hashedPassword',
        name: 'Test User',
        role: 'EVENTEE',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockPrismaService.user.create.mockResolvedValue(createdUser);

      const result = await service.register(registerDto);

      expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { email: registerDto.email } });
      expect(bcrypt.hash).toHaveBeenCalledWith(registerDto.password, 10);
      expect(prisma.user.create).toHaveBeenCalled();
      expect(result).not.toHaveProperty('password');
      expect(result.email).toBe(registerDto.email);
    });

    it('should throw ConflictException if email is already taken', async () => {
      const registerDto = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      };

      mockPrismaService.user.findUnique.mockResolvedValue({ id: 'existing-id' });

      await expect(service.register(registerDto)).rejects.toThrow(ConflictException);
      expect(prisma.user.create).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('should successfully log in a user and return a token', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      const user = {
        id: 'user-id',
        email: 'test@example.com',
        password: 'hashedPassword',
        name: 'Test User',
        role: 'EVENTEE',
      };

      mockPrismaService.user.findUnique.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockJwtService.sign.mockReturnValue('jwtToken');

      const result = await service.login(loginDto);

      expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { email: loginDto.email } });
      expect(bcrypt.compare).toHaveBeenCalledWith(loginDto.password, 'hashedPassword');
      expect(jwt.sign).toHaveBeenCalled();
      expect(result).toHaveProperty('access_token');
      expect(result.access_token).toBe('jwtToken');
      expect(result.user.email).toBe(loginDto.email);
    });

    it('should throw UnauthorizedException if user not found', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if password does not match', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      const user = {
        id: 'user-id',
        email: 'test@example.com',
        password: 'hashedPassword',
        name: 'Test User',
        role: 'EVENTEE',
      };

      mockPrismaService.user.findUnique.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('getProfile', () => {
    it('should return the public user profile with hasPassword', async () => {
      const user = {
        id: 'user-id',
        email: 'test@example.com',
        name: 'Test User',
        role: 'EVENTEE' as const,
        password: 'hashedPassword',
      };

      mockPrismaService.user.findUnique.mockResolvedValue(user);

      const result = await service.getProfile('user-id');

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-id' },
        select: { id: true, email: true, name: true, role: true, password: true },
      });
      expect(result).toEqual({
        id: 'user-id',
        email: 'test@example.com',
        name: 'Test User',
        role: 'EVENTEE',
        hasPassword: true,
      });
    });

    it('should throw UnauthorizedException when user is not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.getProfile('missing-id')).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('updateProfile', () => {
    it('allows Google-only users to set a password without currentPassword', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({
        id: 'user-id',
        email: 'google@example.com',
        name: 'Google User',
        role: 'EVENTEE',
        password: null,
      });
      (bcrypt.hash as jest.Mock).mockResolvedValue('newHash');
      mockPrismaService.user.update.mockResolvedValue({
        id: 'user-id',
        email: 'google@example.com',
        name: 'Google User',
        role: 'EVENTEE',
        password: 'newHash',
      });

      const result = await service.updateProfile('user-id', { newPassword: 'password123' });

      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
      expect(result.hasPassword).toBe(true);
    });

    it('requires currentPassword when user already has a password', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({
        id: 'user-id',
        password: 'hashedPassword',
      });

      await expect(
        service.updateProfile('user-id', { newPassword: 'password123' }),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
