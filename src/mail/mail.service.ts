import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import {
  welcomeEmail,
  ticketConfirmedEmail,
  paymentReceiptEmail,
  eventReminderEmail,
} from './mail.templates';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly resend: Resend | null;
  private readonly from: string;
  private readonly clientUrl: string;
  private readonly enabled: boolean;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('RESEND_API_KEY');
    this.from = this.configService.get<string>('MAIL_FROM') || 'Eventful <onboarding@resend.dev>';
    this.clientUrl = this.configService.get<string>('CLIENT_URL') || 'http://localhost:5173';
    this.enabled = !!apiKey;
    this.resend = apiKey ? new Resend(apiKey) : null;

    if (!this.enabled) {
      this.logger.warn('RESEND_API_KEY not set — emails will be logged only');
    }
  }

  private async send(to: string, subject: string, html: string): Promise<void> {
    if (!this.enabled || !this.resend) {
      this.logger.log(`[DEV EMAIL] To: ${to} | Subject: ${subject}`);
      return;
    }

    try {
      await this.resend.emails.send({ from: this.from, to, subject, html });
      this.logger.log(`Email sent to ${to}: ${subject}`);
    } catch (err) {
      this.logger.error(`Failed to send email to ${to}`, err);
    }
  }

  async sendWelcome(to: string, name: string): Promise<void> {
    await this.send(to, 'Welcome to Eventful!', welcomeEmail(name, this.clientUrl));
  }

  async sendTicketConfirmed(
    to: string,
    name: string,
    event: { title: string; date: Date | string; location: string; price: number },
  ): Promise<void> {
    await this.send(
      to,
      `Ticket Confirmed: ${event.title}`,
      ticketConfirmedEmail(name, { ...event, date: String(event.date) }, this.clientUrl),
    );
  }

  async sendPaymentReceipt(
    to: string,
    name: string,
    amount: number,
    reference: string,
    eventTitle: string,
  ): Promise<void> {
    await this.send(
      to,
      `Receipt from Eventful — ${eventTitle}`,
      paymentReceiptEmail(name, amount, reference, eventTitle, this.clientUrl),
    );
  }

  async sendEventReminder(
    to: string,
    name: string,
    event: { title: string; date: Date | string; location: string },
  ): Promise<void> {
    await this.send(
      to,
      `Reminder: ${event.title} is coming up`,
      eventReminderEmail(name, { ...event, date: String(event.date) }, this.clientUrl),
    );
  }
}
