"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.layout = layout;
exports.welcomeEmail = welcomeEmail;
exports.ticketConfirmedEmail = ticketConfirmedEmail;
exports.paymentReceiptEmail = paymentReceiptEmail;
exports.eventReminderEmail = eventReminderEmail;
exports.domainTestEmail = domainTestEmail;
function layout(content, clientUrl) {
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Eventful</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
          <tr>
            <td style="padding:28px 32px 8px;text-align:center;">
              <h1 style="margin:0;font-size:24px;font-weight:800;color:#18181b;">Eventful</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:8px 32px 32px;">
              ${content}
            </td>
          </tr>
          <tr>
            <td style="padding:20px 32px;background:#fafafa;border-top:1px solid #e4e4e7;text-align:center;">
              <p style="margin:0 0 8px;font-size:12px;color:#71717a;">© 2026 Eventful. All rights reserved.</p>
              <a href="${clientUrl}" style="font-size:12px;color:#059669;text-decoration:none;">youreventful.org</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
function welcomeEmail(name, clientUrl) {
    return layout(`<h2 style="margin:0 0 16px;font-size:22px;color:#18181b;">Welcome to Eventful!</h2>
     <p style="margin:0 0 12px;color:#52525b;line-height:1.6;">Hi ${name.toUpperCase()},</p>
     <p style="margin:0 0 24px;color:#52525b;line-height:1.6;">Thanks for joining Eventful! You're all set to discover amazing events, purchase tickets, and much more.</p>
     <p style="text-align:center;margin:24px 0;">
       <a href="${clientUrl}/events" style="display:inline-block;padding:12px 28px;background:#4f46e5;color:#ffffff;text-decoration:none;border-radius:8px;font-weight:600;">Explore Events</a>
     </p>
     <p style="margin:0;color:#71717a;">Happy exploring!</p>`, clientUrl);
}
function ticketConfirmedEmail(name, event, clientUrl) {
    const formattedDate = new Date(event.date).toLocaleString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
    const amount = event.price === 0 ? 'FREE' : `NGN ${event.price.toLocaleString()}`;
    return layout(`<h2 style="margin:0 0 16px;font-size:22px;color:#18181b;">Ticket Confirmed!</h2>
     <p style="margin:0 0 12px;color:#52525b;line-height:1.6;">Hi ${name.toUpperCase()},</p>
     <p style="margin:0 0 20px;color:#52525b;line-height:1.6;">Great news! Your ticket for <strong>${event.title}</strong> has been confirmed.</p>
     <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;border-radius:8px;padding:16px;margin-bottom:24px;">
       <tr><td style="padding:8px 16px;color:#71717a;font-size:13px;">Event</td><td style="padding:8px 16px;color:#18181b;font-weight:600;">${event.title}</td></tr>
       <tr><td style="padding:8px 16px;color:#71717a;font-size:13px;">Date</td><td style="padding:8px 16px;color:#18181b;">${formattedDate}</td></tr>
       <tr><td style="padding:8px 16px;color:#71717a;font-size:13px;">Location</td><td style="padding:8px 16px;color:#18181b;">${event.location}</td></tr>
       <tr><td style="padding:8px 16px;color:#71717a;font-size:13px;">Amount</td><td style="padding:8px 16px;color:#059669;font-weight:700;">${amount}</td></tr>
     </table>
     <p style="text-align:center;margin:24px 0;">
       <a href="${clientUrl}/tickets" style="display:inline-block;padding:12px 28px;background:#4f46e5;color:#ffffff;text-decoration:none;border-radius:8px;font-weight:600;">View My Tickets</a>
     </p>`, clientUrl);
}
function paymentReceiptEmail(name, amount, reference, eventTitle, clientUrl) {
    return layout(`<h2 style="margin:0 0 16px;font-size:22px;color:#18181b;">Payment Receipt</h2>
     <p style="margin:0 0 12px;color:#52525b;line-height:1.6;">Hi ${name},</p>
     <p style="margin:0 0 20px;color:#52525b;line-height:1.6;">Your payment for <strong>${eventTitle}</strong> was successful.</p>
     <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;border-radius:8px;padding:16px;margin-bottom:24px;">
       <tr><td style="padding:8px 16px;color:#71717a;font-size:13px;">Reference</td><td style="padding:8px 16px;color:#18181b;font-family:monospace;">${reference}</td></tr>
       <tr><td style="padding:8px 16px;color:#71717a;font-size:13px;">Amount</td><td style="padding:8px 16px;color:#059669;font-weight:700;">NGN ${amount.toLocaleString()}</td></tr>
     </table>
     <p style="text-align:center;margin:24px 0;">
       <a href="${clientUrl}/tickets" style="display:inline-block;padding:12px 28px;background:#4f46e5;color:#ffffff;text-decoration:none;border-radius:8px;font-weight:600;">View My Tickets</a>
     </p>`, clientUrl);
}
function eventReminderEmail(name, event, clientUrl) {
    const formattedDate = new Date(event.date).toLocaleString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
    return layout(`<h2 style="margin:0 0 16px;font-size:22px;color:#18181b;">Event Reminder</h2>
     <p style="margin:0 0 12px;color:#52525b;line-height:1.6;">Hi ${name},</p>
     <p style="margin:0 0 20px;color:#52525b;line-height:1.6;">This is a reminder that <strong>${event.title}</strong> is coming up soon. Make sure you have your QR ticket ready!</p>
     <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;border-radius:8px;padding:16px;margin-bottom:24px;">
       <tr><td style="padding:8px 16px;color:#71717a;font-size:13px;">Event</td><td style="padding:8px 16px;color:#18181b;font-weight:600;">${event.title}</td></tr>
       <tr><td style="padding:8px 16px;color:#71717a;font-size:13px;">Date</td><td style="padding:8px 16px;color:#18181b;">${formattedDate}</td></tr>
       <tr><td style="padding:8px 16px;color:#71717a;font-size:13px;">Location</td><td style="padding:8px 16px;color:#18181b;">${event.location}</td></tr>
     </table>
     <p style="text-align:center;margin:24px 0;">
       <a href="${clientUrl}/tickets" style="display:inline-block;padding:12px 28px;background:#4f46e5;color:#ffffff;text-decoration:none;border-radius:8px;font-weight:600;">View My Tickets</a>
     </p>`, clientUrl);
}
function domainTestEmail(name, clientUrl) {
    return layout(`<h2 style="margin:0 0 16px;font-size:22px;color:#18181b;">Custom domain test</h2>
     <p style="margin:0 0 12px;color:#52525b;line-height:1.6;">Hi ${name},</p>
     <p style="margin:0 0 20px;color:#52525b;line-height:1.6;">If you received this email, Eventful is successfully sending from your custom domain via Resend. Replies to automated mail are routed to <strong>support@youreventful.org</strong>.</p>
     <p style="text-align:center;margin:24px 0;">
       <a href="${clientUrl}/events" style="display:inline-block;padding:12px 28px;background:#4f46e5;color:#ffffff;text-decoration:none;border-radius:8px;font-weight:600;">Open Eventful</a>
     </p>`, clientUrl);
}
//# sourceMappingURL=mail.templates.js.map