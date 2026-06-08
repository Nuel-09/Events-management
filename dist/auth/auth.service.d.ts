import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { GoogleAuthDto } from './dto/google-auth.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { JwtService } from '@nestjs/jwt';
import { MailService } from '../mail/mail.service';
export declare class AuthService {
    private prisma;
    private jwtService;
    private mailService;
    private googleClient;
    constructor(prisma: PrismaService, jwtService: JwtService, mailService: MailService);
    private toPublicUser;
    private buildAuthResponse;
    getProfile(userId: string): Promise<{
        id: string;
        email: string;
        name: string;
        role: import(".prisma/client").$Enums.Role;
        hasPassword: boolean;
    }>;
    updateProfile(userId: string, dto: UpdateProfileDto): Promise<{
        id: string;
        email: string;
        name: string;
        role: import(".prisma/client").$Enums.Role;
        hasPassword: boolean;
    }>;
    sendTestEmail(userId: string): Promise<{
        message: string;
    }>;
    deleteAccount(userId: string): Promise<{
        message: string;
    }>;
    register(registerDto: RegisterDto): Promise<{
        id: string;
        email: string;
        googleId: string | null;
        name: string;
        role: import(".prisma/client").$Enums.Role;
        authProvider: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    login(loginDto: LoginDto): Promise<{
        access_token: string;
        user: {
            id: string;
            email: string;
            name: string;
            role: import(".prisma/client").$Enums.Role;
            hasPassword: boolean;
        };
    }>;
    googleLogin(dto: GoogleAuthDto): Promise<{
        access_token: string;
        user: {
            id: string;
            email: string;
            name: string;
            role: import(".prisma/client").$Enums.Role;
            hasPassword: boolean;
        };
    }>;
}
