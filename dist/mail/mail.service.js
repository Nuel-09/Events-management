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
var MailService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MailService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const resend_1 = require("resend");
const mail_config_1 = require("./mail.config");
const mail_templates_1 = require("./mail.templates");
let MailService = MailService_1 = class MailService {
    configService;
    logger = new common_1.Logger(MailService_1.name);
    resend;
    clientUrl;
    enabled;
    legacyFrom;
    constructor(configService) {
        this.configService = configService;
        const apiKey = this.configService.get('RESEND_API_KEY');
        this.legacyFrom =
            this.configService.get('MAIL_FROM') ||
                'Eventful <onboarding@resend.dev>';
        this.clientUrl =
            this.configService.get('CLIENT_URL') || 'http://localhost:5173';
        this.enabled = !!apiKey;
        this.resend = apiKey ? new resend_1.Resend(apiKey) : null;
        if (!this.enabled) {
            this.logger.warn('RESEND_API_KEY not set — emails will be logged only');
        }
    }
    resolveFrom(sender) {
        if (this.configService.get('MAIL_DOMAIN') || this.configService.get('MAIL_FROM_TRANSACTIONAL')) {
            return (0, mail_config_1.resolveMailAddress)(this.configService, sender);
        }
        return { from: this.legacyFrom, replyTo: this.legacyFrom };
    }
    async send(to, subject, html, sender = 'transactional') {
        const { from, replyTo } = this.resolveFrom(sender);
        if (!this.enabled || !this.resend) {
            this.logger.log(`[DEV EMAIL] From: ${from} | Reply-To: ${replyTo} | To: ${to} | Subject: ${subject}`);
            return;
        }
        try {
            await this.resend.emails.send({
                from,
                to,
                subject,
                html,
                replyTo,
            });
            this.logger.log(`Email sent to ${to} from ${from}: ${subject}`);
        }
        catch (err) {
            this.logger.error(`Failed to send email to ${to}`, err);
        }
    }
    async sendOrThrow(to, subject, html, sender = 'transactional') {
        const { from, replyTo } = this.resolveFrom(sender);
        if (!this.enabled || !this.resend) {
            throw new Error('RESEND_API_KEY is not configured');
        }
        await this.resend.emails.send({
            from,
            to,
            subject,
            html,
            replyTo,
        });
        this.logger.log(`Email sent to ${to} from ${from}: ${subject}`);
    }
    async sendWelcome(to, name) {
        await this.send(to, 'Welcome to Eventful!', (0, mail_templates_1.welcomeEmail)(name, this.clientUrl), 'personal');
    }
    async sendTicketConfirmed(to, name, event) {
        await this.send(to, `Ticket Confirmed: ${event.title}`, (0, mail_templates_1.ticketConfirmedEmail)(name, { ...event, date: String(event.date) }, this.clientUrl), 'transactional');
    }
    async sendPaymentReceipt(to, name, amount, reference, eventTitle) {
        await this.send(to, `Receipt from Eventful — ${eventTitle}`, (0, mail_templates_1.paymentReceiptEmail)(name, amount, reference, eventTitle, this.clientUrl), 'transactional');
    }
    async sendEventReminder(to, name, event) {
        await this.send(to, `Reminder: ${event.title} is coming up`, (0, mail_templates_1.eventReminderEmail)(name, { ...event, date: String(event.date) }, this.clientUrl), 'transactional');
    }
    async sendDomainTest(to, name) {
        await this.sendOrThrow(to, 'Eventful — custom domain email test', (0, mail_templates_1.domainTestEmail)(name, this.clientUrl), 'transactional');
    }
};
exports.MailService = MailService;
exports.MailService = MailService = MailService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], MailService);
//# sourceMappingURL=mail.service.js.map