import { ConfigService } from '@nestjs/config';
export declare class MailService {
    private configService;
    private readonly logger;
    private readonly resend;
    private readonly from;
    private readonly clientUrl;
    private readonly enabled;
    constructor(configService: ConfigService);
    private send;
    sendWelcome(to: string, name: string): Promise<void>;
    sendTicketConfirmed(to: string, name: string, event: {
        title: string;
        date: Date | string;
        location: string;
        price: number;
    }): Promise<void>;
    sendPaymentReceipt(to: string, name: string, amount: number, reference: string, eventTitle: string): Promise<void>;
    sendEventReminder(to: string, name: string, event: {
        title: string;
        date: Date | string;
        location: string;
    }): Promise<void>;
}
