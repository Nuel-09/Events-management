import { NotificationService } from './notification.service';
import { CustomReminderDto } from './dto/custom-reminder.dto';
export declare class NotificationController {
    private notificationService;
    constructor(notificationService: NotificationService);
    scheduleCustomReminder(eventId: string, dto: CustomReminderDto, userId: string): Promise<{
        message: string;
        reminderId: string;
        triggerTime: Date;
    }>;
}
