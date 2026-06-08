export declare function layout(content: string, clientUrl: string): string;
export declare function welcomeEmail(name: string, clientUrl: string): string;
export declare function ticketConfirmedEmail(name: string, event: {
    title: string;
    date: string;
    location: string;
    price: number;
}, clientUrl: string): string;
export declare function paymentReceiptEmail(name: string, amount: number, reference: string, eventTitle: string, clientUrl: string): string;
export declare function eventReminderEmail(name: string, event: {
    title: string;
    date: string;
    location: string;
}, clientUrl: string): string;
export declare function domainTestEmail(name: string, clientUrl: string): string;
