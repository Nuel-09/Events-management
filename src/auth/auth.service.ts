import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { GoogleAuthDto } from './dto/google-auth.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { MailService } from '../mail/mail.service';
import { OAuth2Client } from 'google-auth-library';
import { Role } from '@prisma/client';

@Injectable()
export class AuthService {
  private googleClient: OAuth2Client | null;

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private mailService: MailService,
  ) {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    this.googleClient = clientId ? new OAuth2Client(clientId) : null;
  }

  private toPublicUser(user: {
    id: string;
    email: string;
    name: string;
    role: Role;
    password?: string | null;
  }) {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      hasPassword: !!user.password,
    };
  }

  private buildAuthResponse(user: { id: string; email: string; name: string; role: Role }) {
    const payload = { email: user.email, sub: user.id, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
      user: this.toPublicUser(user),
    };
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true, role: true, password: true },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return this.toPublicUser(user);
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (dto.name === undefined && !dto.newPassword) {
      throw new BadRequestException('Provide a name and/or newPassword to update');
    }

    const data: { name?: string; password?: string } = {};

    if (dto.name !== undefined) {
      data.name = dto.name.trim();
    }

    if (dto.newPassword) {
      if (user.password) {
        if (!dto.currentPassword) {
          throw new BadRequestException(
            'currentPassword is required when changing an existing password',
          );
        }
        const valid = await bcrypt.compare(dto.currentPassword, user.password);
        if (!valid) {
          throw new UnauthorizedException('Current password is incorrect');
        }
      }
      data.password = await bcrypt.hash(dto.newPassword, 10);
    }

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data,
      select: { id: true, email: true, name: true, role: true, password: true },
    });

    return this.toPublicUser(updated);
  }

  async sendTestEmail(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, name: true },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    await this.mailService.sendDomainTest(user.email, user.name);

    return { message: `Test email sent to ${user.email}` };
  }

  async deleteAccount(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    await this.prisma.user.delete({ where: { id: userId } });

    return { message: 'Account deleted successfully' };
  }

  async register(registerDto: RegisterDto) {
    const email = registerDto.email.toLowerCase().trim();
    const { password, name, role } = registerDto;

    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: name.trim(),
        role: role || 'EVENTEE',
        authProvider: 'local',
      },
    });

    await this.mailService.sendWelcome(user.email, user.name);

    const { password: _, ...result } = user;
    return result;
  }

  async login(loginDto: LoginDto) {
    const email = loginDto.email.toLowerCase().trim();
    const { password } = loginDto;

    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user || !user.password || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('Invalid email or password');
    }

    return this.buildAuthResponse(user);
  }

  async googleLogin(dto: GoogleAuthDto) {
    if (!this.googleClient || !process.env.GOOGLE_CLIENT_ID) {
      throw new BadRequestException('Google OAuth is not configured');
    }

    const ticket = await this.googleClient.verifyIdToken({
      idToken: dto.idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload?.email) {
      throw new UnauthorizedException('Invalid Google token');
    }

    const normalizedEmail = payload.email.toLowerCase().trim();
    const googleId = payload.sub;
    const name = payload.name || normalizedEmail.split('@')[0];

    // Prefer googleId lookup so returning Google users never hit the signup path
    let user = await this.prisma.user.findUnique({ where: { googleId } });
    let isNewUser = false;

    if (!user) {
      user = await this.prisma.user.findUnique({ where: { email: normalizedEmail } });
    }

    if (!user) {
      isNewUser = true;
      user = await this.prisma.user.create({
        data: {
          email: normalizedEmail,
          name,
          googleId,
          authProvider: 'google',
          role: Role.EVENTEE,
        },
      });
    } else {
      if (user.googleId && user.googleId !== googleId) {
        throw new UnauthorizedException('This email is linked to a different Google account');
      }
      if (!user.googleId) {
        user = await this.prisma.user.update({
          where: { id: user.id },
          data: {
            googleId,
            authProvider: user.authProvider === 'local' ? 'google' : user.authProvider,
          },
        });
      }
    }

    if (isNewUser) {
      await this.mailService.sendWelcome(user.email, user.name);
    }

    return this.buildAuthResponse(user);
  }
}
