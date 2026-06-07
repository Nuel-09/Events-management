import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { InitializePaymentDto } from './dto/initialize-payment.dto';
import { MailService } from '../mail/mail.service';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import * as QRCode from 'qrcode';
import * as crypto from 'crypto';

@Injectable()
export class PaymentService {
  private readonly paystackUrl = 'https://api.paystack.co';
  private readonly clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';

  constructor(
    private prisma: PrismaService,
    private mailService: MailService,
  ) {}

  private get paystackHeaders() {
    return {
      Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      'Content-Type': 'application/json',
    };
  }

  async initializePayment(userId: string, email: string, dto: InitializePaymentDto) {
    const event = await this.prisma.event.findUnique({
      where: { id: dto.eventId },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    if (event.ticketsSold >= event.capacity) {
      throw new BadRequestException('Event is sold out');
    }

    const reference = `evt_ref_${uuidv4()}`;
    const verificationToken = uuidv4();

    // Create a pending ticket
    const ticket = await this.prisma.ticket.create({
      data: {
        eventId: event.id,
        userId,
        paymentReference: reference,
        status: 'PENDING',
        verificationToken,
      },
    });

    // If the event is free, bypass Paystack payment gateway immediately
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
      const response = await axios.post(
        `${this.paystackUrl}/transaction/initialize`,
        {
          email,
          amount: amountInKobo,
          reference,
          metadata: {
            ticketId: ticket.id,
            eventId: event.id,
            userId,
          },
        },
        { headers: this.paystackHeaders },
      );

      if (response.data && response.data.status) {
        return {
          message: 'Payment initialized successfully',
          reference,
          isFree: false,
          redirectUrl: response.data.data.authorization_url,
        };
      } else {
        throw new BadRequestException('Failed to initialize Paystack payment');
      }
    } catch (error: any) {
      const errMsg = error.response?.data?.message || error.message;
      throw new BadRequestException(`Paystack Initialization Error: ${errMsg}`);
    }
  }

  async verifyPaystackWebhook(rawBody: string, signature: string) {
    const hash = crypto
      .createHmac('sha512', process.env.PAYSTACK_SECRET_KEY || '')
      .update(rawBody)
      .digest('hex');

    if (hash !== signature) {
      throw new BadRequestException('Invalid signature');
    }

    const eventData = JSON.parse(rawBody);
    if (eventData.event === 'charge.success') {
      const reference = eventData.data.reference;
      await this.verifyAndFulfillByReference(reference);
    }
    return { status: 'success' };
  }

  async verifyAndFulfillByReference(reference: string) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { paymentReference: reference },
      include: { event: true },
    });

    if (!ticket) {
      throw new NotFoundException('Ticket with this reference not found');
    }

    if (ticket.status === 'PAID') {
      return ticket;
    }

    // Call Paystack verification endpoint
    try {
      const response = await axios.get(
        `${this.paystackUrl}/transaction/verify/${reference}`,
        { headers: this.paystackHeaders },
      );

      if (response.data && response.data.status && response.data.data.status === 'success') {
        return await this.fulfillTicket(ticket.id);
      } else {
        throw new BadRequestException('Transaction was not successful on Paystack');
      }
    } catch (error: any) {
      const errMsg = error.response?.data?.message || error.message;
      throw new BadRequestException(`Paystack Verification Error: ${errMsg}`);
    }
  }

  private async fulfillTicket(ticketId: string) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id: ticketId },
      include: { event: true, user: true },
    });

    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    if (ticket.status === 'PAID') {
      return ticket;
    }

    const ticketUrl = `${this.clientUrl}/tickets?ticket=${ticket.id}`;
    const qrCodeUrl = await QRCode.toDataURL(ticketUrl);

    // Update ticket state to PAID, increment ticketsSold count, and create default reminders
    const updatedTicket = await this.prisma.$transaction(async (tx) => {
      // Check capacity again in transaction to prevent overbooking
      const event = await tx.event.findUnique({
        where: { id: ticket.eventId },
      });

      if (!event) {
        throw new NotFoundException('Event not found');
      }

      if (event.ticketsSold >= event.capacity) {
        throw new BadRequestException('Event capacity has been reached');
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

      // Calculate and schedule creator-set default reminder
      const triggerTime = new Date(event.date);
      if (event.reminderInterval === '1_WEEK') {
        triggerTime.setDate(triggerTime.getDate() - 7);
      } else {
        // default 1_DAY
        triggerTime.setDate(triggerTime.getDate() - 1);
      }

      if (triggerTime.getTime() > Date.now()) {
        await tx.reminder.upsert({
          where: {
            userId_eventId_triggerTime: {
              userId: ticket.userId,
              eventId: event.id,
              triggerTime,
            },
          },
          create: {
            userId: ticket.userId,
            eventId: event.id,
            triggerTime,
          },
          update: {},
        });
      }

      return updated;
    });

    await this.mailService.sendTicketConfirmed(
      ticket.user.email,
      ticket.user.name,
      ticket.event,
    );

    if (ticket.event.price > 0) {
      await this.mailService.sendPaymentReceipt(
        ticket.user.email,
        ticket.user.name,
        ticket.event.price,
        ticket.paymentReference,
        ticket.event.title,
      );
    }

    return updatedTicket;
  }

  async getCreatorPaymentDetails(creatorId: string) {
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
}
