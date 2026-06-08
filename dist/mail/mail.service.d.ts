import { ConfigService } from '@nestjs/config';
export declare class MailService {
    private configService;
    private readonly logger;
    private readonly resend;
    private readonly clientUrl;
    private readonly enabled;
    private readonly legacyFrom;
    constructor(configService: ConfigService);
    private resolveFrom;
    private send;
    private sendOrThrow;
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
    sendDomainTest(to: string, name: string): Promise<void>;
}
