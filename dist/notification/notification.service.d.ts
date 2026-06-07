import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
export declare class NotificationService {
    private prisma;
    private mailService;
    constructor(prisma: PrismaService, mailService: MailService);
    scheduleCustomReminder(userId: string, eventId: string, triggerTimeStr: string): Promise<{
        message: string;
        reminderId: string;
        triggerTime: Date;
    }>;
    handleRemindersCron(): Promise<void>;
    private dispatchNotification;
}
