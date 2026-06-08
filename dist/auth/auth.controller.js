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
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const throttler_1 = require("@nestjs/throttler");
const auth_service_1 = require("./auth.service");
const register_dto_1 = require("./dto/register.dto");
const login_dto_1 = require("./dto/login.dto");
const google_auth_dto_1 = require("./dto/google-auth.dto");
const update_profile_dto_1 = require("./dto/update-profile.dto");
const jwt_auth_guard_1 = require("./jwt-auth.guard");
const current_user_decorator_1 = require("./current-user.decorator");
const swagger_1 = require("@nestjs/swagger");
const AUTH_RATE_LIMIT = { default: { limit: 5, ttl: 60_000 } };
let AuthController = class AuthController {
    authService;
    constructor(authService) {
        this.authService = authService;
    }
    async register(registerDto) {
        return this.authService.register(registerDto);
    }
    async login(loginDto) {
        return this.authService.login(loginDto);
    }
    async googleLogin(dto) {
        return this.authService.googleLogin(dto);
    }
    getMe(userId) {
        return this.authService.getProfile(userId);
    }
    updateMe(userId, dto) {
        return this.authService.updateProfile(userId, dto);
    }
    deleteMe(userId) {
        return this.authService.deleteAccount(userId);
    }
    sendTestEmail(userId) {
        return this.authService.sendTestEmail(userId);
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.Post)('register'),
    (0, throttler_1.Throttle)(AUTH_RATE_LIMIT),
    (0, swagger_1.ApiOperation)({ summary: 'Register a new user (Creator or Eventee)' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'User successfully registered.' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'Email already registered.' }),
    (0, swagger_1.ApiResponse)({ status: 429, description: 'Too many requests.' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [register_dto_1.RegisterDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "register", null);
__decorate([
    (0, common_1.Post)('login'),
    (0, throttler_1.Throttle)(AUTH_RATE_LIMIT),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Authenticate user and retrieve access token' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Successfully authenticated, returned JWT access token.' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Invalid credentials.' }),
    (0, swagger_1.ApiResponse)({ status: 429, description: 'Too many login attempts.' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [login_dto_1.LoginDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
__decorate([
    (0, common_1.Post)('google'),
    (0, throttler_1.Throttle)(AUTH_RATE_LIMIT),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Authenticate with Google ID token' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Successfully authenticated via Google.' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Invalid Google token.' }),
    (0, swagger_1.ApiResponse)({ status: 429, description: 'Too many requests.' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [google_auth_dto_1.GoogleAuthDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "googleLogin", null);
__decorate([
    (0, common_1.Get)('me'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get the currently authenticated user profile' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Returns the current user.' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized.' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "getMe", null);
__decorate([
    (0, common_1.Patch)('me'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Update the current user profile' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Profile updated.' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_profile_dto_1.UpdateProfileDto]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "updateMe", null);
__decorate([
    (0, common_1.Delete)('me'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Delete the current user account' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Account deleted.' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "deleteMe", null);
__decorate([
    (0, common_1.Post)('me/test-email'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Send a test email to verify custom domain / Resend setup' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Test email queued.' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "sendTestEmail", null);
exports.AuthController = AuthController = __decorate([
    (0, swagger_1.ApiTags)('Authentication'),
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [auth_service_1.AuthService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map