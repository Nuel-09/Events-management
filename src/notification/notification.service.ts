import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Cron } from '@nestjs/schedule';
import { MailService } from '../mail/mail.service';

@Injectable()
export class NotificationService {
  constructor(
    private prisma: PrismaService,
    private mailService: MailService,
  ) {}

  async scheduleCustomReminder(userId: string, eventId: string, triggerTimeStr: string) {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    const triggerTime = this.normalizeTriggerTime(new Date(triggerTimeStr));
    if (Number.isNaN(triggerTime.getTime())) {
      throw new BadRequestException('Invalid reminder date and time');
    }

    if (triggerTime.getTime() <= Date.now()) {
      throw new BadRequestException('Reminder time must be in the future');
    }

    if (triggerTime.getTime() >= new Date(event.date).getTime()) {
      throw new BadRequestException('Reminder time must be before the event starts');
    }

    const ticket = await this.prisma.ticket.findFirst({
      where: {
        eventId,
        userId,
        status: 'PAID',
      },
    });

    if (!ticket) {
      throw new ForbiddenException('You must have a paid ticket to set a reminder for this event');
    }

    const existing = await this.prisma.reminder.findFirst({
      where: { userId, eventId, triggerTime },
    });

    const reminder = existing
      ? await this.prisma.reminder.update({
          where: { id: existing.id },
          data: { sent: false },
        })
      : await this.prisma.reminder.create({
          data: { userId, eventId, triggerTime },
        });

    return {
      message: 'Reminder scheduled successfully',
      reminderId: reminder.id,
      triggerTime: reminder.triggerTime,
    };
  }

  private normalizeTriggerTime(date: Date): Date {
    const normalized = new Date(date);
    normalized.setSeconds(0, 0);
    return normalized;
  }

  @Cron('*/5 * * * *')
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
      } catch (err) {
        console.error(`Failed to dispatch reminder ID: ${reminder.id}`, err);
      }
    }
  }

  private async dispatchNotification(reminder: {
    id: string;
    user: { name: string; email: string };
    event: { title: string; date: Date; location: string };
  }) {
    await this.mailService.sendEventReminder(
      reminder.user.email,
      reminder.user.name,
      reminder.event,
    );

    await this.prisma.reminder.update({
      where: { id: reminder.id },
      data: { sent: true },
    });
  }
}
