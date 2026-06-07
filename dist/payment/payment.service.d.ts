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
    verifyAndFulfillByReference(reference: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        eventId: string;
        paymentReference: string;
        status: import("@prisma/client").$Enums.TicketStatus;
        verificationToken: string;
        qrCodeUrl: string | null;
        scanned: boolean;
        scannedAt: Date | null;
        userId: string;
    }>;
    private fulfillTicket;
    getCreatorPaymentDetails(creatorId: string): Promise<({
        user: {
            email: string;
            name: string;
            id: string;
        };
        event: {
            title: string;
            id: string;
            price: number;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        eventId: string;
        paymentReference: string;
        status: import("@prisma/client").$Enums.TicketStatus;
        verificationToken: string;
        qrCodeUrl: string | null;
        scanned: boolean;
        scannedAt: Date | null;
        userId: string;
    })[]>;
}
