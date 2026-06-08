import { PaymentService } from './payment.service';
import { InitializePaymentDto } from './dto/initialize-payment.dto';
export declare class PaymentController {
    private paymentService;
    constructor(paymentService: PaymentService);
    initializePayment(dto: InitializePaymentDto, userId: string, email: string): Promise<{
        message: string;
        reference: string;
        isFree: boolean;
        redirectUrl: any;
    }>;
    verifyPayment(reference: string, userId: string): Promise<({
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
    getCreatorPayments(creatorId: string): Promise<({
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
    handleWebhook(req: any, signature: string): Promise<{
        status: string;
    }>;
    reconcilePending(): Promise<{
        processed: number;
        fulfilled: number;
        results: {
            reference: string;
            status: string;
            error?: string;
        }[];
    }>;
}
