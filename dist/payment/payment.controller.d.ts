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
    verifyPayment(reference: string): Promise<{
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
    getCreatorPayments(creatorId: string): Promise<({
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
    handleWebhook(req: any, signature: string): Promise<{
        status: string;
    }>;
}
