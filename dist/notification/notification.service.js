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
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const schedule_1 = require("@nestjs/schedule");
const mail_service_1 = require("../mail/mail.service");
let NotificationService = class NotificationService {
    prisma;
    mailService;
    constructor(prisma, mailService) {
        this.prisma = prisma;
        this.mailService = mailService;
    }
    async scheduleCustomReminder(userId, eventId, triggerTimeStr) {
        const event = await this.prisma.event.findUnique({
            where: { id: eventId },
        });
        if (!event) {
            throw new common_1.NotFoundException('Event not found');
        }
        const triggerTime = new Date(triggerTimeStr);
        if (triggerTime.getTime() <= Date.now()) {
            throw new common_1.BadRequestException('Reminder trigger time must be in the future');
        }
        if (triggerTime.getTime() >= new Date(event.date).getTime()) {
            throw new common_1.BadRequestException('Reminder trigger time must be before the event start time');
        }
        const ticket = await this.prisma.ticket.findFirst({
            where: {
                eventId,
                userId,
                status: 'PAID',
            },
        });
        if (!ticket) {
            throw new common_1.ForbiddenException('You must purchase a ticket to set a custom reminder for this event');
        }
        const reminder = await this.prisma.reminder.upsert({
            where: {
                userId_eventId_triggerTime: {
                    userId,
                    eventId,
                    triggerTime,
                },
            },
            create: {
                userId,
                eventId,
                triggerTime,
            },
            update: { sent: false },
        });
        return {
            message: 'Custom reminder scheduled successfully',
            reminderId: reminder.id,
            triggerTime: reminder.triggerTime,
        };
    }
    async handleRemindersCron() {
        const now = new Date();
        const dueReminders = await this.prisma.reminder.findMany({
            where: {
                triggerTime: { lte: now },
                sent: false,
            },
            include: {
                user: {
                    select: { id: true, name: true, email: true },
                },
                event: {
                    select: { id: true, title: true, date: true, location: true },
                },
            },
        });
        if (dueReminders.length === 0) {
            return;
        }
        for (const reminder of dueReminders) {
            try {
                await this.dispatchNotification(reminder);
            }
            catch (err) {
                console.error(`Failed to dispatch reminder ID: ${reminder.id}`, err);
            }
        }
    }
    async dispatchNotification(reminder) {
        await this.mailService.sendEventReminder(reminder.user.email, reminder.user.name, reminder.event);
        await this.prisma.reminder.update({
            where: { id: reminder.id },
            data: { sent: true },
        });
    }
};
exports.NotificationService = NotificationService;
__decorate([
    (0, schedule_1.Cron)('*/5 * * * *'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], NotificationService.prototype, "handleRemindersCron", null);
exports.NotificationService = NotificationService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        mail_service_1.MailService])
], NotificationService);
//# sourceMappingURL=notification.service.js.map