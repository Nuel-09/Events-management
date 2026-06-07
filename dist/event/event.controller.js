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
exports.EventController = void 0;
const common_1 = require("@nestjs/common");
const event_service_1 = require("./event.service");
const create_event_dto_1 = require("./dto/create-event.dto");
const update_event_dto_1 = require("./dto/update-event.dto");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const client_1 = require("@prisma/client");
const current_user_decorator_1 = require("../auth/current-user.decorator");
const swagger_1 = require("@nestjs/swagger");
let EventController = class EventController {
    eventService;
    constructor(eventService) {
        this.eventService = eventService;
    }
    async create(createEventDto, creatorId) {
        return this.eventService.create(creatorId, createEventDto);
    }
    async update(eventId, updateEventDto, creatorId) {
        return this.eventService.update(eventId, creatorId, updateEventDto);
    }
    async remove(eventId, creatorId) {
        return this.eventService.remove(eventId, creatorId);
    }
    async getCreatorEvents(creatorId) {
        return this.eventService.getCreatorEvents(creatorId);
    }
    async findAll(search, limit, cursor) {
        const limitVal = limit ? Number(limit) : 10;
        return this.eventService.findAll(search, limitVal, cursor);
    }
    async shareEvent(eventId, res) {
        const event = (await this.eventService.findOne(eventId));
        const formattedDate = event.date instanceof Date ? event.date.toUTCString() : new Date(event.date).toUTCString();
        const ogHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${event.title} | Eventful</title>
  <meta name="description" content="${event.description}" />
  
  <!-- OpenGraph Metadata -->
  <meta property="og:title" content="${event.title}" />
  <meta property="og:description" content="${event.description}" />
  <meta property="og:image" content="https://picsum.photos/800/400?random=${event.id}" />
  <meta property="og:type" content="event" />
  <meta property="og:site_name" content="Eventful" />
  <meta property="og:url" content="https://eventful.com/events/${event.id}" />
  
  <!-- Twitter Card Metadata -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${event.title}">
  <meta name="twitter:description" content="${event.description}">
  <meta name="twitter:image" content="https://picsum.photos/800/400?random=${event.id}">

  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background: #121214;
      color: #e1e1e6;
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      margin: 0;
    }
    .card {
      background: #202024;
      padding: 2.5rem;
      border-radius: 12px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.5);
      max-width: 500px;
      text-align: center;
    }
    h1 { color: #04d361; margin-bottom: 1rem; }
    p { line-height: 1.6; margin: 0.5rem 0; }
    .btn {
      display: inline-block;
      margin-top: 1.5rem;
      padding: 0.8rem 1.8rem;
      background: #04d361;
      color: #fff;
      text-decoration: none;
      font-weight: bold;
      border-radius: 6px;
      transition: background 0.2s;
    }
    .btn:hover { background: #03a84e; }
  </style>
</head>
<body>
  <div class="card">
    <h1>${event.title}</h1>
    <p><strong>Description:</strong> ${event.description}</p>
    <p><strong>Venue:</strong> ${event.location}</p>
    <p><strong>Date & Time:</strong> ${formattedDate}</p>
    <p><strong>Ticket Price:</strong> $${event.price}</p>
    <a href="/events/${event.id}" class="btn">View on Eventful</a>
  </div>
  
  <script>
    // Redirect normal browsers to actual frontend listing after a slight delay
    setTimeout(() => {
      window.location.href = '/events/${event.id}';
    }, 1500);
  </script>
</body>
</html>`;
        res.setHeader('Content-Type', 'text/html');
        return res.status(200).send(ogHtml);
    }
    async findOne(eventId) {
        return this.eventService.findOne(eventId);
    }
};
exports.EventController = EventController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.Role.CREATOR),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create an event (Creators only)' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Event created successfully.' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Only creators can create events.' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_event_dto_1.CreateEventDto, String]),
    __metadata("design:returntype", Promise)
], EventController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.Role.CREATOR),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Update event details (Creator owner only)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Event updated successfully.' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden.' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Event not found.' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_event_dto_1.UpdateEventDto, String]),
    __metadata("design:returntype", Promise)
], EventController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.Role.CREATOR),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Delete an event (Creator owner only)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Event removed successfully.' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden.' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Event not found.' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], EventController.prototype, "remove", null);
__decorate([
    (0, common_1.Get)('creator'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.Role.CREATOR),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all events created by logged-in creator, along with booked attendees' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of events with applicants.' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], EventController.prototype, "getCreatorEvents", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List all events with cursor pagination and search filter (public)' }),
    (0, swagger_1.ApiQuery)({ name: 'search', required: false, description: 'Keyword to search in title, description, or location' }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, schema: { default: 10 }, description: 'Number of items per page' }),
    (0, swagger_1.ApiQuery)({ name: 'cursor', required: false, description: 'Cursor event ID for pagination' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Successfully retrieved list of events.' }),
    __param(0, (0, common_1.Query)('search')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('cursor')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, String]),
    __metadata("design:returntype", Promise)
], EventController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id/share'),
    (0, swagger_1.ApiOperation)({ summary: 'Public route returning dynamic OpenGraph HTML tags for sharing' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Returns raw HTML page containing metadata preview tags.' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], EventController.prototype, "shareEvent", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Retrieve details of a single event (public)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Event details.' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Event not found.' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], EventController.prototype, "findOne", null);
exports.EventController = EventController = __decorate([
    (0, swagger_1.ApiTags)('Events'),
    (0, common_1.Controller)('events'),
    __metadata("design:paramtypes", [event_service_1.EventService])
], EventController);
//# sourceMappingURL=event.controller.js.map