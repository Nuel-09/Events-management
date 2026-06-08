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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const mail_service_1 = require("../mail/mail.service");
const axios_1 = __importDefault(require("axios"));
const uuid_1 = require("uuid");
const QRCode = __importStar(require("qrcode"));
const crypto = __importStar(require("crypto"));
let PaymentService = class PaymentService {
    prisma;
    mailService;
    paystackUrl = 'https://api.paystack.co';
    clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    constructor(prisma, mailService) {
        this.prisma = prisma;
        this.mailService = mailService;
    }
    get paystackHeaders() {
        return {
            Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
            'Content-Type': 'application/json',
        };
    }
    async initializePayment(userId, email, dto) {
        const event = await this.prisma.event.findUnique({
            where: { id: dto.eventId },
        });
        if (!event) {
            throw new common_1.NotFoundException('Event not found');
        }
        if (event.ticketsSold >= event.capacity) {
            throw new common_1.BadRequestException('Event is sold out');
        }
        const reference = `evt_ref_${(0, uuid_1.v4)()}`;
        const verificationToken = (0, uuid_1.v4)();
        const ticket = await this.prisma.ticket.create({
            data: {
                eventId: event.id,
                userId,
                paymentReference: reference,
                status: 'PENDING',
                verificationToken,
            },
        });
        if (event.price === 0) {
            await this.fulfillTicket(ticket.id);
            return {
                message: 'Ticket booked successfully (Free Event)',
                reference,
                isFree: true,
                redirectUrl: null,
            };
        }
        try {
            const amountInKobo = Math.round(event.price * 100);
            const callbackUrl = `${this.clientUrl}/payment-callback?eventId=${event.id}`;
            const response = await axios_1.default.post(`${this.paystackUrl}/transaction/initialize`, {
                email,
                amount: amountInKobo,
                currency: 'NGN',
                reference,
                callback_url: callbackUrl,
                metadata: {
                    ticketId: ticket.id,
                    eventId: event.id,
                    userId,
                },
            }, { headers: this.paystackHeaders });
            if (response.data && response.data.status) {
                return {
                    message: 'Payment initialized successfully',
                    reference,
                    isFree: false,
                    redirectUrl: response.data.data.authorization_url,
                };
            }
            else {
                throw new common_1.BadRequestException('Failed to initialize Paystack payment');
            }
        }
        catch (error) {
            const errMsg = error.response?.data?.message || error.message;
            throw new common_1.BadRequestException(`Paystack Initialization Error: ${errMsg}`);
        }
    }
    async verifyPaystackWebhook(rawBody, signature) {
        const hash = crypto
            .createHmac('sha512', process.env.PAYSTACK_SECRET_KEY || '')
            .update(rawBody)
            .digest('hex');
        if (hash !== signature) {
            throw new common_1.BadRequestException('Invalid signature');
        }
        const eventData = JSON.parse(rawBody);
        if (eventData.event === 'charge.success') {
            const reference = eventData.data.reference;
            await this.verifyAndFulfillByReference(reference);
        }
        return { status: 'success' };
    }
    async verifyAndFulfillByReference(reference, userId) {
        const normalizedReference = decodeURIComponent(reference).trim();
        const ticket = await this.prisma.ticket.findUnique({
            where: { paymentReference: normalizedReference },
            include: {
                event: {
                    select: { id: true, title: true, date: true, location: true, price: true },
                },
            },
        });
        if (!ticket) {
            throw new common_1.NotFoundException('Payment reference not found');
        }
        if (userId && ticket.userId !== userId) {
            throw new common_1.BadRequestException('This payment reference does not belong to your account');
        }
        if (ticket.status === 'PAID') {
            return ticket;
        }
        try {
            const response = await axios_1.default.get(`${this.paystackUrl}/transaction/verify/${reference}`, { headers: this.paystackHeaders });
            if (response.data && response.data.status && response.data.data.status === 'success') {
                await this.fulfillTicket(ticket.id);
                return this.prisma.ticket.findUnique({
                    where: { paymentReference: reference },
                    include: {
                        event: {
                            select: { id: true, title: true, date: true, location: true, price: true },
                        },
                    },
                });
            }
            else {
                throw new common_1.BadRequestException('Transaction was not successful on Paystack');
            }
        }
        catch (error) {
            if (error instanceof common_1.BadRequestException || error instanceof common_1.NotFoundException) {
                throw error;
            }
            const errMsg = error.response?.data?.message || error.message;
            throw new common_1.BadRequestException(`Paystack Verification Error: ${errMsg}`);
        }
    }
    async fulfillTicket(ticketId) {
        const ticket = await this.prisma.ticket.findUnique({
            where: { id: ticketId },
            include: { event: true, user: true },
        });
        if (!ticket) {
            throw new common_1.NotFoundException('Ticket not found');
        }
        if (ticket.status === 'PAID') {
            return ticket;
        }
        const ticketUrl = `${this.clientUrl}/tickets?ticket=${ticket.id}`;
        const qrCodeUrl = await QRCode.toDataURL(ticketUrl);
        const updatedTicket = await this.prisma.$transaction(async (tx) => {
            const event = await tx.event.findUnique({
                where: { id: ticket.eventId },
            });
            if (!event) {
                throw new common_1.NotFoundException('Event not found');
            }
            if (event.ticketsSold >= event.capacity) {
                throw new common_1.BadRequestException('Event capacity has been reached');
            }
            await tx.event.update({
                where: { id: ticket.eventId },
                data: { ticketsSold: { increment: 1 } },
            });
            const updated = await tx.ticket.update({
                where: { id: ticketId },
                data: {
                    status: 'PAID',
                    qrCodeUrl,
                },
            });
            const triggerTime = new Date(event.date);
            if (event.reminderInterval === '1_WEEK') {
                triggerTime.setDate(triggerTime.getDate() - 7);
            }
            else {
                triggerTime.setDate(triggerTime.getDate() - 1);
            }
            if (triggerTime.getTime() > Date.now()) {
                const existingReminder = await tx.reminder.findFirst({
                    where: {
                        userId: ticket.userId,
                        eventId: event.id,
                        triggerTime,
                    },
                });
                if (!existingReminder) {
                    await tx.reminder.create({
                        data: {
                            userId: ticket.userId,
                            eventId: event.id,
                            triggerTime,
                        },
                    });
                }
            }
            return updated;
        });
        await this.mailService.sendTicketConfirmed(ticket.user.email, ticket.user.name, ticket.event);
        if (ticket.event.price > 0) {
            await this.mailService.sendPaymentReceipt(ticket.user.email, ticket.user.name, ticket.event.price, ticket.paymentReference, ticket.event.title);
        }
        return updatedTicket;
    }
    async getCreatorPaymentDetails(creatorId) {
        return this.prisma.ticket.findMany({
            where: {
                status: 'PAID',
                event: { creatorId },
            },
            include: {
                user: {
                    select: { id: true, name: true, email: true },
                },
                event: {
                    select: { id: true, title: true, price: true },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async reconcilePendingPayments(limit = 50) {
        const pending = await this.prisma.ticket.findMany({
            where: { status: 'PENDING' },
            select: { paymentReference: true },
            orderBy: { createdAt: 'asc' },
            take: limit,
        });
        const results = [];
        for (const ticket of pending) {
            try {
                await this.verifyAndFulfillByReference(ticket.paymentReference);
                results.push({ reference: ticket.paymentReference, status: 'fulfilled' });
            }
            catch (err) {
                results.push({
                    reference: ticket.paymentReference,
                    status: 'skipped',
                    error: err?.message || 'Verification failed',
                });
            }
        }
        return {
            processed: results.length,
            fulfilled: results.filter((r) => r.status === 'fulfilled').length,
            results,
        };
    }
};
exports.PaymentService = PaymentService;
exports.PaymentService = PaymentService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        mail_service_1.MailService])
], PaymentService);
//# sourceMappingURL=payment.service.js.map