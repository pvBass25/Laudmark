import { Resend } from 'resend'

let _resend: Resend | null = null
function getResend() {
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY!)
  return _resend
}
const FROM = () => process.env.RESEND_FROM ?? 'Trustwall <hello@trustwall.app>'

function baseHtml(body: string, unsubscribeNote?: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:system-ui,-apple-system,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;border:1px solid #e5e7eb;padding:32px;max-width:600px;width:100%;">
        <tr><td style="color:#374151;font-size:15px;line-height:1.7;">
          ${body}
        </td></tr>
        ${unsubscribeNote ? `
        <tr><td style="padding-top:24px;border-top:1px solid #f3f4f6;margin-top:24px;font-size:12px;color:#9ca3af;">
          ${unsubscribeNote}
        </td></tr>` : ''}
      </table>
    </td></tr>
  </table>
</body>
</html>`
}

export async function sendRequestEmail(opts: {
  to: string
  subject: string
  bodyText: string
  link: string
}) {
  const bodyHtml = opts.bodyText
    .split('\n')
    .map(line => line.trim() ? `<p style="margin:0 0 12px;">${line}</p>` : '')
    .join('')

  const html = baseHtml(
    `${bodyHtml}
     <p style="margin:16px 0 0;">
       <a href="${opts.link}" style="display:inline-block;background:#6366f1;color:#ffffff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;">
         Leave a testimonial →
       </a>
     </p>`,
    `You received this because you\'re a customer. <a href="#" style="color:#6366f1;">Unsubscribe</a>`
  )

  return getResend().emails.send({
    from: FROM(),
    to: opts.to,
    subject: opts.subject,
    html,
    text: opts.bodyText + `\n\nLeave a testimonial: ${opts.link}`,
  })
}

export async function sendApprovedEmail(opts: {
  to: string
  authorName: string
  brandName: string
}) {
  const html = baseHtml(`
    <h2 style="margin:0 0 16px;font-size:20px;color:#111827;">Thank you, ${opts.authorName}! 🙏</h2>
    <p style="margin:0 0 12px;">Your testimonial for <strong>${opts.brandName}</strong> has been approved and is now live.</p>
    <p style="margin:0;color:#6b7280;font-size:14px;">We really appreciate you taking the time to share your experience.</p>
  `)

  return getResend().emails.send({
    from: FROM(),
    to: opts.to,
    subject: `Your testimonial is live! 🎉`,
    html,
  })
}
