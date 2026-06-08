import { PrismaService } from '../prisma/prisma.service';
import { InitializePaymentDto } from './dto/initialize-payment.dto';
import { MailService } from '../mail/mail.service';
export declare class PaymentService {
    private prisma;
    private mailService;
    private readonly paystackUrl;
    private readonly clientUrl;
    constructor(prisma: PrismaService, mailService: MailService);
    private get paystackHeaders();
    initializePayment(userId: string, email: string, dto: InitializePaymentDto): Promise<{
        message: string;
        reference: string;
        isFree: boolean;
        redirectUrl: any;
    }>;
    verifyPaystackWebhook(rawBody: string, signature: string): Promise<{
        status: string;
    }>;
    verifyAndFulfillByReference(reference: string, userId?: string): Promise<({
        event: {
            id: string;
            title: string;
            date: Date;
            location: string;
            price: number;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        paymentReference: string;
        status: import(".prisma/client").$Enums.TicketStatus;
        verificationToken: string;
        qrCodeUrl: string | null;
        scanned: boolean;
        scannedAt: Date | null;
        eventId: string;
        userId: string;
    }) | null>;
    private fulfillTicket;
    getCreatorPaymentDetails(creatorId: string): Promise<({
        event: {
            id: string;
            title: string;
            price: number;
        };
        user: {
            email: string;
            id: string;
            name: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        paymentReference: string;
        status: import(".prisma/client").$Enums.TicketStatus;
        verificationToken: string;
        qrCodeUrl: string | null;
        scanned: boolean;
        scannedAt: Date | null;
        eventId: string;
        userId: string;
    })[]>;
    reconcilePendingPayments(limit?: number): Promise<{
        processed: number;
        fulfilled: number;
        results: {
            reference: string;
            status: string;
            error?: string;
        }[];
    }>;
}
