import { ConfigService } from '@nestjs/config';
export type MailSender = 'transactional' | 'support' | 'newsletter' | 'personal';
export interface MailAddress {
    from: string;
    replyTo: string;
}
export declare function resolveMailAddress(config: ConfigService, sender: MailSender): MailAddress;
