import { ConfigService } from '@nestjs/config';

export type MailSender = 'transactional' | 'support' | 'newsletter' | 'personal';

export interface MailAddress {
  from: string;
  replyTo: string;
}

/**
 * Resolves branded From + Reply-To addresses for youreventful.org (or MAIL_DOMAIN).
 * Transactional mail uses no-reply@ with replies routed to support@.
 */
export function resolveMailAddress(
  config: ConfigService,
  sender: MailSender,
): MailAddress {
  const domain = config.get<string>('MAIL_DOMAIN') || 'youreventful.org';
  const brand = config.get<string>('MAIL_FROM_NAME') || 'Eventful';
  const defaultReplyTo =
    config.get<string>('MAIL_REPLY_TO') || `support@${domain}`;

  const addresses: Record<MailSender, string> = {
    transactional:
      config.get<string>('MAIL_FROM_TRANSACTIONAL') || `no-reply@${domain}`,
    support: config.get<string>('MAIL_FROM_SUPPORT') || `support@${domain}`,
    newsletter:
      config.get<string>('MAIL_FROM_NEWSLETTER') || `newsletter@${domain}`,
    personal:
      config.get<string>('MAIL_FROM_PERSONAL') || `emmanuel@${domain}`,
  };

  const email = addresses[sender];
  const replyTo =
    sender === 'transactional' || sender === 'newsletter'
      ? defaultReplyTo
      : email;

  return {
    from: `${brand} <${email}>`,
    replyTo,
  };
}
