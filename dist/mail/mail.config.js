"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveMailAddress = resolveMailAddress;
function resolveMailAddress(config, sender) {
    const domain = config.get('MAIL_DOMAIN') || 'youreventful.org';
    const brand = config.get('MAIL_FROM_NAME') || 'Eventful';
    const defaultReplyTo = config.get('MAIL_REPLY_TO') || `support@${domain}`;
    const addresses = {
        transactional: config.get('MAIL_FROM_TRANSACTIONAL') || `no-reply@${domain}`,
        support: config.get('MAIL_FROM_SUPPORT') || `support@${domain}`,
        newsletter: config.get('MAIL_FROM_NEWSLETTER') || `newsletter@${domain}`,
        personal: config.get('MAIL_FROM_PERSONAL') || `emmanuel@${domain}`,
    };
    const email = addresses[sender];
    const replyTo = sender === 'transactional' || sender === 'newsletter'
        ? defaultReplyTo
        : email;
    return {
        from: `${brand} <${email}>`,
        replyTo,
    };
}
//# sourceMappingURL=mail.config.js.map