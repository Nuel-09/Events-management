import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import { MailSender, resolveMailAddress } from './mail.config';
import {
  welcomeEmail,
  ticketConfirmedEmail,
  paymentReceiptEmail,
  eventReminderEmail,
  domainTestEmail,
} from './mail.templates';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly resend: Resend | null;
  private readonly clientUrl: string;
  private readonly enabled: boolean;
  /** Legacy single-sender fallback when MAIL_DOMAIN is not configured */
  private readonly legacyFrom: string;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('RESEND_API_KEY');
    this.legacyFrom =
      this.configService.get<string>('MAIL_FROM') ||
      'Eventful <onboarding@resend.dev>';
    this.clientUrl =
      this.configService.get<string>('CLIENT_URL') || 'http://localhost:5173';
    this.enabled = !!apiKey;
    this.resend = apiKey ? new Resend(apiKey) : null;

    if (!this.enabled) {
      this.logger.warn('RESEND_API_KEY not set — emails will be logged only');
    }
  }

  private resolveFrom(sender: MailSender) {
    if (this.configService.get<string>('MAIL_DOMAIN') || this.configService.get<string>('MAIL_FROM_TRANSACTIONAL')) {
      return resolveMailAddress(this.configService, sender);
    }
    return { from: this.legacyFrom, replyTo: this.legacyFrom };
  }

  private async send(
    to: string,
    subject: string,
    html: string,
    sender: MailSender = 'transactional',
  ): Promise<void> {
    const { from, replyTo } = this.resolveFrom(sender);

    if (!this.enabled || !this.resend) {
      this.logger.log(
        `[DEV EMAIL] From: ${from} | Reply-To: ${replyTo} | To: ${to} | Subject: ${subject}`,
      );
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
    } catch (err) {
      this.logger.error(`Failed to send email to ${to}`, err);
    }
  }

  private async sendOrThrow(
    to: string,
    subject: string,
    html: string,
    sender: MailSender = 'transactional',
  ): Promise<void> {
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

  async sendWelcome(to: string, name: string): Promise<void> {
    await this.send(
      to,
      'Welcome to Eventful!',
      welcomeEmail(name, this.clientUrl),
      'personal',
    );
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
      'transactional',
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
      'transactional',
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
      'transactional',
    );
  }

  async sendDomainTest(to: string, name: string): Promise<void> {
    await this.sendOrThrow(
      to,
      'Eventful — custom domain email test',
      domainTestEmail(name, this.clientUrl),
      'transactional',
    );
  }
}
