"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const bcrypt = __importStar(require("bcrypt"));
const jwt_1 = require("@nestjs/jwt");
const mail_service_1 = require("../mail/mail.service");
const google_auth_library_1 = require("google-auth-library");
const client_1 = require("@prisma/client");
let AuthService = class AuthService {
    prisma;
    jwtService;
    mailService;
    googleClient;
    constructor(prisma, jwtService, mailService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
        this.mailService = mailService;
        const clientId = process.env.GOOGLE_CLIENT_ID;
        this.googleClient = clientId ? new google_auth_library_1.OAuth2Client(clientId) : null;
    }
    toPublicUser(user) {
        return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            hasPassword: !!user.password,
        };
    }
    buildAuthResponse(user) {
        const payload = { email: user.email, sub: user.id, role: user.role };
        return {
            access_token: this.jwtService.sign(payload),
            user: this.toPublicUser(user),
        };
    }
    async getProfile(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, email: true, name: true, role: true, password: true },
        });
        if (!user) {
            throw new common_1.UnauthorizedException('User not found');
        }
        return this.toPublicUser(user);
    }
    async updateProfile(userId, dto) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            throw new common_1.UnauthorizedException('User not found');
        }
        if (dto.name === undefined && !dto.newPassword) {
            throw new common_1.BadRequestException('Provide a name and/or newPassword to update');
        }
        const data = {};
        if (dto.name !== undefined) {
            data.name = dto.name.trim();
        }
        if (dto.newPassword) {
            if (user.password) {
                if (!dto.currentPassword) {
                    throw new common_1.BadRequestException('currentPassword is required when changing an existing password');
                }
                const valid = await bcrypt.compare(dto.currentPassword, user.password);
                if (!valid) {
                    throw new common_1.UnauthorizedException('Current password is incorrect');
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
    async sendTestEmail(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { email: true, name: true },
        });
        if (!user) {
            throw new common_1.UnauthorizedException('User not found');
        }
        await this.mailService.sendDomainTest(user.email, user.name);
        return { message: `Test email sent to ${user.email}` };
    }
    async deleteAccount(userId) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            throw new common_1.UnauthorizedException('User not found');
        }
        await this.prisma.user.delete({ where: { id: userId } });
        return { message: 'Account deleted successfully' };
    }
    async register(registerDto) {
        const email = registerDto.email.toLowerCase().trim();
        const { password, name, role } = registerDto;
        const existingUser = await this.prisma.user.findUnique({
            where: { email },
        });
        if (existingUser) {
            throw new common_1.ConflictException('Email already registered');
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
    async login(loginDto) {
        const email = loginDto.email.toLowerCase().trim();
        const { password } = loginDto;
        const user = await this.prisma.user.findUnique({
            where: { email },
        });
        if (!user || !user.password || !(await bcrypt.compare(password, user.password))) {
            throw new common_1.UnauthorizedException('Invalid email or password');
        }
        return this.buildAuthResponse(user);
    }
    async googleLogin(dto) {
        if (!this.googleClient || !process.env.GOOGLE_CLIENT_ID) {
            throw new common_1.BadRequestException('Google OAuth is not configured');
        }
        const ticket = await this.googleClient.verifyIdToken({
            idToken: dto.idToken,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        if (!payload?.email) {
            throw new common_1.UnauthorizedException('Invalid Google token');
        }
        const normalizedEmail = payload.email.toLowerCase().trim();
        const googleId = payload.sub;
        const name = payload.name || normalizedEmail.split('@')[0];
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
                    role: client_1.Role.EVENTEE,
                },
            });
        }
        else {
            if (user.googleId && user.googleId !== googleId) {
                throw new common_1.UnauthorizedException('This email is linked to a different Google account');
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
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService,
        mail_service_1.MailService])
], AuthService);
//# sourceMappingURL=auth.service.js.map