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
exports.TicketController = void 0;
const common_1 = require("@nestjs/common");
const ticket_service_1 = require("./ticket.service");
const verify_ticket_dto_1 = require("./dto/verify-ticket.dto");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const client_1 = require("@prisma/client");
const current_user_decorator_1 = require("../auth/current-user.decorator");
const swagger_1 = require("@nestjs/swagger");
let TicketController = class TicketController {
    ticketService;
    constructor(ticketService) {
        this.ticketService = ticketService;
    }
    async getMyTickets(userId) {
        return this.ticketService.getUserTickets(userId);
    }
    async verifyTicket(dto, creatorId) {
        return this.ticketService.verifyTicketQr(creatorId, dto);
    }
    async getTicket(ticketId, userId, role) {
        return this.ticketService.getTicketById(ticketId, userId, role);
    }
};
exports.TicketController = TicketController;
__decorate([
    (0, common_1.Get)(),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.Role.EVENTEE),
    (0, swagger_1.ApiOperation)({ summary: 'Get list of paid tickets booked by the logged-in eventee' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'User ticket history.' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TicketController.prototype, "getMyTickets", null);
__decorate([
    (0, common_1.Post)('verify-qr'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.Role.CREATOR),
    (0, swagger_1.ApiOperation)({ summary: 'Verify eventee ticket QR verification token (Creators only)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Ticket validated successfully, access granted.' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid token, already scanned, or unpaid ticket.' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Creator does not own the event.' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [verify_ticket_dto_1.VerifyTicketDto, String]),
    __metadata("design:returntype", Promise)
], TicketController.prototype, "verifyTicket", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get details of a single ticket (includes QR Code image data URL)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Ticket details.' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden access to ticket.' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Ticket not found.' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(2, (0, current_user_decorator_1.CurrentUser)('role')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], TicketController.prototype, "getTicket", null);
exports.TicketController = TicketController = __decorate([
    (0, swagger_1.ApiTags)('Tickets'),
    (0, common_1.Controller)('tickets'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [ticket_service_1.TicketService])
], TicketController);
//# sourceMappingURL=ticket.controller.js.map